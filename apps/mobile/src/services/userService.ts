import {db} from "../config/firebase";
import {User} from "../types/firebase";

/**
 * User management service
 * Handles all user-related Firestore operations
 */

export const createUser = async (userId: string, userData: Omit<User, "id">) => {
  console.log("🔥 Creating user in Firestore:", userId);
  try {
    await db.collection("users").doc(userId).set(userData);
    console.log("✅ User created successfully:", userId);
  } catch (error) {
    console.error("❌ Failed to create user:", error);
    throw error;
  }
};

export const getUser = async (userId: string): Promise<User | null> => {
  console.log("🔥 Getting user from Firestore:", userId);
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    const result = userDoc.exists() ? ({id: userDoc.id, ...userDoc.data()} as User) : null;
    console.log("✅ User retrieved:", result ? "Found" : "Not found");
    return result;
  } catch (error) {
    console.error("❌ Failed to get user:", error);
    throw error;
  }
};

export const updateUser = async (userId: string, updates: Partial<User>) => {
  await db.collection("users").doc(userId).update(updates);
};

export const updateUserFCMToken = async (userId: string, fcmToken: string) => {
  await db.collection("users").doc(userId).update({fcmToken});
};

/**
 * Get multiple users by their IDs in a single batch query
 * This prevents N+1 query issues when fetching user details
 */
export const getUsersBatch = async (userIds: string[]): Promise<Record<string, User | null>> => {
  console.log("🔥 Getting users in batch from Firestore:", userIds.length, "users");

  if (userIds.length === 0) {
    return {};
  }

  try {
    const result: Record<string, User | null> = {};

    // Firestore 'in' operator supports up to 10 values at a time
    const batchSize = 10;
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);

      const snapshot = await db
        .collection("users")
        .where(
          "__name__",
          "in",
          batch.map((id) => db.collection("users").doc(id))
        )
        .get();

      // Process results
      snapshot.forEach((doc) => {
        result[doc.id] = {id: doc.id, ...doc.data()} as User;
      });

      // Mark missing users as null
      batch.forEach((userId) => {
        if (!(userId in result)) {
          result[userId] = null;
        }
      });
    }

    console.log("✅ Batch users retrieved:", Object.keys(result).length);
    return result;
  } catch (error) {
    console.error("❌ Failed to get users in batch:", error);
    throw error;
  }
};
