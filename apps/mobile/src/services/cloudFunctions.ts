/**
 * Cloud Functions Service Layer
 * Manages communication with Firebase Cloud Functions
 */

import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { app } from '../config/firebase';
import { Task } from '../types/firebase';

// Lazy initialization of functions instance
let functions: ReturnType<typeof getFunctions> | null = null;

const getFunctionsInstance = () => {
  if (!functions) {
    functions = getFunctions(app, 'asia-northeast1');
    
    // Connect to emulator in development environment (localhost web only)
    const USE_EMULATOR = __DEV__ && (typeof window !== 'undefined' && window.location.hostname === 'localhost');
    
    if (USE_EMULATOR) {
      try {
        connectFunctionsEmulator(functions, 'localhost', 5001);
        console.log('🔧 Connected to Cloud Functions emulator (port 5001)');
      } catch (error) {
        console.log('Functions emulator already connected:', error);
      }
    } else {
      console.log('🚀 Connected to production Cloud Functions (asia-northeast1)');
    }
  }
  return functions;
};

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
 * Get today's task
 */
export const getTodayTask = async (): Promise<GetTodayTaskResponse> => {
  const functionsInstance = getFunctionsInstance();
  const getTodayTaskFunction = httpsCallable<void, GetTodayTaskResponse>(
    functionsInstance, 
    'getTodayTask'
  );
  
  try {
    const result = await getTodayTaskFunction();
    return result.data;
  } catch (error) {
    console.error('Error getting today task:', error);
    throw error;
  }
};

/**
 * Mark task as completed
 */
export const completeTask = async (): Promise<CompleteTaskResponse> => {
  const functionsInstance = getFunctionsInstance();
  const completeTaskFunction = httpsCallable<void, CompleteTaskResponse>(
    functionsInstance,
    'completeTask'
  );
  
  try {
    const result = await completeTaskFunction();
    return result.data;
  } catch (error) {
    console.error('Error completing task:', error);
    throw error;
  }
};

/**
 * Get global counter
 */
export const getGlobalCounterFromCloudFunctions = async (): Promise<number> => {
  // Get directly from Firestore (not via Cloud Functions)
  const { getGlobalCounter } = await import('./firestore');
  const counter = await getGlobalCounter();
  return counter?.todayCompleted || 0;
};

/**
 * Generic function to call any Cloud Function
 */
export const callFunction = async <T = any, R = any>(
  functionName: string, 
  data?: T
): Promise<R> => {
  const functionsInstance = getFunctionsInstance();
  const cloudFunction = httpsCallable<T, R>(functionsInstance, functionName);
  
  try {
    const result = await cloudFunction(data);
    return result.data;
  } catch (error) {
    console.error(`Error calling Cloud Function ${functionName}:`, error);
    throw error;
  }
};