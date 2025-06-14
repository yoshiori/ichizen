import { useState, useCallback } from 'react';
import { CalendarDay } from './useCalendarGenerator';

interface UseDateSelectionReturn {
  selectedDate: string | null;
  handleDayPress: (day: CalendarDay) => void;
  clearSelection: () => void;
}

export const useDateSelection = (): UseDateSelectionReturn => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleDayPress = useCallback((day: CalendarDay) => {
    if (day.hasTask) {
      setSelectedDate(prevSelected => 
        prevSelected === day.date ? null : day.date
      );
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedDate(null);
  }, []);

  return {
    selectedDate,
    handleDayPress,
    clearSelection
  };
};