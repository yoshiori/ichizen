// Mock Firebase Admin
const mockGet = jest.fn();
const mockDoc = jest.fn(() => ({get: mockGet}));
const mockCollection = jest.fn(() => ({doc: mockDoc}));
const mockFirestore = jest.fn(() => ({collection: mockCollection}));
const mockSend = jest.fn();
const mockMessaging = jest.fn(() => ({send: mockSend}));

jest.mock("firebase-admin", () => ({
  messaging: mockMessaging,
  firestore: mockFirestore,
  initializeApp: jest.fn(),
  apps: [], // Empty apps array to test initialization logic
}));

// Export mocks for use in tests
export {mockGet, mockSend};

import {sendFollowNotificationToUser, NotificationPayload} from "../notifications.js";

describe("Cloud Functions Notifications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("sendFollowNotificationToUser", () => {
    it("should send notification to user with FCM token", async () => {
      const payload: NotificationPayload = {
        type: "follow_task_completed",
        fromUserId: "user123",
        fromUserName: "Test User",
        toUserId: "user456",
        data: {
          taskId: "task789",
          taskTitle: "テスト善行",
        },
      };

      // Mock user document with FCM token
      const mockUserDoc = {
        exists: true,
        data: () => ({
          fcmToken: "mock_fcm_token_456",
          language: "ja",
        }),
      };

      mockGet.mockResolvedValue(mockUserDoc);
      mockSend.mockResolvedValue("msg_123");

      const result = await sendFollowNotificationToUser(payload);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe("msg_123");
      expect(mockSend).toHaveBeenCalledWith({
        token: "mock_fcm_token_456",
        notification: {
          title: "フォロー通知",
          body: "Test Userさんが今日の小さな善行を達成しました！",
        },
        data: {
          type: "follow_task_completed",
          taskId: "task789",
          taskTitle: "テスト善行",
          fromUserId: "user123",
        },
      });
    });

    it("should handle user without FCM token", async () => {
      const payload: NotificationPayload = {
        type: "follow_task_completed",
        fromUserId: "user123",
        fromUserName: "Test User",
        toUserId: "user456",
        data: {
          taskId: "task789",
          taskTitle: "テスト善行",
        },
      };

      // Mock user document without FCM token
      const mockUserDoc = {
        exists: true,
        data: () => ({
          language: "ja",
          // no fcmToken
        }),
      };

      mockGet.mockResolvedValue(mockUserDoc);

      const result = await sendFollowNotificationToUser(payload);

      expect(result.success).toBe(false);
      expect(result.error).toBe("No FCM token found for user");
      expect(mockSend).not.toHaveBeenCalled();
    });

    it("should handle non-existent user", async () => {
      const payload: NotificationPayload = {
        type: "follow_task_completed",
        fromUserId: "user123",
        fromUserName: "Test User",
        toUserId: "user456",
        data: {
          taskId: "task789",
          taskTitle: "テスト善行",
        },
      };

      // Mock non-existent user document
      const mockUserDoc = {
        exists: false,
      };

      mockGet.mockResolvedValue(mockUserDoc);

      const result = await sendFollowNotificationToUser(payload);

      expect(result.success).toBe(false);
      expect(result.error).toBe("User not found");
      expect(mockSend).not.toHaveBeenCalled();
    });

    it("should create English notification for English user", async () => {
      const payload: NotificationPayload = {
        type: "follow_task_completed",
        fromUserId: "user123",
        fromUserName: "Test User",
        toUserId: "user456",
        data: {
          taskId: "task789",
          taskTitle: "Pick up trash",
        },
      };

      // Mock user document with English language
      const mockUserDoc = {
        exists: true,
        data: () => ({
          fcmToken: "mock_fcm_token_456",
          language: "en",
        }),
      };

      mockGet.mockResolvedValue(mockUserDoc);
      mockSend.mockResolvedValue("msg_123");

      const result = await sendFollowNotificationToUser(payload);

      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledWith({
        token: "mock_fcm_token_456",
        notification: {
          title: "Follow Notification",
          body: "Test User completed today's small good deed!",
        },
        data: {
          type: "follow_task_completed",
          taskId: "task789",
          taskTitle: "Pick up trash",
          fromUserId: "user123",
        },
      });
    });

    it("should handle FCM send error", async () => {
      const payload: NotificationPayload = {
        type: "follow_task_completed",
        fromUserId: "user123",
        fromUserName: "Test User",
        toUserId: "user456",
        data: {
          taskId: "task789",
          taskTitle: "テスト善行",
        },
      };

      const mockUserDoc = {
        exists: true,
        data: () => ({
          fcmToken: "invalid_token",
          language: "ja",
        }),
      };

      mockGet.mockResolvedValue(mockUserDoc);
      mockSend.mockRejectedValue(new Error("Invalid FCM token"));

      const result = await sendFollowNotificationToUser(payload);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid FCM token");
    });

    it("should handle new follower notification", async () => {
      const payload: NotificationPayload = {
        type: "new_follower",
        fromUserId: "user123",
        fromUserName: "New Follower",
        toUserId: "user456",
        data: {},
      };

      const mockUserDoc = {
        exists: true,
        data: () => ({
          fcmToken: "mock_fcm_token_456",
          language: "ja",
        }),
      };

      mockGet.mockResolvedValue(mockUserDoc);
      mockSend.mockResolvedValue("msg_456");

      const result = await sendFollowNotificationToUser(payload);

      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledWith({
        token: "mock_fcm_token_456",
        notification: {
          title: "新しいフォロワー",
          body: "New Followerさんがあなたをフォローしました",
        },
        data: {
          type: "new_follower",
          fromUserId: "user123",
        },
      });
    });
  });
});
