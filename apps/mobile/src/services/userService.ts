import { db } from '../config/firebase';
import { User } from '../types/firebase';

/**
 * User management service
 * Handles all user-related Firestore operations
 */

export const createUser = async (userId: string, userData: Omit<User, 'id'>) => {
  await db.collection('users').doc(userId).set(userData);
};

export const getUser = async (userId: string): Promise<User | null> => {
  const userDoc = await db.collection('users').doc(userId).get();
  return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } as User : null;
};

export const updateUser = async (userId: string, updates: Partial<User>) => {
  await db.collection('users').doc(userId).update(updates);
};

export const updateUserFCMToken = async (userId: string, fcmToken: string) => {
  await db.collection('users').doc(userId).update({ fcmToken });
};