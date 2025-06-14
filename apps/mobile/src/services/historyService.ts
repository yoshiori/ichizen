import { db } from '../config/firebase';
import { DailyTaskHistory, Task } from '../types/firebase';
import { getTask } from './taskService';

/**
 * Task history management service
 * Handles all task history-related Firestore operations
 */

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