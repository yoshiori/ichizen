import { db } from '../config/firebase';
import { User, Task, DailyTaskHistory, GlobalCounter, Follow } from '../types/firebase';

// Users collection
export const createUser = async (userId: string, userData: Omit<User, 'id'>) => {
  await db.collection('users').doc(userId).set(userData);
};

export const getUser = async (userId: string): Promise<User | null> => {
  const userDoc = await db.collection('users').doc(userId).get();
  return userDoc.exists ? { id: userDoc.id, ...userDoc.data() } as User : null;
};

export const updateUser = async (userId: string, updates: Partial<User>) => {
  await db.collection('users').doc(userId).update(updates);
};

export const updateUserFCMToken = async (userId: string, fcmToken: string) => {
  await db.collection('users').doc(userId).update({ fcmToken });
};

// Tasks collection
export const getTasks = async (): Promise<Task[]> => {
  const tasksSnapshot = await db.collection('tasks').get();
  return tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
};

export const getTask = async (taskId: string): Promise<Task | null> => {
  const taskDoc = await db.collection('tasks').doc(taskId).get();
  return taskDoc.exists ? { id: taskDoc.id, ...taskDoc.data() } as Task : null;
};

// Daily task history
export const addDailyTaskHistory = async (historyData: Omit<DailyTaskHistory, 'id'>) => {
  await db.collection('daily_task_history').add(historyData);
};

export const getUserTaskHistory = async (userId: string, dateString: string): Promise<DailyTaskHistory | null> => {
  const snapshot = await db.collection('daily_task_history')
    .where('userId', '==', userId)
    .where('date', '==', dateString)
    .limit(1)
    .get();
  
  return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as DailyTaskHistory;
};

export const getUserTaskHistoryRange = async (userId: string, startDate: string, endDate: string): Promise<DailyTaskHistory[]> => {
  const snapshot = await db.collection('daily_task_history')
    .where('userId', '==', userId)
    .where('date', '>=', startDate)
    .where('date', '<=', endDate)
    .orderBy('date', 'desc')
    .get();
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyTaskHistory));
};

export const getUserTaskHistoryWithTasks = async (userId: string, startDate: string, endDate: string): Promise<(DailyTaskHistory & { task: Task })[]> => {
  const history = await getUserTaskHistoryRange(userId, startDate, endDate);
  
  // Fetch task details for each history entry
  const historyWithTasks = await Promise.all(
    history.map(async (entry) => {
      const task = await getTask(entry.taskId);
      return { ...entry, task } as DailyTaskHistory & { task: Task };
    })
  );
  
  // Filter out entries where task couldn't be found
  return historyWithTasks.filter(entry => entry.task !== null);
};

export const markTaskAsCompleted = async (historyId: string) => {
  await db.collection('daily_task_history').doc(historyId).update({
    completed: true,
    completedAt: new Date()
  });
};

// Global counter
export const getGlobalCounter = async (date: string): Promise<GlobalCounter | null> => {
  const counterDoc = await db.collection('global_counters').doc(date).get();
  return counterDoc.exists ? { id: counterDoc.id, ...counterDoc.data() } as GlobalCounter : null;
};

export const incrementGlobalCounter = async (date: string) => {
  const counterRef = db.collection('global_counters').doc(date);
  const counterDoc = await counterRef.get();
  
  if (counterDoc.exists) {
    await counterRef.update({
      totalDoneToday: (counterDoc.data()?.totalDoneToday || 0) + 1,
      totalDoneAllTime: (counterDoc.data()?.totalDoneAllTime || 0) + 1,
      lastUpdated: new Date()
    });
  } else {
    await counterRef.set({
      date,
      totalDoneToday: 1,
      totalDoneAllTime: 1,
      lastUpdated: new Date()
    });
  }
};

// Follow functionality
export const followUser = async (followerId: string, followeeId: string) => {
  await db.collection('follows').add({
    followerId,
    followeeId,
    createdAt: new Date()
  });
};

export const unfollowUser = async (followerId: string, followeeId: string) => {
  const followsSnapshot = await db.collection('follows')
    .where('followerId', '==', followerId)
    .where('followeeId', '==', followeeId)
    .limit(1)
    .get();
  
  if (!followsSnapshot.empty) {
    await followsSnapshot.docs[0].ref.delete();
  }
};

export const getFollowedUsers = async (followerId: string): Promise<string[]> => {
  const followsSnapshot = await db.collection('follows')
    .where('followerId', '==', followerId)
    .get();
  
  return followsSnapshot.docs.map(doc => doc.data().followeeId);
};

export const getFollowers = async (followeeId: string): Promise<string[]> => {
  const followsSnapshot = await db.collection('follows')
    .where('followeeId', '==', followeeId)
    .get();
  
  return followsSnapshot.docs.map(doc => doc.data().followerId);
};

export const getFollowing = async (followerId: string): Promise<Follow[]> => {
  const followsSnapshot = await db.collection('follows')
    .where('followerId', '==', followerId)
    .orderBy('createdAt', 'desc')
    .get();
  
  return followsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Follow));
};

export const isFollowing = async (followerId: string, followeeId: string): Promise<boolean> => {
  const followsSnapshot = await db.collection('follows')
    .where('followerId', '==', followerId)
    .where('followeeId', '==', followeeId)
    .limit(1)
    .get();
  
  return !followsSnapshot.empty;
};