import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChange, signInAnonymous, initializeUser } from '../services/auth';
import { User } from '../types/firebase';
import { 
  requestNotificationPermission, 
  setupTokenRefreshListener, 
  setupForegroundMessageListener,
  setupBackgroundMessageListener,
  getInitialNotification,
  setupNotificationOpenedListener
} from '../services/messaging';
import { updateUserFCMToken } from '../services/firestore';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: () => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const signIn = async () => {
    try {
      setLoading(true);
      await signInAnonymous();
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const userData = await initializeUser(firebaseUser);
          setUser(userData);
          
          // Setup FCM after user is authenticated
          await setupFCMForUser(firebaseUser.uid);
        } catch (error) {
          console.error('User initialization error:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    // Setup background message handler
    setupBackgroundMessageListener();

    return unsubscribe;
  }, []);

  const setupFCMForUser = async (userId: string) => {
    try {
      // Request notification permission and get token
      const token = await requestNotificationPermission();
      if (token) {
        await updateUserFCMToken(userId, token);
      }

      // Setup token refresh listener
      const unsubscribeTokenRefresh = setupTokenRefreshListener(async (newToken) => {
        console.log('FCM token refreshed:', newToken);
        await updateUserFCMToken(userId, newToken);
      });

      // Setup foreground message listener
      const unsubscribeForeground = setupForegroundMessageListener((message) => {
        console.log('Foreground message:', message);
        // Handle foreground notification display
      });

      // Setup notification opened listener
      const unsubscribeOpened = setupNotificationOpenedListener((message) => {
        console.log('Notification opened app:', message);
        // Handle navigation or actions when notification is tapped
      });

      // Check for initial notification (app opened from notification)
      const initialNotification = await getInitialNotification();
      if (initialNotification) {
        console.log('Initial notification:', initialNotification);
        // Handle initial notification
      }

      return () => {
        unsubscribeTokenRefresh();
        unsubscribeForeground();
        unsubscribeOpened();
      };
    } catch (error) {
      console.error('FCM setup error:', error);
    }
  };

  const value = {
    user,
    firebaseUser,
    loading,
    signIn
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};