import {db} from "../config/firebase";
import {CounterStatistics} from "../types/firebase";

/**
 * Get the start date of the current week (Monday)
 * @param date Optional date to calculate from, defaults to current date
 * @returns Date object representing the start of the week
 */
export const getWeekStartDate = (date?: Date): Date => {
  const d = date || new Date();
  const day = d.getDay();
  // Calculate days to subtract to get to Monday (day 1)
  // If it's Sunday (0), subtract 6 days; otherwise subtract (day - 1)
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(d);
  weekStart.setDate(diff);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
};

/**
 * Get the start date of the current month
 * @param date Optional date to calculate from, defaults to current date
 * @returns Date object representing the start of the month
 */
export const getMonthStartDate = (date?: Date): Date => {
  const d = date || new Date();
  const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
  monthStart.setHours(0, 0, 0, 0);
  return monthStart;
};

/**
 * Get the count of completed tasks for the current week
 * @param weekStart Start date of the week
 * @returns Promise resolving to the weekly count
 */
export const getWeeklyCount = async (weekStart: Date): Promise<number> => {
  try {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const weekStartString = weekStart.toISOString().split("T")[0];
    const weekEndString = weekEnd.toISOString().split("T")[0];

    const snapshot = await db
      .collection("daily_task_history")
      .where("completed", "==", true)
      .where("date", ">=", weekStartString)
      .where("date", "<", weekEndString)
      .orderBy("date")
      .get();
    return snapshot.size;
  } catch (error) {
    console.error("Error getting weekly count:", error);
    throw error;
  }
};

/**
 * Get the count of completed tasks for the current month
 * @param monthStart Start date of the month
 * @returns Promise resolving to the monthly count
 */
export const getMonthlyCount = async (monthStart: Date): Promise<number> => {
  try {
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthStart.getMonth() + 1);

    const monthStartString = monthStart.toISOString().split("T")[0];
    const monthEndString = monthEnd.toISOString().split("T")[0];

    const snapshot = await db
      .collection("daily_task_history")
      .where("completed", "==", true)
      .where("date", ">=", monthStartString)
      .where("date", "<", monthEndString)
      .orderBy("date")
      .get();
    return snapshot.size;
  } catch (error) {
    console.error("Error getting monthly count:", error);
    throw error;
  }
};

/**
 * Calculate comprehensive counter statistics
 * @returns Promise resolving to CounterStatistics object
 */
export const calculateCounterStatistics = async (): Promise<CounterStatistics> => {
  try {
    const now = new Date();
    const weekStart = getWeekStartDate(now);
    const monthStart = getMonthStartDate(now);

    // Get today's count from global counter (simple approach)
    const today = now.toISOString().split("T")[0];
    const dailySnapshot = await db
      .collection("daily_task_history")
      .where("completed", "==", true)
      .where("date", "==", today)
      .get();
    const daily = dailySnapshot.size;

    // Get weekly and monthly counts in parallel
    const [weekly, monthly] = await Promise.all([getWeeklyCount(weekStart), getMonthlyCount(monthStart)]);

    return {
      daily,
      weekly,
      monthly,
      weekStart,
      monthStart,
      lastCalculated: now,
    };
  } catch (error) {
    console.error("Error calculating counter statistics:", error);
    throw error;
  }
};

/**
 * Subscribe to statistics updates (simplified version)
 * In a real implementation, this might use onSnapshot for real-time updates
 * @param callback Function to call with updated statistics
 * @returns Unsubscriber function
 */
export const subscribeToStatistics = (callback: (stats: CounterStatistics) => void): (() => void) => {
  let intervalId: NodeJS.Timeout;

  const updateStats = async () => {
    try {
      const stats = await calculateCounterStatistics();
      callback(stats);
    } catch (error) {
      console.error("Failed to calculate statistics:", error);
    }
  };

  // Initial calculation
  updateStats();

  // Update every 5 minutes (in a real app, this might be less frequent)
  intervalId = setInterval(updateStats, 5 * 60 * 1000);

  // Return unsubscriber
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
};
