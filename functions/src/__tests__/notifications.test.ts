import { sendFollowNotificationToUser, NotificationPayload } from '../notifications';
import * as admin from 'firebase-admin';

// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
  messaging: jest.fn(() => ({
    send: jest.fn(),
    sendMulticast: jest.fn()
  })),
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn()
      }))
    }))
  }))
}));

const mockMessaging = {
  send: jest.fn(),
  sendMulticast: jest.fn()
};

const mockFirestore = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn()
    }))
  }))
};

// @ts-ignore
admin.messaging.mockReturnValue(mockMessaging);
// @ts-ignore
admin.firestore.mockReturnValue(mockFirestore);

describe('Cloud Functions Notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendFollowNotificationToUser', () => {
    it('should send notification to user with FCM token', async () => {
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

      // Mock user document with FCM token
      const mockUserDoc = {
        exists: true,
        data: () => ({
          fcmToken: 'mock_fcm_token_456',
          language: 'ja'
        })
      };

      mockFirestore.collection().doc().get.mockResolvedValue(mockUserDoc);
      mockMessaging.send.mockResolvedValue({ messageId: 'msg_123' });

      const result = await sendFollowNotificationToUser(payload);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('msg_123');
      expect(mockMessaging.send).toHaveBeenCalledWith({
        token: 'mock_fcm_token_456',
        notification: {
          title: 'フォロー通知',
          body: 'Test Userさんが今日の小さな善行を達成しました！'
        },
        data: {
          type: 'follow_task_completed',
          taskId: 'task789',
          taskTitle: 'テスト善行',
          fromUserId: 'user123'
        }
      });
    });

    it('should handle user without FCM token', async () => {
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

      // Mock user document without FCM token
      const mockUserDoc = {
        exists: true,
        data: () => ({
          language: 'ja'
          // no fcmToken
        })
      };

      mockFirestore.collection().doc().get.mockResolvedValue(mockUserDoc);

      const result = await sendFollowNotificationToUser(payload);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No FCM token found for user');
      expect(mockMessaging.send).not.toHaveBeenCalled();
    });

    it('should handle non-existent user', async () => {
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

      // Mock non-existent user document
      const mockUserDoc = {
        exists: false
      };

      mockFirestore.collection().doc().get.mockResolvedValue(mockUserDoc);

      const result = await sendFollowNotificationToUser(payload);

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
      expect(mockMessaging.send).not.toHaveBeenCalled();
    });

    it('should create English notification for English user', async () => {
      const payload: NotificationPayload = {
        type: 'follow_task_completed',
        fromUserId: 'user123',
        fromUserName: 'Test User',
        toUserId: 'user456',
        data: {
          taskId: 'task789',
          taskTitle: 'Pick up trash'
        }
      };

      // Mock user document with English language
      const mockUserDoc = {
        exists: true,
        data: () => ({
          fcmToken: 'mock_fcm_token_456',
          language: 'en'
        })
      };

      mockFirestore.collection().doc().get.mockResolvedValue(mockUserDoc);
      mockMessaging.send.mockResolvedValue({ messageId: 'msg_123' });

      const result = await sendFollowNotificationToUser(payload);

      expect(result.success).toBe(true);
      expect(mockMessaging.send).toHaveBeenCalledWith({
        token: 'mock_fcm_token_456',
        notification: {
          title: 'Follow Notification',
          body: 'Test User completed today\'s small good deed!'
        },
        data: {
          type: 'follow_task_completed',
          taskId: 'task789',
          taskTitle: 'Pick up trash',
          fromUserId: 'user123'
        }
      });
    });

    it('should handle FCM send error', async () => {
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

      const mockUserDoc = {
        exists: true,
        data: () => ({
          fcmToken: 'invalid_token',
          language: 'ja'
        })
      };

      mockFirestore.collection().doc().get.mockResolvedValue(mockUserDoc);
      mockMessaging.send.mockRejectedValue(new Error('Invalid FCM token'));

      const result = await sendFollowNotificationToUser(payload);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid FCM token');
    });

    it('should handle new follower notification', async () => {
      const payload: NotificationPayload = {
        type: 'new_follower',
        fromUserId: 'user123',
        fromUserName: 'New Follower',
        toUserId: 'user456',
        data: {}
      };

      const mockUserDoc = {
        exists: true,
        data: () => ({
          fcmToken: 'mock_fcm_token_456',
          language: 'ja'
        })
      };

      mockFirestore.collection().doc().get.mockResolvedValue(mockUserDoc);
      mockMessaging.send.mockResolvedValue({ messageId: 'msg_456' });

      const result = await sendFollowNotificationToUser(payload);

      expect(result.success).toBe(true);
      expect(mockMessaging.send).toHaveBeenCalledWith({
        token: 'mock_fcm_token_456',
        notification: {
          title: '新しいフォロワー',
          body: 'New Followerさんがあなたをフォローしました'
        },
        data: {
          type: 'new_follower',
          fromUserId: 'user123'
        }
      });
    });
  });
});