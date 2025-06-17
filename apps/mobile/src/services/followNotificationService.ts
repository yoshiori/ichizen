/**
 * Follow notification service
 * Manages task completion notifications to followers and new follower notifications
 */

export type NotificationType = "follow_task_completed" | "new_follower";

export interface NotificationPayload {
  type: NotificationType;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  data?: {
    taskId?: string;
    taskTitle?: string;
    [key: string]: string | undefined;
  };
}

export interface NotificationTemplate {
  title: string;
  body: string;
  data: {
    type: NotificationType;
    [key: string]: string;
  };
}

export interface NotificationResult {
  success: boolean;
  error?: string;
  queued?: boolean;
}

/**
 * Validate notification payload
 */
export const validateNotificationPayload = (payload: NotificationPayload): boolean => {
  if (!payload.type || !payload.fromUserId || !payload.fromUserName || !payload.toUserId) {
    return false;
  }

  const validTypes: NotificationType[] = ["follow_task_completed", "new_follower"];
  if (!validTypes.includes(payload.type)) {
    return false;
  }

  return true;
};

/**
 * Create notification template
 */
export const createNotificationTemplate = ({
  type,
  fromUserName,
  language = "ja",
  data = {},
}: {
  type: NotificationType;
  fromUserName: string;
  language?: "ja" | "en";
  data?: Record<string, string>;
}): NotificationTemplate => {
  const templates = {
    ja: {
      follow_task_completed: {
        title: "フォロー通知",
        body: `${fromUserName}さんが今日の小さな善行を達成しました！`,
      },
      new_follower: {
        title: "新しいフォロワー",
        body: `${fromUserName}さんがあなたをフォローしました`,
      },
    },
    en: {
      follow_task_completed: {
        title: "Follow Notification",
        body: `${fromUserName} completed today's small good deed!`,
      },
      new_follower: {
        title: "New Follower",
        body: `${fromUserName} started following you`,
      },
    },
  };

  const template = templates[language][type];

  return {
    title: template.title,
    body: template.body,
    data: {
      type,
      ...data,
    },
  };
};

// Notification queue (for offline processing)
let notificationQueue: Array<{
  payload: NotificationPayload;
  token: string;
  language: string;
}> = [];

/**
 * Send follow notification
 * Note: Actual sending is done by Cloud Functions, this handles client-side preparation
 */
export const sendFollowNotification = async (
  payload: NotificationPayload,
  toUserToken: string | null,
  language: "ja" | "en" = "ja"
): Promise<NotificationResult> => {
  try {
    // Validate payload
    if (!validateNotificationPayload(payload)) {
      return {
        success: false,
        error: "Invalid notification payload",
      };
    }

    // Check FCM token
    if (!toUserToken) {
      return {
        success: false,
        error: "No FCM token provided",
      };
    }

    // Check offline status
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      // Add to queue when offline
      notificationQueue.push({payload, token: toUserToken, language});
      return {
        success: true,
        queued: true,
      };
    }

    // Create notification template
    const template = createNotificationTemplate({
      type: payload.type,
      fromUserName: payload.fromUserName,
      language,
      data: payload.data
        ? (Object.fromEntries(Object.entries(payload.data).filter(([_, v]) => v !== undefined)) as Record<
            string,
            string
          >)
        : {},
    });

    // Actual sending is done by Cloud Functions, so return success here
    console.log("📱 Notification prepared:", {
      to: toUserToken,
      template,
      payload,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Error sending follow notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Process queued notifications
 */
export const processNotificationQueue = async (): Promise<void> => {
  if (notificationQueue.length === 0) {
    return;
  }

  const queue = [...notificationQueue];
  notificationQueue = [];

  for (const item of queue) {
    await sendFollowNotification(item.payload, item.token, item.language as "ja" | "en");
  }
};

/**
 * Handle online status recovery
 */
if (typeof window !== "undefined" && window.addEventListener) {
  window.addEventListener("online", () => {
    console.log("📡 Network restored, processing notification queue");
    processNotificationQueue();
  });
}
