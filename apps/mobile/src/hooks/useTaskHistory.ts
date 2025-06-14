import { useState, useEffect, useCallback } from 'react';
import { getUserTaskHistoryWithTasks } from '../services/firestore';
import { DailyTaskHistory, Task } from '../types/firebase';
import { getMonthBoundaries } from '../utils/dateFormat';

interface HistoryEntry extends DailyTaskHistory {
  task?: Task;
}

interface UseTaskHistoryParams {
  userId?: string;
  currentMonth: Date;
}

interface UseTaskHistoryReturn {
  history: HistoryEntry[];
  loading: boolean;
  error: string | null;
  refreshHistory: () => Promise<void>;
}

export const useTaskHistory = ({ userId, currentMonth }: UseTaskHistoryParams): UseTaskHistoryReturn => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get month boundaries using consistent UTC calculation
      const { start, end } = getMonthBoundaries(currentMonth);
      
      const historyData = await getUserTaskHistoryWithTasks(userId, start, end);
      setHistory(historyData);
      
    } catch (error) {
      console.error('Error loading history:', error);
      setError(error instanceof Error ? error.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [userId, currentMonth]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const refreshHistory = useCallback(async () => {
    await loadHistory();
  }, [loadHistory]);

  return {
    history,
    loading,
    error,
    refreshHistory
  };
};