/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

/**
 * 「今日の小さな善行」アプリ Cloud Functions
 * 
 * 主要機能:
 * 1. 毎日のお題選定・配信
 * 2. グローバルカウンター管理
 * 3. フォロー通知システム
 * 4. データ集計・分析
 */

import {onSchedule} from "firebase-functions/v2/scheduler";
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {onCall} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

// Firebase Admin SDK 初期化
admin.initializeApp();
const db = admin.firestore();

/**
 * 毎日午前6時（JST）に実行される定期タスク
 * - 全ユーザーに今日のお題を選定・配信
 * - 前日のグローバルカウンターをリセット
 */
export const dailyTaskScheduler = onSchedule({
  schedule: "0 6 * * *", // 毎日午前6時（UTC）= 日本時間午後3時
  timeZone: "Asia/Tokyo",
  region: "asia-northeast1"
}, async (event) => {
  console.log("Daily task scheduler started");
  
  try {
    // 今日の日付を取得
    const today = new Date().toISOString().split('T')[0];
    
    // グローバルカウンターを初期化
    await db.collection('global_counters').doc(today).set({
      date: today,
      count: 0,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Global counter initialized for ${today}`);
    
    // TODO: ユーザー別お題選定ロジックを実装
    // TODO: プッシュ通知配信
    
  } catch (error) {
    console.error("Daily task scheduler error:", error);
    throw error;
  }
});

/**
 * ユーザーが善行を完了した時に呼ばれるトリガー
 * - グローバルカウンターを増加
 * - フォロワーに通知送信
 */
export const onTaskCompleted = onDocumentCreated({
  document: "daily_task_history/{historyId}",
  region: "asia-northeast1"
}, async (event) => {
  console.log("Task completion detected");
  
  try {
    const data = event.data?.data();
    if (!data) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    // グローバルカウンターを増加
    await db.collection('global_counters').doc(today).update({
      count: admin.firestore.FieldValue.increment(1),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Global counter incremented for ${today}`);
    
    // TODO: フォロワー通知ロジック
    
  } catch (error) {
    console.error("Task completion handler error:", error);
  }
});

/**
 * ユーザーが今日のお題を取得するためのAPI
 */
export const getTodayTask = onCall({
  region: "asia-northeast1"
}, async (request) => {
  try {
    const userId = request.auth?.uid;
    if (!userId) {
      throw new Error("Authentication required");
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // ユーザーの今日のタスク履歴を確認
    const historyRef = db.collection('daily_task_history')
      .where('userId', '==', userId)
      .where('date', '==', today);
    
    const historySnapshot = await historyRef.get();
    
    if (!historySnapshot.empty) {
      // 既に今日のタスクが選定済み
      const doc = historySnapshot.docs[0];
      const taskId = doc.data().taskId;
      
      const taskDoc = await db.collection('tasks').doc(taskId).get();
      return {
        task: taskDoc.data(),
        completed: doc.data().completed,
        selectedAt: doc.data().selectedAt
      };
    }
    
    // 新しいタスクを選定
    const tasksSnapshot = await db.collection('tasks')
      .where('isActive', '==', true)
      .get();
    
    if (tasksSnapshot.empty) {
      throw new Error("No active tasks available");
    }
    
    // ランダムにタスクを選択
    const tasks = tasksSnapshot.docs;
    const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
    
    // ユーザーのタスク履歴に記録
    await db.collection('daily_task_history').add({
      userId,
      taskId: randomTask.id,
      date: today,
      completed: false,
      selectedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      task: randomTask.data(),
      completed: false,
      selectedAt: new Date()
    };
    
  } catch (error) {
    console.error("Get today task error:", error);
    throw error;
  }
});

/**
 * ユーザーがタスクを完了する際のAPI
 */
export const completeTask = onCall({
  region: "asia-northeast1"
}, async (request) => {
  try {
    const userId = request.auth?.uid;
    if (!userId) {
      throw new Error("Authentication required");
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // 今日のタスク履歴を取得
    const historyRef = db.collection('daily_task_history')
      .where('userId', '==', userId)
      .where('date', '==', today);
    
    const historySnapshot = await historyRef.get();
    
    if (historySnapshot.empty) {
      throw new Error("No task found for today");
    }
    
    const historyDoc = historySnapshot.docs[0];
    
    if (historyDoc.data().completed) {
      throw new Error("Task already completed");
    }
    
    // タスクを完了状態に更新
    await historyDoc.ref.update({
      completed: true,
      completedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // フォロワーに通知を送信
    await sendFollowerNotifications(userId);
    
    return {
      success: true,
      completedAt: new Date()
    };
    
  } catch (error) {
    console.error("Complete task error:", error);
    throw error;
  }
});

/**
 * フォロワーに通知を送信する関数
 */
async function sendFollowerNotifications(userId: string) {
  try {
    // ユーザー情報を取得
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      console.log('User not found:', userId);
      return;
    }

    const userData = userDoc.data();
    const userLanguage = userData?.language || 'ja';

    // このユーザーをフォローしているユーザーを取得
    const followersSnapshot = await db.collection('follows')
      .where('followingId', '==', userId)
      .get();

    if (followersSnapshot.empty) {
      console.log('No followers found for user:', userId);
      return;
    }

    // フォロワーのFCMトークンとユーザー情報を取得
    const followers = [];
    for (const doc of followersSnapshot.docs) {
      const followerId = doc.data().followerId;
      const followerDoc = await db.collection('users').doc(followerId).get();
      
      if (followerDoc.exists && followerDoc.data()?.fcmToken) {
        followers.push({
          id: followerId,
          fcmToken: followerDoc.data()?.fcmToken,
          language: followerDoc.data()?.language || 'ja'
        });
      }
    }

    if (followers.length === 0) {
      console.log('No followers with FCM tokens found');
      return;
    }

    // 通知メッセージの多言語対応
    const notificationMessages = {
      ja: {
        title: '🌟 善行達成！',
        body: `お疲れさまでした！今日の小さな善行を達成しました。`
      },
      en: {
        title: '🌟 Good Deed Completed!',
        body: `Well done! A good deed has been completed today.`
      }
    };

    // 各フォロワーに通知を送信
    const promises = followers.map(async (follower) => {
      const message = notificationMessages[follower.language as keyof typeof notificationMessages] || notificationMessages.ja;
      
      try {
        await admin.messaging().send({
          token: follower.fcmToken,
          notification: {
            title: message.title,
            body: message.body
          },
          data: {
            type: 'task_completed',
            userId: userId,
            timestamp: new Date().toISOString()
          }
        });
        
        console.log(`Notification sent to follower: ${follower.id}`);
      } catch (error) {
        console.error(`Failed to send notification to ${follower.id}:`, error);
      }
    });

    await Promise.all(promises);
    console.log(`Notifications sent to ${followers.length} followers`);

  } catch (error) {
    console.error('Error sending follower notifications:', error);
  }
}
