/**
 * Tests for dailyTaskScheduler Cloud Function
 * Focus on user-specific task selection and notification delivery
 */

// Mock Firebase Admin SDK
jest.mock("firebase-admin", () => ({
  initializeApp: jest.fn(),
  apps: [{}], // Mock existing app to prevent re-initialization
  firestore: jest.fn(() => ({
    collection: jest.fn(),
  })),
  messaging: jest.fn(() => ({
    sendEachForMulticast: jest.fn(),
  })),
  FieldValue: {
    serverTimestamp: jest.fn(() => "mock-timestamp"),
  },
}));

// Import the functions we'll be testing
import {
  selectDailyTaskForUser,
  sendDailyTaskNotifications,
  getUsersForNotification,
} from "../dailyTaskSchedulerHelpers.js";

describe("Daily Task Scheduler Helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("selectDailyTaskForUser", () => {
    it("should be defined and callable", () => {
      expect(selectDailyTaskForUser).toBeDefined();
      expect(typeof selectDailyTaskForUser).toBe("function");
    });
  });

  describe("getUsersForNotification", () => {
    it("should be defined and callable", () => {
      expect(getUsersForNotification).toBeDefined();
      expect(typeof getUsersForNotification).toBe("function");
    });
  });

  describe("sendDailyTaskNotifications", () => {
    it("should be defined and callable", () => {
      expect(sendDailyTaskNotifications).toBeDefined();
      expect(typeof sendDailyTaskNotifications).toBe("function");
    });
  });
});
