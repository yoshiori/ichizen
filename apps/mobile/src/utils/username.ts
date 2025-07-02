import {db} from "../config/firebase";
import {UsernameDoc, User} from "../types/firebase";

// Constants
const MAX_USERNAME_GENERATION_ATTEMPTS = 10;

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
 * Includes retry logic for emulator connection issues
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

  for (let attempt = 0; attempt < MAX_USERNAME_GENERATION_ATTEMPTS; attempt++) {
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
 * Atomically reserve username and create user document using Firestore batch
 */
export const reserveUsernameAndCreateUser = async (
  username: string,
  userId: string,
  userData: Omit<User, "id">,
  isGenerated: boolean = true
): Promise<void> => {
  try {
    const batch = db.batch();

    // Prepare username document
    const usernameData: UsernameDoc = {
      userId,
      createdAt: new Date(),
      isGenerated,
    };

    // Prepare user document
    const userDocData = {
      ...userData,
      createdAt: new Date(),
      lastActiveAt: new Date(),
    };

    // Add operations to batch
    const usernameRef = db.collection("usernames").doc(username);
    const userRef = db.collection("users").doc(userId);

    batch.set(usernameRef, usernameData);
    batch.set(userRef, userDocData);

    // Execute batch atomically
    await batch.commit();
  } catch (error) {
    console.error("Error in atomic username reservation and user creation:", error);
    throw error;
  }
};

/**
 * Get user by username
 * Returns the user data if found, null otherwise
 */
export const getUserByUsername = async (username: string): Promise<User | null> => {
  // Handle empty username
  if (!username || !username.trim()) {
    return null;
  }

  try {
    // First, get the username document to find the userId
    const usernameDoc = await db.collection("usernames").doc(username).get();

    if (!usernameDoc.exists()) {
      return null;
    }

    const usernameData = usernameDoc.data() as UsernameDoc;

    // Then, get the user document
    const userDoc = await db.collection("users").doc(usernameData.userId).get();

    if (!userDoc.exists()) {
      return null;
    }

    return userDoc.data() as User;
  } catch (error) {
    console.error("Error getting user by username:", error);
    throw error;
  }
};

/**
 * Get user ID by username
 * Returns the Firebase UID if found, null otherwise
 */
export const getUserIdByUsername = async (username: string): Promise<string | null> => {
  // Handle empty username
  if (!username || !username.trim()) {
    return null;
  }

  try {
    // Get the username document to find the userId
    const usernameDoc = await db.collection("usernames").doc(username).get();

    if (!usernameDoc.exists()) {
      return null;
    }

    const usernameData = usernameDoc.data() as UsernameDoc;
    return usernameData.userId;
  } catch (error) {
    console.error("Error getting user ID by username:", error);
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

    const userData = userDoc.data() as User;
    const oldUsername = userData.username;

    // 3. Update username history
    const updatedHistory = [...(userData.usernameHistory || [])];

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
