import {
  triggerFollowNotification,
  handleTaskCompletion,
  NotificationTriggerResult
} from '../src/services/notificationService';
import * as firestoreService from '../src/services/firestore';

// Mock dependencies
jest.mock('../src/services/cloudFunctions', () => ({
  callFunction: jest.fn().mockRejectedValue(new Error('Cloud Functions not supported in React Native. Use direct Firestore calls.'))
}));
jest.mock('../src/services/firestore');

const mockFirestoreService = firestoreService as jest.Mocked<typeof firestoreService>;

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('triggerFollowNotification', () => {
    it('should fail due to cloud functions not being supported', async () => {
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

      const result = await triggerFollowNotification(notificationData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cloud Functions not supported');
    });

    it('should handle invalid notification data', async () => {
      const invalidNotificationData = {
        type: 'follow_task_completed' as const,
        fromUserId: '',
        fromUserName: 'Test User',
        toUserId: 'user456',
        data: {
          taskId: 'task789',
          taskTitle: 'テスト善行'
        }
      };

      const result = await triggerFollowNotification(invalidNotificationData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid notification data - validation failed');
    });
  });

  describe('handleTaskCompletion', () => {
    it('should handle case with no followers', async () => {
      const userId = 'user123';
      const userName = 'Test User';
      const taskId = 'task456';
      const taskTitle = 'テスト善行';

      mockFirestoreService.getFollowers.mockResolvedValue([]);

      const result = await handleTaskCompletion(userId, userName, taskId, taskTitle);

      expect(result.success).toBe(true);
      expect(result.notificationsSent).toBe(0);
    });

    it('should fail to send notifications due to cloud functions not being supported', async () => {
      const userId = 'user123';
      const userName = 'Test User';
      const taskId = 'task456';
      const taskTitle = 'テスト善行';
      const mockFollowers = ['follower1', 'follower2'];

      mockFirestoreService.getFollowers.mockResolvedValue(mockFollowers);

      const result = await handleTaskCompletion(userId, userName, taskId, taskTitle);

      expect(result.success).toBe(true);
      expect(result.notificationsSent).toBe(0);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('should handle firestore error gracefully', async () => {
      const userId = 'user123';
      const userName = 'Test User';
      const taskId = 'task456';
      const taskTitle = 'テスト善行';

      mockFirestoreService.getFollowers.mockRejectedValue(new Error('Database error'));

      const result = await handleTaskCompletion(userId, userName, taskId, taskTitle);

      expect(result.success).toBe(false);
      expect(result.notificationsSent).toBe(0);
      expect(result.error).toBe('Database error');
    });
  });
});