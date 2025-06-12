/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

/**
 * Cloud Functions for "Today's Small Good Deed" App
 *
 * Main Features:
 * 1. Daily task selection and distribution
 * 2. Global counter management
 * 3. Follower notification system
 * 4. Data aggregation and analytics
 */

import {onSchedule} from "firebase-functions/v2/scheduler";
// import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {onCall} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Configuration for emulator usage
if (process.env.FIRESTORE_EMULATOR_HOST) {
  console.log("Using Firestore emulator at:",
    process.env.FIRESTORE_EMULATOR_HOST);
}
// GitHub Actions deployment test - IAM + Cloud Build permissions fix

/**
 * Scheduled task that runs daily at 6 AM JST
 * - Select and distribute today's task to all users
 * - Reset previous day's global counter
 */
export const dailyTaskScheduler = onSchedule({
  schedule: "0 6 * * *", // Daily at 6 AM UTC (3 PM JST)
  timeZone: "Asia/Tokyo",
  region: "asia-northeast1",
}, async (_event) => {
  console.log("Daily task scheduler started");

  try {
    // Get today's date
    const today = new Date().toISOString().split("T")[0];

    // Get previous day's total count
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split("T")[0];

    let totalAllTime = 0;
    try {
      const yesterdayDoc = await db.collection("global_counters")
        .doc(yesterdayString).get();
      if (yesterdayDoc.exists) {
        totalAllTime = yesterdayDoc.data()?.totalDoneAllTime || 0;
      }
    } catch (error) {
      console.log("Failed to get yesterday total, starting from 0:", error);
    }

    // Initialize global counter
    await db.collection("global_counters").doc(today).set({
      date: today,
      totalDoneToday: 0,
      totalDoneAllTime: totalAllTime,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Global counter initialized for ${today} ` +
      `with total: ${totalAllTime}`);

    // TODO: Implement user-specific task selection logic
    // TODO: Push notification delivery
  } catch (error) {
    console.error("Daily task scheduler error:", error);
    throw error;
  }
});

/**
 * Firestore trigger called when user completes a good deed
 * - Increment global counter
 * - Send notifications to followers
 *
 * TODO: Enable when Eventarc permissions are stable
 * Currently global counter update is implemented in completeTask function
 */
/*
export const onTaskCompleted = onDocumentCreated({
  document: "daily_task_history/{historyId}",
  region: "asia-northeast1",
}, async (event) => {
  console.log("Task completion detected");

  try {
    const data = event.data?.data();
    if (!data || !data.completed) {
      console.log("Task not completed or no data, skipping");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    // Increment global counter (only when completed)
    await db.collection("global_counters").doc(today).update({
      totalDoneToday: admin.firestore.FieldValue.increment(1),
      totalDoneAllTime: admin.firestore.FieldValue.increment(1),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Global counter incremented for ${today}`);

    // Send notifications to followers
    await sendFollowerNotifications(data.userId);
  } catch (error) {
    console.error("Task completion handler error:", error);
  }
});
*/

/**
 * Simple test function
 */
export const testFunction = onCall({
  region: "asia-northeast1",
}, async (_request) => {
  console.log("testFunction called");
  return {message: "Hello from Cloud Functions!"};
});

/**
 * Basic Firestore access test function
 */
export const testFirestore = onCall({
  region: "asia-northeast1",
}, async (_request) => {
  console.log("testFirestore called");

  try {
    console.log("Attempting to access Firestore...");
    console.log("FIRESTORE_EMULATOR_HOST:",
      process.env.FIRESTORE_EMULATOR_HOST);

    // Get directly from tasks collection
    const tasksSnapshot = await db.collection("tasks").limit(1).get();
    console.log("Tasks collection accessed successfully, docs:",
      tasksSnapshot.size);

    if (tasksSnapshot.empty) {
      console.log("No tasks found in collection");
      return {error: "No tasks in collection"};
    }

    const firstTask = tasksSnapshot.docs[0];
    console.log("First task data:", firstTask.data());

    return {
      success: true,
      taskCount: tasksSnapshot.size,
      firstTask: firstTask.data(),
    };
  } catch (error) {
    console.error("testFirestore error:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack",
    };
  }
});

/**
 * API for users to get today's task
 */
export const getTodayTask = onCall({
  region: "asia-northeast1",
}, async (request) => {
  console.log("getTodayTask called", {authUid: request.auth?.uid});

  try {
    const userId = request.auth?.uid;
    if (!userId) {
      console.error("No user ID in request");
      throw new Error("Authentication required");
    }

    console.log("User ID:", userId);
    const today = new Date().toISOString().split("T")[0];
    console.log("Today date:", today);

    // Simply select and return a task (history feature to be added later)
    console.log("Simplified: Getting all tasks...");
    const tasksSnapshot = await db.collection("tasks").get();
    console.log("Tasks available:", tasksSnapshot.size);

    if (tasksSnapshot.empty) {
      throw new Error("No tasks available");
    }

    // Randomly select a task
    const tasks = tasksSnapshot.docs;
    const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
    console.log("Selected task:", randomTask.id);

    return {
      task: {id: randomTask.id, ...randomTask.data()},
      completed: false,
      selectedAt: new Date(),
      simplified: true,
    };
  } catch (error) {
    console.error("Get today task error:", error);
    throw new Error(`getTodayTask error: ${error instanceof Error ?
      error.message : "Unknown error"}`);
  }
});

/**
 * API for when users complete a task
 */
export const completeTask = onCall({
  region: "asia-northeast1",
}, async (request) => {
  console.log("completeTask called", {authUid: request.auth?.uid});

  try {
    const userId = request.auth?.uid;
    if (!userId) {
      console.error("No user ID in completeTask request");
      throw new Error("Authentication required");
    }

    console.log("CompleteTask User ID:", userId);

    // Simplified version: simply return success
    // (history feature to be added later)
    console.log("Simplified completeTask: returning success");

    // Increment global counter (optional)
    const today = new Date().toISOString().split("T")[0];
    try {
      await db.collection("global_counters").doc(today).update({
        totalDoneToday: admin.firestore.FieldValue.increment(1),
        totalDoneAllTime: admin.firestore.FieldValue.increment(1),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log("Global counter updated");
    } catch (counterError) {
      console.log("Could not update global counter:", counterError);
      // Counter errors are not fatal
    }

    return {
      success: true,
      userId: userId,
      completedAt: new Date(),
      simplified: true,
    };
  } catch (error) {
    console.error("Complete task error:", error);
    throw new Error(`completeTask error: ${error instanceof Error ?
      error.message : "Unknown error"}`);
  }
});

/**
 * Function to send notifications to followers
 * @param {string} userId ID of the user who completed the good deed
 * TODO: Enable when Eventarc permissions are stable
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* async function sendFollowerNotifications(userId: string) {
  try {
    // Get user information
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      console.log("User not found:", userId);
      return;
    }


    // Get users who follow this user
    // Current data model uses users.followedUsers array
    const usersSnapshot = await db.collection("users")
      .where("followedUsers", "array-contains", userId)
      .get();

    if (usersSnapshot.empty) {
      console.log("No followers found for user:", userId);
      return;
    }

    // Get FCM tokens and user info for followers
    const followers = [];
    for (const doc of usersSnapshot.docs) {
      const followerData = doc.data();

      if (followerData?.fcmToken) {
        followers.push({
          id: doc.id,
          fcmToken: followerData.fcmToken,
          language: followerData.language || "ja",
        });
      }
    }

    if (followers.length === 0) {
      console.log("No followers with FCM tokens found");
      return;
    }

    // Multi-language support for notification messages
    const notificationMessages = {
      ja: {
        title: "🌟 善行達成！",
        body: "お疲れさまでした！今日の小さな善行を達成しました。",
      },
      en: {
        title: "🌟 Good Deed Completed!",
        body: "Well done! A good deed has been completed today.",
      },
    };

    // Send notification to each follower
    const promises = followers.map(async (follower) => {
      const message = notificationMessages[
        follower.language as keyof typeof notificationMessages
      ] || notificationMessages.ja;

      try {
        await admin.messaging().send({
          token: follower.fcmToken,
          notification: {
            title: message.title,
            body: message.body,
          },
          data: {
            type: "task_completed",
            userId: userId,
            timestamp: new Date().toISOString(),
          },
        });

        console.log(`Notification sent to follower: ${follower.id}`);
      } catch (error) {
        console.error(`Failed to send notification to ${follower.id}:`, error);
      }
    });

    await Promise.all(promises);
    console.log(`Notifications sent to ${followers.length} followers`);
  } catch (error) {
    console.error("Error sending follower notifications:", error);
  }
} */
/* eslint-enable @typescript-eslint/no-unused-vars */
