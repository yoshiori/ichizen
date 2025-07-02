import {getUsersBatch} from "../src/services/userService";
import {db} from "../src/config/firebase";
import "../src/i18n/test";

// Mock Firebase
jest.mock("../src/config/firebase", () => ({
  db: {
    collection: jest.fn(),
  },
}));

const mockDb = db as jest.Mocked<typeof db>;

describe("getUsersBatch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn(); // Suppress console logs in tests
    console.error = jest.fn();
  });

  it("should return empty object for empty input", async () => {
    const result = await getUsersBatch([]);
    expect(result).toEqual({});
  });

  it("should fetch users in batch using in operator", async () => {
    const mockUsers = [
      {id: "user1", data: () => ({username: "user1", language: "ja"})},
      {id: "user2", data: () => ({username: "user2", language: "en"})},
    ];

    const mockSnapshot = {
      forEach: jest.fn((callback) => {
        mockUsers.forEach(callback);
      }),
    };

    const mockQuery = {
      get: jest.fn().mockResolvedValue(mockSnapshot),
    };

    const mockCollection = {
      where: jest.fn().mockReturnValue(mockQuery),
      doc: jest.fn((id) => ({path: `users/${id}`})),
    };

    mockDb.collection.mockReturnValue(mockCollection as any);

    const result = await getUsersBatch(["user1", "user2"]);

    expect(mockDb.collection).toHaveBeenCalledWith("users");
    expect(mockCollection.where).toHaveBeenCalledWith(
      "__name__",
      "in",
      expect.arrayContaining([
        expect.objectContaining({path: "users/user1"}),
        expect.objectContaining({path: "users/user2"}),
      ])
    );
    expect(result).toEqual({
      user1: {id: "user1", username: "user1", language: "ja"},
      user2: {id: "user2", username: "user2", language: "en"},
    });
  });

  it("should handle missing users by marking them as null", async () => {
    const mockUsers = [
      {id: "user1", data: () => ({username: "user1", language: "ja"})},
      // user2 is missing from results
    ];

    const mockSnapshot = {
      forEach: jest.fn((callback) => {
        mockUsers.forEach(callback);
      }),
    };

    const mockQuery = {
      get: jest.fn().mockResolvedValue(mockSnapshot),
    };

    const mockCollection = {
      where: jest.fn().mockReturnValue(mockQuery),
      doc: jest.fn((id) => ({path: `users/${id}`})),
    };

    mockDb.collection.mockReturnValue(mockCollection as any);

    const result = await getUsersBatch(["user1", "user2"]);

    expect(result).toEqual({
      user1: {id: "user1", username: "user1", language: "ja"},
      user2: null,
    });
  });

  it("should batch queries when more than 10 users requested", async () => {
    const userIds = Array.from({length: 15}, (_, i) => `user${i + 1}`);
    const mockUsers = userIds.map((id) => ({
      id,
      data: () => ({username: id, language: "ja"}),
    }));

    const mockSnapshot = {
      forEach: jest.fn((callback) => {
        mockUsers.forEach(callback);
      }),
    };

    const mockQuery = {
      get: jest.fn().mockResolvedValue(mockSnapshot),
    };

    const mockCollection = {
      where: jest.fn().mockReturnValue(mockQuery),
      doc: jest.fn((id) => ({path: `users/${id}`})),
    };

    mockDb.collection.mockReturnValue(mockCollection as any);

    await getUsersBatch(userIds);

    // Should be called twice: once for first 10, once for remaining 5
    expect(mockCollection.where).toHaveBeenCalledTimes(2);
  });

  it("should handle errors and rethrow them", async () => {
    const mockCollection = {
      where: jest.fn().mockReturnValue({
        get: jest.fn().mockRejectedValue(new Error("Firestore error")),
      }),
      doc: jest.fn((id) => ({path: `users/${id}`})),
    };

    mockDb.collection.mockReturnValue(mockCollection as any);

    await expect(getUsersBatch(["user1"])).rejects.toThrow("Firestore error");
  });
});
