/**
 * フォロー通知サービス
 * フォロワーへの善行完了通知とフォロー開始通知を管理
 */

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

export interface NotificationTemplate {
  title: string;
  body: string;
  data: {
    type: NotificationType;
    [key: string]: any;
  };
}

export interface NotificationResult {
  success: boolean;
  error?: string;
  queued?: boolean;
}

/**
 * 通知ペイロードの妥当性を検証
 */
export const validateNotificationPayload = (payload: NotificationPayload): boolean => {
  if (!payload.type || !payload.fromUserId || !payload.fromUserName || !payload.toUserId) {
    return false;
  }

  const validTypes: NotificationType[] = ['follow_task_completed', 'new_follower'];
  if (!validTypes.includes(payload.type)) {
    return false;
  }

  return true;
};

/**
 * 通知テンプレートを作成
 */
export const createNotificationTemplate = ({
  type,
  fromUserName,
  language = 'ja',
  data = {}
}: {
  type: NotificationType;
  fromUserName: string;
  language?: 'ja' | 'en';
  data?: any;
}): NotificationTemplate => {
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

  const template = templates[language][type];

  return {
    title: template.title,
    body: template.body,
    data: {
      type,
      ...data
    }
  };
};

// 通知キュー（オフライン時の処理用）
let notificationQueue: Array<{
  payload: NotificationPayload;
  token: string;
  language: string;
}> = [];

/**
 * フォロー通知を送信
 * Note: 実際の送信はCloud Functionsで行い、ここではクライアント側の準備処理
 */
export const sendFollowNotification = async (
  payload: NotificationPayload,
  toUserToken: string | null,
  language: 'ja' | 'en' = 'ja'
): Promise<NotificationResult> => {
  try {
    // ペイロード検証
    if (!validateNotificationPayload(payload)) {
      return {
        success: false,
        error: 'Invalid notification payload'
      };
    }

    // FCMトークン確認
    if (!toUserToken) {
      return {
        success: false,
        error: 'No FCM token provided'
      };
    }

    // オフライン状態の確認
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      // オフライン時はキューに追加
      notificationQueue.push({ payload, token: toUserToken, language });
      return {
        success: true,
        queued: true
      };
    }

    // 通知テンプレート作成
    const template = createNotificationTemplate({
      type: payload.type,
      fromUserName: payload.fromUserName,
      language,
      data: payload.data
    });

    // 実際の送信はCloud Functionsで行うため、ここでは成功を返す
    console.log('📱 Notification prepared:', {
      to: toUserToken,
      template,
      payload
    });

    return {
      success: true
    };

  } catch (error) {
    console.error('❌ Error sending follow notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * キューに溜まった通知を処理
 */
export const processNotificationQueue = async (): Promise<void> => {
  if (notificationQueue.length === 0) {
    return;
  }

  const queue = [...notificationQueue];
  notificationQueue = [];

  for (const item of queue) {
    await sendFollowNotification(item.payload, item.token, item.language as 'ja' | 'en');
  }
};

/**
 * オンライン状態復帰時の処理
 */
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('online', () => {
    console.log('📡 Network restored, processing notification queue');
    processNotificationQueue();
  });
}