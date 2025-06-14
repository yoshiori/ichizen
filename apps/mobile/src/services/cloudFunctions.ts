/**
 * Cloud Functions Service Layer (React Native Stub)
 * Cloud Functions not supported in React Native Firebase
 * Using stubs for compatibility
 */

import { Task } from '../types/firebase';

// Cloud Functions type definitions
interface GetTodayTaskResponse {
  task: Task & { id: string };
  completed: boolean;
  selectedAt: Date;
  simplified?: boolean;
  historyId?: string;
}

interface CompleteTaskResponse {
  success: boolean;
  completedAt: Date;
}

/**
 * Get today's task (Stub)
 */
export const getTodayTask = async (): Promise<GetTodayTaskResponse> => {
  // Stub implementation
  throw new Error('Cloud Functions not supported in React Native. Use direct Firestore calls.');
};

/**
 * Complete task (Stub)
 */
export const completeTask = async (historyId: string): Promise<CompleteTaskResponse> => {
  // Stub implementation
  throw new Error('Cloud Functions not supported in React Native. Use direct Firestore calls.');
};