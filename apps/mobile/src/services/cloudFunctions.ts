/**
 * Cloud Functions サービス層
 * Firebase Cloud Functions との通信を管理
 */

import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { app } from '../config/firebase';
import { Task } from '../types/firebase';

const functions = getFunctions(app, 'asia-northeast1');

// 開発環境でエミュレータに接続
if (__DEV__) {
  try {
    connectFunctionsEmulator(functions, 'localhost', 5001);
  } catch (error) {
    console.log('Functions emulator already connected:', error);
  }
}

// Cloud Functions の型定義
interface GetTodayTaskResponse {
  task: Task;
  completed: boolean;
  selectedAt: Date;
}

interface CompleteTaskResponse {
  success: boolean;
  completedAt: Date;
}

/**
 * 今日のお題を取得
 */
export const getTodayTask = async (): Promise<GetTodayTaskResponse> => {
  const getTodayTaskFunction = httpsCallable<void, GetTodayTaskResponse>(
    functions, 
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
  const completeTaskFunction = httpsCallable<void, CompleteTaskResponse>(
    functions,
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