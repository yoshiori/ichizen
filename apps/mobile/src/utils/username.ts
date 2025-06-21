import {db} from "../config/firebase";
import {UsernameDoc, UsernameHistoryEntry} from "../types/firebase";

/**
 * Generate a random string of specified length using alphanumeric characters
 */
const generateRandomString = (length: number): string => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Check if a username is available (not taken by another user)
 */
export const isUsernameAvailable = async (username: string): Promise<boolean> => {
  try {
    const usernameDoc = await db.collection("usernames").doc(username).get();
    return !usernameDoc.exists();
  } catch (error) {
    console.error("Error checking username availability:", error);
    throw error;
  }
};

/**
 * Generate a unique random username
 * Pattern: {prefix}_{random}
 * Example: user_abc123, guest_xy789z, ichizen_48d3f2
 */
export const generateRandomUsername = async (): Promise<string> => {
  const prefixes = ["user", "guest", "ichizen"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

  for (let attempt = 0; attempt < 10; attempt++) {
    const randomSuffix = generateRandomString(6); // a-z, 0-9
    const username = `${prefix}_${randomSuffix}`;

    if (await isUsernameAvailable(username)) {
      return username;
    }
  }

  throw new Error("Failed to generate unique username after 10 attempts");
};

/**
 * Reserve a username for a user by creating a document in the usernames collection
 */
export const reserveUsername = async (username: string, userId: string, isGenerated: boolean = true): Promise<void> => {
  try {
    const usernameData: UsernameDoc = {
      userId,
      createdAt: new Date(),
      isGenerated,
    };

    await db.collection("usernames").doc(username).set(usernameData);
  } catch (error) {
    console.error("Error reserving username:", error);
    throw error;
  }
};

/**
 * Change username for a user with atomic batch operation
 */
export const changeUsername = async (userId: string, newUsername: string): Promise<void> => {
  try {
    const batch = db.batch();

    // 1. Check if new username is available
    const newUsernameRef = db.collection("usernames").doc(newUsername);
    const newUsernameDoc = await newUsernameRef.get();

    if (newUsernameDoc.exists()) {
      throw new Error("Username already taken");
    }

    // 2. Get current user data
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

    const userData = userDoc.data() as {username?: string; usernameHistory?: UsernameHistoryEntry[]};
    const oldUsername = userData.username;

    // 3. Update username history
    const updatedHistory = userData.usernameHistory || [];

    // Close current username entry
    if (updatedHistory.length > 0) {
      updatedHistory[updatedHistory.length - 1].usedUntil = new Date();
    }

    // Add new username entry
    updatedHistory.push({
      username: newUsername,
      usedFrom: new Date(),
    });

    // 4. Batch operations
    // Create new username document
    batch.set(newUsernameRef, {
      userId: userId,
      createdAt: new Date(),
      isGenerated: false,
    });

    // Update user document
    batch.update(userRef, {
      username: newUsername,
      usernameHistory: updatedHistory,
    });

    // Delete old username document
    if (oldUsername) {
      const oldUsernameRef = db.collection("usernames").doc(oldUsername);
      batch.delete(oldUsernameRef);
    }

    // 5. Execute batch
    await batch.commit();
  } catch (error) {
    console.error("Error changing username:", error);
    throw error;
  }
};
