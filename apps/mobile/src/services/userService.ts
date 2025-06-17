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
