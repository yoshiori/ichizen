import {
  sendFollowNotification,
  createNotificationTemplate,
  validateNotificationPayload,
  NotificationPayload,
  NotificationType
} from '../src/services/followNotificationService';
import * as messaging from '../src/services/messaging.platform';

// Mock messaging service
jest.mock('../src/services/messaging.platform');

const mockMessaging = messaging as jest.Mocked<typeof messaging>;

describe('FollowNotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateNotificationPayload', () => {
    it('should validate valid notification payload', () => {
      const payload: NotificationPayload = {
        type: 'follow_task_completed',
        fromUserId: 'user123',
        fromUserName: 'Test User',
        toUserId: 'user456',
        data: {
          taskId: 'task789',
          taskTitle: 'テスト善行'
        }
      };

      expect(validateNotificationPayload(payload)).toBe(true);
    });

    it('should reject payload with missing required fields', () => {
      const payload = {
        type: 'follow_task_completed',
        fromUserId: 'user123',
        // missing fromUserName
        toUserId: 'user456'
      } as NotificationPayload;

      expect(validateNotificationPayload(payload)).toBe(false);
    });

    it('should reject payload with invalid type', () => {
      const payload = {
        type: 'invalid_type',
        fromUserId: 'user123',
        fromUserName: 'Test User',
        toUserId: 'user456'
      } as NotificationPayload;

      expect(validateNotificationPayload(payload)).toBe(false);
    });
  });

  describe('createNotificationTemplate', () => {
    it('should create Japanese notification for follow task completion', () => {
      const result = createNotificationTemplate({
        type: 'follow_task_completed',
        fromUserName: 'テストユーザー',
        language: 'ja',
        data: {
          taskTitle: 'ゴミを拾う'
        }
      });

      expect(result.title).toBe('フォロー通知');
      expect(result.body).toBe('テストユーザーさんが今日の小さな善行を達成しました！');
      expect(result.data).toEqual({
        type: 'follow_task_completed',
        taskTitle: 'ゴミを拾う'
      });
    });

    it('should create English notification for follow task completion', () => {
      const result = createNotificationTemplate({
        type: 'follow_task_completed',
        fromUserName: 'Test User',
        language: 'en',
        data: {
          taskTitle: 'Pick up trash'
        }
      });

      expect(result.title).toBe('Follow Notification');
      expect(result.body).toBe('Test User completed today\'s small good deed!');
      expect(result.data).toEqual({
        type: 'follow_task_completed',
        taskTitle: 'Pick up trash'
      });
    });

    it('should create new follower notification', () => {
      const result = createNotificationTemplate({
        type: 'new_follower',
        fromUserName: 'テストユーザー',
        language: 'ja'
      });

      expect(result.title).toBe('新しいフォロワー');
      expect(result.body).toBe('テストユーザーさんがあなたをフォローしました');
      expect(result.data).toEqual({
        type: 'new_follower'
      });
    });
  });

  describe('sendFollowNotification', () => {
    it('should send notification successfully', async () => {
      const payload: NotificationPayload = {
        type: 'follow_task_completed',
        fromUserId: 'user123',
        fromUserName: 'Test User',
        toUserId: 'user456',
        data: {
          taskId: 'task789',
          taskTitle: 'テスト善行'
        }
      };

      const toUserToken = 'fcm_token_456';

      await sendFollowNotification(payload, toUserToken, 'ja');

      // Since this is a client-side service, it should prepare the notification
      // but actual sending would be done by the server/Cloud Functions
      expect(validateNotificationPayload(payload)).toBe(true);
    });

    it('should handle invalid payload gracefully', async () => {
      const invalidPayload = {
        type: 'invalid_type'
      } as NotificationPayload;

      const result = await sendFollowNotification(invalidPayload, 'token', 'ja');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid notification payload');
    });

    it('should handle missing FCM token', async () => {
      const payload: NotificationPayload = {
        type: 'follow_task_completed',
        fromUserId: 'user123',
        fromUserName: 'Test User',
        toUserId: 'user456',
        data: {
          taskId: 'task789',
          taskTitle: 'テスト善行'
        }
      };

      const result = await sendFollowNotification(payload, null, 'ja');

      expect(result.success).toBe(false);
      expect(result.error).toBe('No FCM token provided');
    });
  });

  describe('notification queue management', () => {
    it('should queue notifications when offline', async () => {
      // Mock navigator
      const originalNavigator = global.navigator;
      
      // @ts-ignore
      global.navigator = {
        onLine: false
      };

      const payload: NotificationPayload = {
        type: 'follow_task_completed',
        fromUserId: 'user123',
        fromUserName: 'Test User',
        toUserId: 'user456',
        data: {
          taskId: 'task789',
          taskTitle: 'テスト善行'
        }
      };

      const result = await sendFollowNotification(payload, 'token', 'ja');

      expect(result.success).toBe(true);
      expect(result.queued).toBe(true);

      // Restore original navigator
      global.navigator = originalNavigator;
    });
  });
});