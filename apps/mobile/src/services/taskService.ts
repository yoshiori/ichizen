import { db } from '../config/firebase';
import { Task } from '../types/firebase';

/**
 * Task management service
 * Handles all task-related Firestore operations
 */

export const getTasks = async (): Promise<Task[]> => {
  const tasksSnapshot = await db.collection('tasks').get();
  return tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
};

export const getTask = async (taskId: string): Promise<Task | null> => {
  const taskDoc = await db.collection('tasks').doc(taskId).get();
  return taskDoc.exists() ? { id: taskDoc.id, ...taskDoc.data() } as Task : null;
};