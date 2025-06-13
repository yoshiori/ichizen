import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  increment,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User, Task, DailyTaskHistory, GlobalCounter, Follow } from '../types/firebase';

// Users collection
export const createUser = async (userId: string, userData: Omit<User, 'id'>) => {
  await setDoc(doc(db, 'users', userId), userData);
};

export const getUser = async (userId: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } as User : null;
};

export const updateUser = async (userId: string, updates: Partial<User>) => {
  await updateDoc(doc(db, 'users', userId), updates);
};

export const updateUserFCMToken = async (userId: string, fcmToken: string) => {
  await updateDoc(doc(db, 'users', userId), { fcmToken });
};

// Tasks collection
export const getTasks = async (): Promise<Task[]> => {
  const tasksSnapshot = await getDocs(collection(db, 'tasks'));
  return tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
};

export const getTask = async (taskId: string): Promise<Task | null> => {
  const taskDoc = await getDoc(doc(db, 'tasks', taskId));
  return taskDoc.exists() ? { id: taskDoc.id, ...taskDoc.data() } as Task : null;
};

// Daily task history
export const addDailyTaskHistory = async (historyData: Omit<DailyTaskHistory, 'id'>) => {
  await addDoc(collection(db, 'daily_task_history'), historyData);
};

export const getUserTaskHistory = async (userId: string, dateString: string): Promise<DailyTaskHistory | null> => {
  const q = query(
    collection(db, 'daily_task_history'),
    where('userId', '==', userId),
    where('date', '==', dateString),
    limit(1)
  );
  const snapshot = await getDocs(q);
  return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as DailyTaskHistory;
};

export const getUserTaskHistoryRange = async (userId: string, startDate: string, endDate: string): Promise<DailyTaskHistory[]> => {
  const q = query(
    collection(db, 'daily_task_history'),
    where('userId', '==', userId),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyTaskHistory));
};

export const getUserTaskHistoryWithTasks = async (userId: string, startDate: string, endDate: string): Promise<(DailyTaskHistory & { task?: Task })[]> => {
  const history = await getUserTaskHistoryRange(userId, startDate, endDate);
  
  // Fetch task details in parallel
  const tasksPromises = history.map(async (historyItem) => {
    const task = await getTask(historyItem.taskId);
    return { ...historyItem, task: task || undefined };
  });
  
  return Promise.all(tasksPromises);
};

// Global counter
export const getGlobalCounter = async (): Promise<GlobalCounter | null> => {
  const counterDoc = await getDoc(doc(db, 'global', 'counter'));
  return counterDoc.exists() ? counterDoc.data() as GlobalCounter : null;
};

export const incrementGlobalCounter = async () => {
  const counterRef = doc(db, 'global', 'counter');
  const today = new Date().toISOString().split('T')[0];
  
  // Get current counter to check if we need to reset today's count
  const currentCounter = await getGlobalCounter();
  const lastUpdatedDate = currentCounter?.lastUpdated ? 
    (currentCounter.lastUpdated instanceof Date ? 
      currentCounter.lastUpdated.toISOString().split('T')[0] : 
      new Date(currentCounter.lastUpdated.seconds * 1000).toISOString().split('T')[0]) : '';
  
  if (lastUpdatedDate !== today) {
    // Reset today's count if it's a new day
    await updateDoc(counterRef, {
      totalCompleted: increment(1),
      todayCompleted: 1,
      lastUpdated: new Date()
    });
  } else {
    // Increment both counters
    await updateDoc(counterRef, {
      totalCompleted: increment(1),
      todayCompleted: increment(1),
      lastUpdated: new Date()
    });
  }
};

// Follow functionality
export const followUser = async (followerId: string, followingId: string) => {
  // Check if already following
  const existingFollow = await query(
    collection(db, 'follows'),
    where('followerId', '==', followerId),
    where('followingId', '==', followingId)
  );
  
  const snapshot = await getDocs(existingFollow);
  if (!snapshot.empty) {
    throw new Error('Already following this user');
  }

  // Create follow relationship
  await addDoc(collection(db, 'follows'), {
    followerId,
    followingId,
    createdAt: new Date()
  });
};

export const unfollowUser = async (followerId: string, followingId: string) => {
  const followQuery = query(
    collection(db, 'follows'),
    where('followerId', '==', followerId),
    where('followingId', '==', followingId)
  );
  
  const snapshot = await getDocs(followQuery);
  if (snapshot.empty) {
    throw new Error('Not following this user');
  }

  // Remove follow relationship
  await deleteDoc(snapshot.docs[0].ref);
};

export const getFollowing = async (userId: string): Promise<Follow[]> => {
  const followingQuery = query(
    collection(db, 'follows'),
    where('followerId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(followingQuery);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Follow));
};

export const getFollowers = async (userId: string): Promise<Follow[]> => {
  const followersQuery = query(
    collection(db, 'follows'),
    where('followingId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(followersQuery);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Follow));
};

export const isFollowing = async (followerId: string, followingId: string): Promise<boolean> => {
  const followQuery = query(
    collection(db, 'follows'),
    where('followerId', '==', followerId),
    where('followingId', '==', followingId)
  );
  
  const snapshot = await getDocs(followQuery);
  return !snapshot.empty;
};