import {
  triggerFollowNotification,
  handleTaskCompletion,
  NotificationTriggerResult
} from '../src/services/notificationService';
import * as cloudFunctions from '../src/services/cloudFunctions';
import * as firestoreService from '../src/services/firestore';

// Mock dependencies
jest.mock('../src/services/cloudFunctions');
jest.mock('../src/services/firestore');

const mockCloudFunctions = cloudFunctions as jest.Mocked<typeof cloudFunctions>;
const mockFirestoreService = firestoreService as jest.Mocked<typeof firestoreService>;

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('triggerFollowNotification', () => {
    it('should trigger notification for task completion', async () => {
      const notificationData = {
        type: 'follow_task_completed' as const,
        fromUserId: 'user123',
        fromUserName: 'Test User',
        toUserId: 'user456',
        data: {
          taskId: 'task789',
          taskTitle: 'テスト善行'
        }
      };

      mockCloudFunctions.callFunction.mockResolvedValue({
        success: true,
        messageId: 'msg_123'
      });

      const result = await triggerFollowNotification(notificationData);

      expect(result.success).toBe(true);
      expect(mockCloudFunctions.callFunction).toHaveBeenCalledWith(
        'sendFollowNotification',
        notificationData
      );
    });

    it('should handle notification failure', async () => {
      const notificationData = {
        type: 'follow_task_completed' as const,
        fromUserId: 'user123',
        fromUserName: 'Test User',
        toUserId: 'user456',
        data: {
          taskId: 'task789',
          taskTitle: 'テスト善行'
        }
      };

      mockCloudFunctions.callFunction.mockRejectedValue(
        new Error('FCM token not found')
      );

      const result = await triggerFollowNotification(notificationData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('FCM token not found');
    });
  });

  describe('handleTaskCompletion', () => {
    it('should send notifications to all followers when task is completed', async () => {
      const userId = 'user123';
      const userName = 'Test User';
      const taskId = 'task789';
      const taskTitle = 'ゴミを拾う';

      // Mock followers data
      const mockFollowers = [
        {
          id: 'user456',
          followerId: 'user456',
          followingId: 'user123',
          createdAt: new Date()
        },
        {
          id: 'user789',
          followerId: 'user789',
          followingId: 'user123',
          createdAt: new Date()
        }
      ];

      mockFirestoreService.getFollowers.mockResolvedValue(mockFollowers);
      mockCloudFunctions.callFunction.mockResolvedValue({
        success: true,
        messageId: 'msg_123'
      });

      const result = await handleTaskCompletion(userId, userName, taskId, taskTitle);

      expect(result.success).toBe(true);
      expect(result.notificationsSent).toBe(2);
      expect(mockFirestoreService.getFollowers).toHaveBeenCalledWith(userId);
      expect(mockCloudFunctions.callFunction).toHaveBeenCalledTimes(2);
    });

    it('should handle case with no followers', async () => {
      const userId = 'user123';
      const userName = 'Test User';
      const taskId = 'task789';
      const taskTitle = 'ゴミを拾う';

      mockFirestoreService.getFollowers.mockResolvedValue([]);

      const result = await handleTaskCompletion(userId, userName, taskId, taskTitle);

      expect(result.success).toBe(true);
      expect(result.notificationsSent).toBe(0);
      expect(mockCloudFunctions.callFunction).not.toHaveBeenCalled();
    });

    it('should handle partial notification failures', async () => {
      const userId = 'user123';
      const userName = 'Test User';
      const taskId = 'task789';
      const taskTitle = 'ゴミを拾う';

      const mockFollowers = [
        {
          id: 'user456',
          followerId: 'user456',
          followingId: 'user123',
          createdAt: new Date()
        },
        {
          id: 'user789',
          followerId: 'user789',
          followingId: 'user123',
          createdAt: new Date()
        }
      ];

      mockFirestoreService.getFollowers.mockResolvedValue(mockFollowers);
      mockCloudFunctions.callFunction
        .mockResolvedValueOnce({ success: true, messageId: 'msg_123' })
        .mockRejectedValueOnce(new Error('Token invalid'));

      const result = await handleTaskCompletion(userId, userName, taskId, taskTitle);

      expect(result.success).toBe(true);
      expect(result.notificationsSent).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors?.[0]).toBe('Token invalid');
    });

    it('should handle error getting followers list', async () => {
      const userId = 'user123';
      const userName = 'Test User';
      const taskId = 'task789';
      const taskTitle = 'ゴミを拾う';

      mockFirestoreService.getFollowers.mockRejectedValue(
        new Error('Database connection failed')
      );

      const result = await handleTaskCompletion(userId, userName, taskId, taskTitle);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });
  });

  describe('notification validation', () => {
    it('should validate required notification data fields', async () => {
      const invalidData = {
        type: 'follow_task_completed' as const,
        // missing required fields
        fromUserId: '',
        fromUserName: '',
        toUserId: '',
        data: {}
      };

      const result = await triggerFollowNotification(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('validation');
    });
  });
});