/**
 * Username Change Function Call Spy Tests
 *
 * Testing that changeUsername function makes correct Firestore API calls
 */

import {changeUsername} from "../src/utils/username";
import {db} from "../src/config/firebase";

describe("changeUsername - Function Call Spy Testing", () => {
  // Test data
  const testUserId = "test-user-123";
  const currentUsername = "olduser";
  const newUsername = "newuser";

  let userDocRef: any;
  let newUsernameDocRef: any;
  let oldUsernameDocRef: any;
  let batchMock: any;

  beforeEach(() => {
    // Reset all mocks and spies
    jest.restoreAllMocks();

    // Create document references
    userDocRef = {
      get: jest.fn(),
      update: jest.fn(),
    };

    newUsernameDocRef = {
      get: jest.fn(),
      set: jest.fn(),
    };

    oldUsernameDocRef = {
      delete: jest.fn(),
    };

    // Create batch mock
    batchMock = {
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      commit: jest.fn(),
    };

    // Mock db.collection().doc() calls
    jest.spyOn(db, "collection").mockImplementation(
      (collectionName: string) =>
        ({
          doc: jest.fn((docId: string) => {
            if (collectionName === "users" && docId === testUserId) {
              return userDocRef;
            }
            if (collectionName === "usernames" && docId === newUsername) {
              return newUsernameDocRef;
            }
            if (collectionName === "usernames" && docId === currentUsername) {
              return oldUsernameDocRef;
            }
            throw new Error(`Unexpected doc reference: ${collectionName}/${docId}`);
          }),
        }) as any
    );

    // Mock db.batch()
    jest.spyOn(db, "batch").mockReturnValue(batchMock);

    // Setup mock responses
    newUsernameDocRef.get.mockResolvedValue({
      exists: () => false, // Username is available
    });

    userDocRef.get.mockResolvedValue({
      exists: () => true,
      data: () => ({
        id: testUserId,
        username: currentUsername,
        usernameHistory: [
          {
            username: currentUsername,
            usedFrom: new Date("2023-01-01"),
          },
        ],
      }),
    });

    // Make all batch operations return resolved promises
    batchMock.set.mockResolvedValue(undefined);
    batchMock.update.mockResolvedValue(undefined);
    batchMock.delete.mockResolvedValue(undefined);
    batchMock.commit.mockResolvedValue(undefined);
  });

  it("should check if new username is available", async () => {
    await changeUsername(testUserId, newUsername);

    // Verify that we checked if the new username exists
    expect(db.collection).toHaveBeenCalledWith("usernames");
    expect(newUsernameDocRef.get).toHaveBeenCalled();
  });

  it("should get current user data", async () => {
    await changeUsername(testUserId, newUsername);

    // Verify that we fetched the current user
    expect(db.collection).toHaveBeenCalledWith("users");
    expect(userDocRef.get).toHaveBeenCalled();
  });

  it("should perform atomic batch operations in correct order", async () => {
    await changeUsername(testUserId, newUsername);

    // Verify batch was created
    expect(db.batch).toHaveBeenCalled();

    // Verify batch.set was called for new username document
    expect(batchMock.set).toHaveBeenCalledWith(
      newUsernameDocRef,
      expect.objectContaining({
        userId: testUserId,
        createdAt: expect.any(Date),
        isGenerated: false,
      })
    );

    // Verify batch.update was called for user document with BOTH username and history
    expect(batchMock.update).toHaveBeenCalledWith(
      userDocRef,
      expect.objectContaining({
        username: newUsername, // CRITICAL: must update username field
        usernameHistory: expect.arrayContaining([
          expect.objectContaining({
            username: currentUsername,
            usedUntil: expect.any(Date), // Should close old username
          }),
          expect.objectContaining({
            username: newUsername,
            usedFrom: expect.any(Date), // Should add new username
          }),
        ]),
      })
    );

    // Verify batch.delete was called for old username document
    expect(batchMock.delete).toHaveBeenCalledWith(oldUsernameDocRef);

    // Verify batch was committed
    expect(batchMock.commit).toHaveBeenCalled();
  });

  it("should handle username already taken error", async () => {
    // Mock that new username already exists
    newUsernameDocRef.get.mockResolvedValue({
      exists: () => true,
    });

    await expect(changeUsername(testUserId, newUsername)).rejects.toThrow("Username already taken");

    // Verify that batch operations were not performed
    expect(batchMock.commit).not.toHaveBeenCalled();
  });

  it("should handle user not found error", async () => {
    // Mock that user doesn't exist
    userDocRef.get.mockResolvedValue({
      exists: () => false,
    });

    await expect(changeUsername(testUserId, newUsername)).rejects.toThrow("User not found");

    // Verify that batch operations were not performed
    expect(batchMock.commit).not.toHaveBeenCalled();
  });

  it("should update username history correctly", async () => {
    await changeUsername(testUserId, newUsername);

    // Extract the usernameHistory argument passed to batch.update
    const updateCall = batchMock.update.mock.calls.find((call: any) => call[0] === userDocRef);
    expect(updateCall).toBeDefined();

    const updatedData = updateCall[1];
    const history = updatedData.usernameHistory;

    expect(history).toHaveLength(2);

    // First entry should be closed
    expect(history[0]).toEqual(
      expect.objectContaining({
        username: currentUsername,
        usedFrom: expect.any(Date),
        usedUntil: expect.any(Date),
      })
    );

    // Second entry should be new and open
    expect(history[1]).toEqual(
      expect.objectContaining({
        username: newUsername,
        usedFrom: expect.any(Date),
      })
    );
    expect(history[1]).not.toHaveProperty("usedUntil");
  });
});
