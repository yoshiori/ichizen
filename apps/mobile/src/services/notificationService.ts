/**
 * Notification service
 * Manages follower notifications when tasks are completed
 */

import { callFunction } from './cloudFunctions';
import { getFollowers } from './firestore';

export interface NotificationData {
  type: 'follow_task_completed' | 'new_follower';
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  data?: {
    taskId?: string;
    taskTitle?: string;
    [key: string]: any;
  };
}

export interface NotificationTriggerResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface TaskCompletionResult {
  success: boolean;
  notificationsSent: number;
  errors?: string[];
  error?: string;
}

/**
 * Validate notification data
 */
const validateNotificationData = (data: NotificationData): boolean => {
  if (!data.type || !data.fromUserId || !data.fromUserName || !data.toUserId) {
    return false;
  }

  const validTypes = ['follow_task_completed', 'new_follower'];
  return validTypes.includes(data.type);
};

/**
 * Trigger follow notification
 */
export const triggerFollowNotification = async (
  notificationData: NotificationData
): Promise<NotificationTriggerResult> => {
  try {
    // Validate data
    if (!validateNotificationData(notificationData)) {
      return {
        success: false,
        error: 'Invalid notification data - validation failed'
      };
    }

    // Call Cloud Function to send notification
    const result = await callFunction('sendFollowNotification', notificationData);
    
    return {
      success: true,
      messageId: result.messageId
    };

  } catch (error) {
    console.error('❌ Error triggering follow notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Handle notifications to all followers when task is completed
 */
export const handleTaskCompletion = async (
  userId: string,
  userName: string,
  taskId: string,
  taskTitle: string
): Promise<TaskCompletionResult> => {
  try {
    // Get list of followers
    const followers = await getFollowers(userId);
    
    if (followers.length === 0) {
      return {
        success: true,
        notificationsSent: 0
      };
    }

    console.log(`📱 Sending notifications to ${followers.length} followers`);

    // Send notification to each follower
    const notificationPromises = followers.map(async (follower) => {
      const notificationData: NotificationData = {
        type: 'follow_task_completed',
        fromUserId: userId,
        fromUserName: userName,
        toUserId: follower.followerId,
        data: {
          taskId,
          taskTitle
        }
      };

      const result = await triggerFollowNotification(notificationData);
      
      if (result.success) {
        return { success: true };
      } else {
        console.error(`❌ Failed to send notification to ${follower.followerId}:`, result.error);
        return { 
          success: false, 
          error: result.error || 'Unknown error'
        };
      }
    });

    // Execute all notification sends in parallel
    const results = await Promise.all(notificationPromises);
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success);
    const errors = failed.map(f => f.error).filter(Boolean) as string[];

    return {
      success: true,
      notificationsSent: successful,
      errors: errors.length > 0 ? errors : undefined
    };

  } catch (error) {
    console.error('❌ Error handling task completion notifications:', error);
    return {
      success: false,
      notificationsSent: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Send new follower notification
 */
export const sendNewFollowerNotification = async (
  fromUserId: string,
  fromUserName: string,
  toUserId: string
): Promise<NotificationTriggerResult> => {
  const notificationData: NotificationData = {
    type: 'new_follower',
    fromUserId,
    fromUserName,
    toUserId,
    data: {}
  };

  return triggerFollowNotification(notificationData);
};