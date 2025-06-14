import { db } from '../config/firebase';
import { Follow } from '../types/firebase';

/**
 * Follow/social functionality service
 * Handles all follow-related Firestore operations
 */

export const followUser = async (followerId: string, followeeId: string) => {
  await db.collection('follows').add({
    followerId,
    followeeId,
    createdAt: new Date()
  });
};

export const unfollowUser = async (followerId: string, followeeId: string) => {
  const followsSnapshot = await db.collection('follows')
    .where('followerId', '==', followerId)
    .where('followeeId', '==', followeeId)
    .limit(1)
    .get();
  
  if (!followsSnapshot.empty) {
    await followsSnapshot.docs[0].ref.delete();
  }
};

export const getFollowedUsers = async (followerId: string): Promise<string[]> => {
  const followsSnapshot = await db.collection('follows')
    .where('followerId', '==', followerId)
    .get();
  
  return followsSnapshot.docs.map(doc => doc.data().followeeId);
};

export const getFollowers = async (followeeId: string): Promise<string[]> => {
  const followsSnapshot = await db.collection('follows')
    .where('followeeId', '==', followeeId)
    .get();
  
  return followsSnapshot.docs.map(doc => doc.data().followerId);
};

export const getFollowing = async (followerId: string): Promise<Follow[]> => {
  const followsSnapshot = await db.collection('follows')
    .where('followerId', '==', followerId)
    .orderBy('createdAt', 'desc')
    .get();
  
  return followsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Follow));
};

export const isFollowing = async (followerId: string, followeeId: string): Promise<boolean> => {
  const followsSnapshot = await db.collection('follows')
    .where('followerId', '==', followerId)
    .where('followeeId', '==', followeeId)
    .limit(1)
    .get();
  
  return !followsSnapshot.empty;
};