import * as admin from 'firebase-admin';

export type NotificationType = 'follow_task_completed' | 'new_follower';

export interface NotificationPayload {
  type: NotificationType;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  data?: {
    taskId?: string;
    taskTitle?: string;
    [key: string]: any;
  };
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * 通知テンプレートを作成
 */
const createNotificationTemplate = (
  type: NotificationType,
  fromUserName: string,
  language: 'ja' | 'en' = 'ja'
) => {
  const templates = {
    ja: {
      follow_task_completed: {
        title: 'フォロー通知',
        body: `${fromUserName}さんが今日の小さな善行を達成しました！`
      },
      new_follower: {
        title: '新しいフォロワー',
        body: `${fromUserName}さんがあなたをフォローしました`
      }
    },
    en: {
      follow_task_completed: {
        title: 'Follow Notification',
        body: `${fromUserName} completed today's small good deed!`
      },
      new_follower: {
        title: 'New Follower',
        body: `${fromUserName} started following you`
      }
    }
  };

  return templates[language][type];
};

/**
 * ユーザーにフォロー通知を送信
 */
export const sendFollowNotificationToUser = async (
  payload: NotificationPayload
): Promise<NotificationResult> => {
  try {
    // ユーザー情報を取得
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(payload.toUserId)
      .get();

    if (!userDoc.exists) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    const userData = userDoc.data();
    if (!userData?.fcmToken) {
      return {
        success: false,
        error: 'No FCM token found for user'
      };
    }

    const userLanguage = userData.language || 'ja';

    // 通知テンプレート作成
    const template = createNotificationTemplate(
      payload.type,
      payload.fromUserName,
      userLanguage
    );

    // FCMメッセージ構築
    const message = {
      token: userData.fcmToken,
      notification: {
        title: template.title,
        body: template.body
      },
      data: {
        type: payload.type,
        fromUserId: payload.fromUserId,
        ...(payload.data || {})
      }
    };

    // 通知送信
    const response = await admin.messaging().send(message);

    console.log('📱 Notification sent successfully:', {
      messageId: response,
      to: payload.toUserId,
      type: payload.type
    });

    return {
      success: true,
      messageId: response
    };

  } catch (error) {
    console.error('❌ Error sending notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};