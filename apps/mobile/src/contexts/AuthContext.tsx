import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { onAuthStateChange, signInAnonymous, signInWithGoogle, signInWithApple } from '../services/auth';
import { User } from '../types/firebase';
import { useFCMSetup } from '../hooks/useFCMSetup';
import { useUserInitialization } from '../hooks/useUserInitialization';

export type AuthMethod = 'google' | 'apple' | 'anonymous';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseAuthTypes.User | null;
  loading: boolean;
  initError: string | null;
  signIn: (method?: AuthMethod) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Custom hooks for separated concerns
  const { user, initError, initializeUserData, clearUser } = useUserInitialization();
  const { setupFCMForUser } = useFCMSetup();

  const signIn = async (method: AuthMethod = 'anonymous') => {
    try {
      setLoading(true);
      switch (method) {
        case 'google':
          await signInWithGoogle();
          break;
        case 'apple':
          await signInWithApple();
          break;
        case 'anonymous':
        default:
          await signInAnonymous();
          break;
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error; // Re-throw to allow UI to handle specific errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Timeout to prevent infinite loading
    const initTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Firebase auth initialization timed out, proceeding without auth');
        setLoading(false);
        setAuthError('Firebase initialization timed out');
      }
    }, 10000); // 10 second timeout

    let unsubscribe: (() => void) | null = null;
    
    try {
      unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (!mounted) return;
      
      clearTimeout(initTimeout);
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          await initializeUserData(firebaseUser);
          
          // Setup FCM after user is authenticated
          await setupFCMForUser(firebaseUser.uid);
        } catch (error) {
          console.error('User initialization error:', error);
          // Error state is handled by useUserInitialization hook
        }
      } else {
        clearUser();
      }
      
      if (mounted) {
        setLoading(false);
      }
      });
    } catch (error) {
      console.error('Firebase auth state change setup failed:', error);
      if (mounted) {
        setLoading(false);
        setAuthError(error instanceof Error ? error.message : 'Auth setup failed');
      }
    }

    return () => {
      mounted = false;
      clearTimeout(initTimeout);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [initializeUserData, clearUser, setupFCMForUser]);

  const value = {
    user,
    firebaseUser,
    loading,
    initError: authError || initError, // Combine auth errors and user init errors
    signIn
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};