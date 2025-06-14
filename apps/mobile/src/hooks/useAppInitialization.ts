import { useState, useEffect } from 'react';
import { testFirestoreConnection } from '../services/testFirestore';

interface UseAppInitializationReturn {
  isInitialized: boolean;
  initializationError: string | null;
}

export const useAppInitialization = (firebaseUserId?: string): UseAppInitializationReturn => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 Initializing app...', {
        environment: __DEV__ ? 'development' : 'production',
        user: firebaseUserId,
        hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A'
      });
      
      try {
        // Test Firestore connection
        console.log('🔗 Testing Firestore connection...');
        await testFirestoreConnection();
        console.log('✅ Firestore connection successful');
        
        setIsInitialized(true);
        setInitializationError(null);
      } catch (error) {
        console.error('❌ App initialization failed:', error);
        setInitializationError(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    if (firebaseUserId) {
      initializeApp();
    }
  }, [firebaseUserId]);

  return {
    isInitialized,
    initializationError
  };
};