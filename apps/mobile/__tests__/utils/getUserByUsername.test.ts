/**
 * Tests for getUserByUsername and getUserIdByUsername functions
 *
 * Testing that these functions correctly retrieve user data from Firestore
 */

import {getUserByUsername, getUserIdByUsername} from "../../src/utils/username";
import {db} from "../../src/config/firebase";
import {User} from "../../src/types/firebase";

describe("getUserByUsername", () => {
  const testUsername = "test_user_123";
  const testUserId = "user-id-123";
  const testUser: User = {
    id: testUserId,
    username: testUsername,
    language: "ja",
    createdAt: new Date("2023-01-01"),
    lastActiveAt: new Date("2023-01-01"),
  };

  let usernameDocRef: {get: jest.Mock};
  let userDocRef: {get: jest.Mock};

  beforeEach(() => {
    jest.restoreAllMocks();

    usernameDocRef = {
      get: jest.fn(),
    };

    userDocRef = {
      get: jest.fn(),
    };

    // Mock db.collection().doc() calls
    jest.spyOn(db, "collection").mockImplementation(
      (collectionName: string) =>
        ({
          doc: jest.fn((docId: string) => {
            switch (`${collectionName}/${docId}`) {
              case `usernames/${testUsername}`:
                return usernameDocRef;
              case `users/${testUserId}`:
                return userDocRef;
              default:
                throw new Error(`Unexpected doc reference: ${collectionName}/${docId}`);
            }
          }),
        }) as any
    );
  });

  describe("getUserByUsername", () => {
    it("should return user data when username exists", async () => {
      // Mock username document exists
      usernameDocRef.get.mockResolvedValue({
        exists: () => true,
        data: () => ({
          userId: testUserId,
          createdAt: new Date(),
          isGenerated: false,
        }),
      });

      // Mock user document exists
      userDocRef.get.mockResolvedValue({
        exists: () => true,
        data: () => testUser,
      });

      const result = await getUserByUsername(testUsername);

      expect(result).toEqual(testUser);
      expect(usernameDocRef.get).toHaveBeenCalled();
      expect(userDocRef.get).toHaveBeenCalled();
    });

    it("should return null when username does not exist", async () => {
      // Mock username document does not exist
      usernameDocRef.get.mockResolvedValue({
        exists: () => false,
      });

      const result = await getUserByUsername(testUsername);

      expect(result).toBeNull();
      expect(usernameDocRef.get).toHaveBeenCalled();
      expect(userDocRef.get).not.toHaveBeenCalled();
    });

    it("should return null when user document does not exist", async () => {
      // Mock username document exists
      usernameDocRef.get.mockResolvedValue({
        exists: () => true,
        data: () => ({
          userId: testUserId,
          createdAt: new Date(),
          isGenerated: false,
        }),
      });

      // Mock user document does not exist
      userDocRef.get.mockResolvedValue({
        exists: () => false,
      });

      const result = await getUserByUsername(testUsername);

      expect(result).toBeNull();
      expect(usernameDocRef.get).toHaveBeenCalled();
      expect(userDocRef.get).toHaveBeenCalled();
    });

    it("should handle empty username", async () => {
      const result = await getUserByUsername("");

      expect(result).toBeNull();
      expect(db.collection).not.toHaveBeenCalled();
    });

    it("should handle whitespace-only username", async () => {
      const result = await getUserByUsername("   ");

      expect(result).toBeNull();
      expect(db.collection).not.toHaveBeenCalled();
    });

    it("should throw error when Firestore throws", async () => {
      usernameDocRef.get.mockRejectedValue(new Error("Firestore error"));

      await expect(getUserByUsername(testUsername)).rejects.toThrow("Firestore error");
    });
  });

  describe("getUserIdByUsername", () => {
    it("should return userId when username exists", async () => {
      // Mock username document exists
      usernameDocRef.get.mockResolvedValue({
        exists: () => true,
        data: () => ({
          userId: testUserId,
          createdAt: new Date(),
          isGenerated: false,
        }),
      });

      const result = await getUserIdByUsername(testUsername);

      expect(result).toBe(testUserId);
      expect(usernameDocRef.get).toHaveBeenCalled();
    });

    it("should return null when username does not exist", async () => {
      // Mock username document does not exist
      usernameDocRef.get.mockResolvedValue({
        exists: () => false,
      });

      const result = await getUserIdByUsername(testUsername);

      expect(result).toBeNull();
      expect(usernameDocRef.get).toHaveBeenCalled();
    });

    it("should handle empty username", async () => {
      const result = await getUserIdByUsername("");

      expect(result).toBeNull();
      expect(db.collection).not.toHaveBeenCalled();
    });

    it("should handle whitespace-only username", async () => {
      const result = await getUserIdByUsername("   ");

      expect(result).toBeNull();
      expect(db.collection).not.toHaveBeenCalled();
    });

    it("should throw error when Firestore throws", async () => {
      usernameDocRef.get.mockRejectedValue(new Error("Firestore error"));

      await expect(getUserIdByUsername(testUsername)).rejects.toThrow("Firestore error");
    });
  });
});
