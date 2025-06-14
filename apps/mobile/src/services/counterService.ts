import { db } from '../config/firebase';
import { GlobalCounter } from '../types/firebase';

/**
 * Global counter management service
 * Handles all global counter-related Firestore operations
 */

export const getGlobalCounter = async (date: string): Promise<GlobalCounter | null> => {
  const counterDoc = await db.collection('global_counters').doc(date).get();
  return counterDoc.exists() ? counterDoc.data() as GlobalCounter : null;
};

export const incrementGlobalCounter = async (date: string) => {
  const counterRef = db.collection('global_counters').doc(date);
  const counterDoc = await counterRef.get();
  
  if (counterDoc.exists()) {
    await counterRef.update({
      totalDoneToday: (counterDoc.data()?.totalDoneToday || 0) + 1,
      totalDoneAllTime: (counterDoc.data()?.totalDoneAllTime || 0) + 1,
      lastUpdated: new Date()
    });
  } else {
    await counterRef.set({
      date,
      totalDoneToday: 1,
      totalDoneAllTime: 1,
      lastUpdated: new Date()
    });
  }
};