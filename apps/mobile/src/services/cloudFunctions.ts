/**
 * Cloud Functions サービス層
 * Firebase Cloud Functions との通信を管理
 */

import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { app } from '../config/firebase';
import { Task } from '../types/firebase';

// 関数インスタンスを遅延初期化
let functions: ReturnType<typeof getFunctions> | null = null;

const getFunctionsInstance = () => {
  if (!functions) {
    functions = getFunctions(app, 'asia-northeast1');
    
    // 開発環境でエミュレータに接続（Web上のlocalhostでのみ）
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

// Cloud Functions の型定義
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
 * 今日のお題を取得
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
 * タスクを完了状態にする
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
 * グローバルカウンターを取得
 */
export const getGlobalCounterFromCloudFunctions = async (): Promise<number> => {
  // 直接 Firestore から取得（Cloud Functions 経由ではなく）
  const { getGlobalCounter } = await import('./firestore');
  const counter = await getGlobalCounter();
  return counter?.todayCompleted || 0;
};