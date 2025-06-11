import { signInAnonymously, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';
import { createUser, getUser } from './firestore';
import { User } from '../types/firebase';

export const signInAnonymous = async (): Promise<FirebaseUser> => {
  const result = await signInAnonymously(auth);
  return result.user;
};

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const initializeUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  let user = await getUser(firebaseUser.uid);
  
  if (!user) {
    // Create new user if doesn't exist
    const userData: Omit<User, 'id'> = {
      language: 'ja', // Default to Japanese, can be changed based on device locale
      createdAt: new Date(),
      lastActiveAt: new Date()
    };
    
    await createUser(firebaseUser.uid, userData);
    user = { id: firebaseUser.uid, ...userData };
  }
  
  return user;
};