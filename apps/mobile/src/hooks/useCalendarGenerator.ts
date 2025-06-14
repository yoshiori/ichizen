import {useMemo} from "react";
import {DailyTaskHistory, Task} from "../types/firebase";

interface HistoryEntry extends DailyTaskHistory {
  task?: Task;
}

export interface CalendarDay {
  date: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  hasTask: boolean;
  isCompleted: boolean;
  taskEntry?: HistoryEntry;
}

interface UseCalendarGeneratorParams {
  currentMonth: Date;
  history: HistoryEntry[];
}

export const useCalendarGenerator = ({currentMonth, history}: UseCalendarGeneratorParams) => {
  const calendarDays = useMemo((): CalendarDay[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Optimize history lookup with Map for O(1) performance
    const historyMap = new Map<string, HistoryEntry>();
    history.forEach((entry) => historyMap.set(entry.date, entry));

    // First and last day of the month
    const firstDay = new Date(year, month, 1);

    // Calendar start date (from Monday)
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(firstDay.getDate() - mondayOffset);

    const days: CalendarDay[] = [];
    const currentDate = new Date(startDate);

    // Generate 6 weeks worth of calendar
    for (let week = 0; week < 6; week++) {
      for (let day = 0; day < 7; day++) {
        const dateString = currentDate.toISOString().split("T")[0];
        const isCurrentMonth = currentDate.getMonth() === month;

        // Fast O(1) lookup for task history
        const taskEntry = historyMap.get(dateString);

        days.push({
          date: dateString,
          dayOfMonth: currentDate.getDate(),
          isCurrentMonth,
          hasTask: !!taskEntry,
          isCompleted: taskEntry?.completed || false,
          taskEntry,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return days;
  }, [currentMonth, history]);

  return {calendarDays};
};
