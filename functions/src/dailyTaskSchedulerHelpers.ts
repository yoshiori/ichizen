/**
 * Helper functions for dailyTaskScheduler
 * Implements user-specific task selection and notification delivery
 */

import * as admin from 'firebase-admin';

const db = admin.firestore();

export interface UserTaskPreferences {
  id: string;
  language: 'ja' | 'en';
  preferences?: {
    preferredCategories?: string[];
  };
  notificationSettings?: {
    dailyReminder?: boolean;
  };
}

export interface Task {
  id: string;
  text: {
    ja: string;
    en: string;
  };
  category: {
    ja: string;
    en: string;
  };
  icon?: string;
}

export interface UserForNotification {
  id: string;
  fcmToken: string;
  language: 'ja' | 'en';
}

export interface NotificationResult {
  successCount: number;
  failureCount: number;
  responses?: any[];
}

/**
 * Select optimal daily task for a specific user based on their history and preferences
 */
export const selectDailyTaskForUser = async (user: UserTaskPreferences): Promise<Task> => {
  try {
    console.log(`Selecting task for user: ${user.id}`);

    // Get user's recent task history (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    const historySnapshot = await db.collection('daily_task_history')
      .where('userId', '==', user.id)
      .where('date', '>=', sevenDaysAgoStr)
      .orderBy('date', 'desc')
      .limit(10)
      .get();

    const recentTaskIds = historySnapshot.docs.map(doc => doc.data().taskId);
    console.log(`User ${user.id} recent tasks:`, recentTaskIds);

    // Get all available tasks
    const tasksSnapshot = await db.collection('tasks').get();
    const allTasks = tasksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Task[];

    if (allTasks.length === 0) {
      throw new Error('No tasks available');
    }

    // Filter out recently used tasks
    const availableTasks = allTasks.filter(task => !recentTaskIds.includes(task.id));
    
    // If all tasks were recently used, use all tasks (rare case)
    const candidateTasks = availableTasks.length > 0 ? availableTasks : allTasks;

    // Apply user preferences if available
    let preferredTasks = candidateTasks;
    if (user.preferences?.preferredCategories && user.preferences.preferredCategories.length > 0) {
      const categoryFiltered = candidateTasks.filter(task => {
        const categoryEn = task.category.en.toLowerCase();
        return user.preferences!.preferredCategories!.some(pref => 
          categoryEn.includes(pref.toLowerCase())
        );
      });
      
      // Use preferred categories if available, otherwise fallback to all candidates
      if (categoryFiltered.length > 0) {
        preferredTasks = categoryFiltered;
      }
    }

    // Randomly select from preferred tasks
    const selectedTask = preferredTasks[Math.floor(Math.random() * preferredTasks.length)];
    
    console.log(`Selected task ${selectedTask.id} for user ${user.id}`);
    return selectedTask;

  } catch (error) {
    console.error(`Error selecting task for user ${user.id}:`, error);
    throw error;
  }
};

/**
 * Get users who should receive daily task notifications
 */
export const getUsersForNotification = async (): Promise<UserForNotification[]> => {
  try {
    console.log('Getting users for notification...');

    // Get users who have notifications enabled and FCM tokens
    const usersSnapshot = await db.collection('users')
      .where('notificationSettings.dailyReminder', '==', true)
      .get();

    const users: UserForNotification[] = [];

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      
      // Only include users with valid FCM tokens
      if (userData.fcmToken && typeof userData.fcmToken === 'string') {
        users.push({
          id: doc.id,
          fcmToken: userData.fcmToken,
          language: userData.language || 'ja',
        });
      }
    }

    console.log(`Found ${users.length} users for notification`);
    return users;

  } catch (error) {
    console.error('Error getting users for notification:', error);
    throw error;
  }
};

/**
 * Send daily task notifications to multiple users
 */
