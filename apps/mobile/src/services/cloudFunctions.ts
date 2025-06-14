/**
 * Cloud Functions Service Layer (React Native Firebase)
 * Environment-aware connection to Cloud Functions
 */

import {cloudFunctions} from "../config/firebase";
import {Task} from "../types/firebase";

// Cloud Functions type definitions
interface GetTodayTaskResponse {
  task: Task & {id: string};
  completed: boolean;
  selectedAt: Date;
  simplified?: boolean;
  historyId?: string;
}

interface CompleteTaskResponse {
  success: boolean;
  completedAt: Date;
}

// Get Cloud Functions instance (configured in firebase.ts)
const functionsInstance = cloudFunctions.region("asia-northeast1");

/**
 * Get today's task from Cloud Functions
 */
export const getTodayTask = async (): Promise<GetTodayTaskResponse> => {
  try {
    console.log("📞 Calling getTodayTask Cloud Function...");
    const callable = functionsInstance.httpsCallable("getTodayTask");
    const result = await callable();

    console.log("✅ getTodayTask response:", result.data);
    return result.data as GetTodayTaskResponse;
  } catch (error) {
    console.error("❌ getTodayTask Cloud Function error:", error);
    throw error;
  }
};

/**
 * Complete task via Cloud Functions
 */
export const completeTask = async (historyId: string): Promise<CompleteTaskResponse> => {
  try {
    console.log("📞 Calling completeTask Cloud Function with historyId:", historyId);
    const callable = functionsInstance.httpsCallable("completeTask");
    const result = await callable({historyId});

    console.log("✅ completeTask response:", result.data);
    return result.data as CompleteTaskResponse;
  } catch (error) {
    console.error("❌ completeTask Cloud Function error:", error);
    throw error;
  }
};
