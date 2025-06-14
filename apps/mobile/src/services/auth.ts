import { auth } from '../config/firebase';
import { createUser, getUser } from './firestore';
import { User } from '../types/firebase';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

export const signInWithGoogle = async (): Promise<FirebaseAuthTypes.User> => {
  // TODO: Implement Google Sign-in for React Native
  throw new Error('Google Sign-in not implemented yet');
};

export const signInWithApple = async (): Promise<FirebaseAuthTypes.User> => {
  // TODO: Implement Apple Sign-in for React Native
  throw new Error('Apple Sign-in not implemented yet');
};

export const signInAnonymous = async (): Promise<FirebaseAuthTypes.User> => {
  const result = await auth().signInAnonymously();
  return result.user;
};

export const getCurrentUser = (): FirebaseAuthTypes.User | null => {
  return auth().currentUser;
};

export const onAuthStateChange = (callback: (user: FirebaseAuthTypes.User | null) => void) => {
  return auth().onAuthStateChanged(callback);
};

export const initializeUser = async (firebaseUser: FirebaseAuthTypes.User): Promise<User> => {
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