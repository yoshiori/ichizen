import { useState, useCallback } from 'react';
import { incrementGlobalCounter } from '../services/firestore';

interface GlobalCounters {
  totalCount: number;
  todayCount: number;
}

interface UseGlobalCounterReturn {
  globalCounters: GlobalCounters;
  isLoading: boolean;
  incrementCounter: () => Promise<void>;
  updateCounters: (counters: Partial<GlobalCounters>) => void;
}

export const useGlobalCounter = (): UseGlobalCounterReturn => {
  const [globalCounters, setGlobalCounters] = useState<GlobalCounters>({
    totalCount: 125847,
    todayCount: 1246
  });
  const [isLoading, setIsLoading] = useState(false);

  const incrementCounter = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('📊 Incrementing global counter...');
      await incrementGlobalCounter();
      
      // Update local counters optimistically
      setGlobalCounters(prev => ({
        totalCount: prev.totalCount + 1,
        todayCount: prev.todayCount + 1
      }));
    } catch (error) {
      console.error('Failed to increment global counter:', error);
      // You might want to show a user-friendly message here
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCounters = useCallback((counters: Partial<GlobalCounters>) => {
    setGlobalCounters(prev => ({
      ...prev,
      ...counters
    }));
  }, []);

  return {
    globalCounters,
    isLoading,
    incrementCounter,
    updateCounters
  };
};