export const sendDailyTaskNotifications = async (
  users: UserForNotification[],
  userTasks: Record<string, Task>
): Promise<NotificationResult> => {
  try {
    if (users.length === 0) {
      console.log('No users to send notifications to');
      return { successCount: 0, failureCount: 0 };
    }

    console.log(`Sending notifications to ${users.length} users`);

    // Create notification messages
    const tokens = users.map(user => user.fcmToken);
    
    // Create localized notification content
    // For now, using Japanese as default since most users are expected to be Japanese
    const notificationContent = {
      title: '🌟 今日の小さな善行',
      body: '新しい一日が始まりました！今日も小さな善行で世界を明るくしましょう。',
    };

    // Create FCM multicast message
    const message = {
      tokens,
      notification: notificationContent,
      data: {
        type: 'daily_task_reminder',
        timestamp: new Date().toISOString(),
      },
      android: {
        notification: {
          icon: 'ic_notification',
          color: '#4CAF50',
        },
      },
      apns: {
        payload: {
          aps: {
            badge: 1,
            sound: 'default',
          },
        },
      },
    };

    // Send notifications
    const response = await admin.messaging().sendEachForMulticast(message);
    
    console.log(`Notification sent: ${response.successCount} success, ${response.failureCount} failures`);

    // Log any failures for debugging
    if (response.failureCount > 0) {
      response.responses.forEach((resp, index) => {
        if (!resp.success) {
          console.error(`Failed to send to ${users[index].id}:`, resp.error);
        }
      });
    }

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses,
    };

  } catch (error) {
    console.error('Error sending daily task notifications:', error);
    throw error;
  }
};

/**
 * Store daily task selection for a user
 */
export const storeDailyTaskSelection = async (
  userId: string,
  task: Task,
  date: string
): Promise<void> => {
  try {
    const taskHistoryData = {
      userId,
      taskId: task.id,
      date,
      completed: false,
      selectedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('daily_task_history').add(taskHistoryData);
    console.log(`Stored task selection for user ${userId}: ${task.id}`);

  } catch (error) {
    console.error(`Error storing task selection for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Process daily task selection and notification for all users
 */
export const processDailyTasksForAllUsers = async (): Promise<{
  totalUsers: number;
  successfulSelections: number;
  notificationResults: NotificationResult;
}> => {
  try {
    console.log('Processing daily tasks for all users...');

    // Get users for notification
    const users = await getUsersForNotification();
    
    if (users.length === 0) {
      console.log('No users found for task processing');
      return {
        totalUsers: 0,
        successfulSelections: 0,
        notificationResults: { successCount: 0, failureCount: 0 },
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const userTasks: Record<string, Task> = {};
    let successfulSelections = 0;

    // Select task for each user and store selection
    for (const user of users) {
      try {
        // Get full user data for task selection
        const userDoc = await db.collection('users').doc(user.id).get();
        if (!userDoc.exists) {
          console.warn(`User ${user.id} not found, skipping`);
          continue;
        }

        const userData = userDoc.data()!;
        const userPreferences: UserTaskPreferences = {
          id: user.id,
          language: userData.language || 'ja',
          preferences: userData.preferences,
          notificationSettings: userData.notificationSettings,
        };

        // Select task for user
        const selectedTask = await selectDailyTaskForUser(userPreferences);
        userTasks[user.id] = selectedTask;

        // Store the task selection
        await storeDailyTaskSelection(user.id, selectedTask, today);
        successfulSelections++;

      } catch (error) {
        console.error(`Error processing task for user ${user.id}:`, error);
        // Continue processing other users even if one fails
      }
    }

    // Send notifications to all users
    const notificationResults = await sendDailyTaskNotifications(users, userTasks);

    console.log(`Daily task processing completed: ${successfulSelections}/${users.length} successful selections`);

    return {
      totalUsers: users.length,
      successfulSelections,
      notificationResults,
    };

  } catch (error) {
    console.error('Error processing daily tasks for all users:', error);
    throw error;
  }
};