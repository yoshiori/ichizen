import { useState, useCallback } from 'react';

interface UseMonthNavigationReturn {
  currentMonth: Date;
  navigateMonth: (direction: 'prev' | 'next') => void;
  setMonth: (month: Date) => void;
}

export const useMonthNavigation = (initialMonth = new Date()): UseMonthNavigationReturn => {
  const [currentMonth, setCurrentMonth] = useState(initialMonth);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  }, []);

  const setMonth = useCallback((month: Date) => {
    setCurrentMonth(month);
  }, []);

  return {
    currentMonth,
    navigateMonth,
    setMonth
  };
};