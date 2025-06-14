import { useState, useEffect } from 'react';
import { Task } from '../types/firebase';
import { sampleTasks } from '../data/sampleTasks';
import { getUserTaskHistory } from '../services/firestore';

interface UseTaskManagerReturn {
  currentTask: Task;
  refreshUsed: boolean;
  isCompleted: boolean;
  refreshTask: () => void;
  markCompleted: () => void;
  resetDaily: () => void;
}

export const useTaskManager = (userId?: string): UseTaskManagerReturn => {
  const [currentTask, setCurrentTask] = useState<Task>(sampleTasks[0]);
  const [refreshUsed, setRefreshUsed] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const initializeTask = async () => {
      console.log('🎭 Demo mode: Using sample tasks');
      const randomIndex = Math.floor(Math.random() * sampleTasks.length);
      setCurrentTask(sampleTasks[randomIndex]);

      // Check if user already completed today's task
      if (userId) {
        try {
          const today = new Date().toISOString().split('T')[0];
          const history = await getUserTaskHistory(userId, today);
          if (history) {
            setIsCompleted(true);
          }
        } catch (error) {
          console.error('Error checking task completion:', error);
        }
      }
    };

    initializeTask();
  }, [userId]);

  const refreshTask = () => {
    if (!refreshUsed && !isCompleted) {
      const availableTasks = sampleTasks.filter(task => task.id !== currentTask.id);
      const randomIndex = Math.floor(Math.random() * availableTasks.length);
      setCurrentTask(availableTasks[randomIndex]);
      setRefreshUsed(true);
    }
  };

  const markCompleted = () => {
    setIsCompleted(true);
  };

  const resetDaily = () => {
    setRefreshUsed(false);
    setIsCompleted(false);
    // This would typically be called at midnight
  };

  return {
    currentTask,
    refreshUsed,
    isCompleted,
    refreshTask,
    markCompleted,
    resetDaily
  };
};