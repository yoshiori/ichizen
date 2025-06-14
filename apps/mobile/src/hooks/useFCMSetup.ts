import { useEffect, useRef } from 'react';
import { 
  requestNotificationPermission, 
  setupTokenRefreshListener, 
  setupForegroundMessageListener,
  setupBackgroundMessageListener,
  getInitialNotification,
  setupNotificationOpenedListener
} from '../services/messaging.platform';
import { updateUserFCMToken } from '../services/firestore';

interface UseFCMSetupReturn {
  setupFCMForUser: (userId: string) => Promise<void>;
  setupBackgroundListeners: () => void;
}

export const useFCMSetup = (): UseFCMSetupReturn => {
  const unsubscribeRefs = useRef<Array<() => void>>([]);

  useEffect(() => {
    // Setup background message handler on mount
    try {
      setupBackgroundMessageListener();
    } catch (error) {
      console.warn('Background message setup failed:', error);
    }

    // Cleanup on unmount
    return () => {
      unsubscribeRefs.current.forEach(unsubscribe => {
        try {
          unsubscribe();
        } catch (error) {
          console.warn('Error during FCM cleanup:', error);
        }
      });
      unsubscribeRefs.current = [];
    };
  }, []);

  const setupFCMForUser = async (userId: string) => {
    try {
      // Request notification permission and get token
      const token = await requestNotificationPermission();
      if (token) {
        await updateUserFCMToken(userId, token);
      }

      // Setup token refresh listener
      const unsubscribeTokenRefresh = setupTokenRefreshListener(async (newToken: string) => {
        console.log('FCM token refreshed:', newToken);
        await updateUserFCMToken(userId, newToken);
      });

      // Setup foreground message listener
      const unsubscribeForeground = setupForegroundMessageListener((message: any) => {
        console.log('Foreground message:', message);
        // Handle foreground notification display
      });

      // Setup notification opened listener
      const unsubscribeOpened = setupNotificationOpenedListener((message: any) => {
        console.log('Notification opened app:', message);
        // Handle navigation or actions when notification is tapped
      });

      // Store unsubscribe functions for cleanup
      unsubscribeRefs.current.push(
        unsubscribeTokenRefresh,
        unsubscribeForeground,
        unsubscribeOpened
      );

      // Check for initial notification (app opened from notification)
      const initialNotification = await getInitialNotification();
      if (initialNotification) {
        console.log('Initial notification:', initialNotification);
        // Handle initial notification
      }
    } catch (error) {
      console.error('FCM setup error:', error);
    }
  };

  const setupBackgroundListeners = () => {
    try {
      setupBackgroundMessageListener();
    } catch (error) {
      console.warn('Background message setup failed:', error);
    }
  };

  return {
    setupFCMForUser,
    setupBackgroundListeners
  };
};