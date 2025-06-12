import { doc, onSnapshot, DocumentSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { GlobalCounter } from '../types/firebase';

export interface GlobalCounterUpdateData {
  totalCompleted: number;
  todayCompleted: number;
  fromCache?: boolean;
  lastUpdated?: Date;
}

export type GlobalCounterCallback = (data: GlobalCounterUpdateData) => void;
export type Unsubscriber = () => void;

/**
 * Subscribe to real-time global counter updates from Firestore
 * @param callback Function to call when counter data changes
 * @returns Unsubscriber function
 */
export const subscribeToGlobalCounter = (
  callback: GlobalCounterCallback
): Unsubscriber => {
  try {
    const counterRef = doc(db, 'global', 'counter');
    
    const unsubscribe = onSnapshot(
      counterRef,
      (snapshot: DocumentSnapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as GlobalCounter;
          const fromCache = snapshot.metadata.fromCache;
          
          callback({
            totalCompleted: data.totalCompleted || 0,
            todayCompleted: data.todayCompleted || 0,
            fromCache,
            lastUpdated: data.lastUpdated instanceof Date 
              ? data.lastUpdated 
              : data.lastUpdated 
                ? new Date(data.lastUpdated.seconds * 1000)
                : undefined
          });
        } else {
          // Document doesn't exist, provide default values
          console.log('Global counter document does not exist, using defaults');
          callback({
            totalCompleted: 0,
            todayCompleted: 0,
            fromCache: snapshot.metadata.fromCache
          });
        }
      },
      (error) => {
        console.error('Failed to subscribe to global counter updates:', error);
        throw error;
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Failed to subscribe to global counter:', error);
    throw error;
  }
};

/**
 * Unsubscribe from global counter updates
 * @param unsubscriber The unsubscriber function returned by subscribeToGlobalCounter
 */
export const unsubscribeFromGlobalCounter = (unsubscriber: Unsubscriber): void => {
  try {
    unsubscriber();
  } catch (error) {
    console.error('Failed to unsubscribe from global counter:', error);
  }
};