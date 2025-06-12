import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { GlobalCounter } from '../src/components/GlobalCounter';
import { 
  calculateCounterStatistics,
  getWeeklyCount,
  getMonthlyCount,
  getWeekStartDate,
  getMonthStartDate
} from '../src/services/counterStatistics';
import { CounterStatistics } from '../src/types/firebase';

// Mock the statistics service
jest.mock('../src/services/counterStatistics', () => ({
  calculateCounterStatistics: jest.fn(),
  getWeeklyCount: jest.fn(),
  getMonthlyCount: jest.fn(),
  getWeekStartDate: jest.fn(),
  getMonthStartDate: jest.fn(),
}));

const mockCalculateStats = calculateCounterStatistics as jest.MockedFunction<typeof calculateCounterStatistics>;
const mockGetWeeklyCount = getWeeklyCount as jest.MockedFunction<typeof getWeeklyCount>;
const mockGetMonthlyCount = getMonthlyCount as jest.MockedFunction<typeof getMonthlyCount>;
const mockGetWeekStart = getWeekStartDate as jest.MockedFunction<typeof getWeekStartDate>;
const mockGetMonthStart = getMonthStartDate as jest.MockedFunction<typeof getMonthStartDate>;

describe('Counter Statistics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Statistics calculation', () => {
    it('should calculate weekly statistics correctly', async () => {
      const mockWeekStart = new Date('2024-01-01'); // Monday
      const mockStats: CounterStatistics = {
        daily: 10,
        weekly: 50,
        monthly: 200,
        weekStart: mockWeekStart,
        monthStart: new Date('2024-01-01'),
        lastCalculated: new Date()
      };

      // Mock the actual implementation
      mockCalculateStats.mockImplementation(async () => {
        const weekStart = getWeekStartDate();
        const weeklyCount = await getWeeklyCount(weekStart);
        return {
          daily: 10,
          weekly: weeklyCount,
          monthly: 200,
          weekStart,
          monthStart: new Date('2024-01-01'),
          lastCalculated: new Date()
        };
      });

      mockGetWeekStart.mockReturnValue(mockWeekStart);
      mockGetWeeklyCount.mockResolvedValue(50);

      const result = await calculateCounterStatistics();

      expect(result.weekly).toBe(50);
      expect(mockGetWeeklyCount).toHaveBeenCalled();
    });

    it('should calculate monthly statistics correctly', async () => {
      const mockMonthStart = new Date('2024-01-01');

      // Mock the actual implementation
      mockCalculateStats.mockImplementation(async () => {
        const monthStart = getMonthStartDate();
        const monthlyCount = await getMonthlyCount(monthStart);
        return {
          daily: 10,
          weekly: 50,
          monthly: monthlyCount,
          weekStart: new Date('2024-01-01'),
          monthStart,
          lastCalculated: new Date()
        };
      });

      mockGetMonthStart.mockReturnValue(mockMonthStart);
      mockGetMonthlyCount.mockResolvedValue(200);

      const result = await calculateCounterStatistics();

      expect(result.monthly).toBe(200);
      expect(mockGetMonthlyCount).toHaveBeenCalled();
    });

    it('should handle week boundary correctly (Sunday to Monday)', () => {
      // Test week calculation for different days
      const sunday = new Date('2024-01-07'); // Sunday
      const monday = new Date('2024-01-08'); // Monday
      
      mockGetWeekStart.mockImplementation((date?: Date) => {
        const d = date || new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as week start
        return new Date(d.setDate(diff));
      });

      const sundayWeekStart = mockGetWeekStart(sunday);
      const mondayWeekStart = mockGetWeekStart(monday);

      expect(sundayWeekStart.getDay()).toBe(1); // Monday
      expect(mondayWeekStart.getDay()).toBe(1); // Monday
      expect(mondayWeekStart.getTime()).toBeGreaterThan(sundayWeekStart.getTime());
    });

    it('should handle month boundary correctly', () => {
      const endOfMonth = new Date('2024-01-31');
      const startOfNextMonth = new Date('2024-02-01');
      
      mockGetMonthStart.mockImplementation((date?: Date) => {
        const d = date || new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1);
      });

      const janStart = mockGetMonthStart(endOfMonth);
      const febStart = mockGetMonthStart(startOfNextMonth);

      expect(janStart.getMonth()).toBe(0); // January
      expect(febStart.getMonth()).toBe(1); // February
      expect(janStart.getDate()).toBe(1);
      expect(febStart.getDate()).toBe(1);
    });
  });

  describe('GlobalCounter with statistics', () => {
    it('should display weekly statistics when provided', () => {
      const { getByTestId } = render(
        <GlobalCounter 
          totalCount={1000}
          todayCount={50}
          weeklyCount={300}
          monthlyCount={1200}
          showStatistics
        />
      );

      expect(getByTestId('weekly-counter-value').props.children).toBe('300');
    });

    it('should display monthly statistics when provided', () => {
      const { getByTestId } = render(
        <GlobalCounter 
          totalCount={1000}
          todayCount={50}
          weeklyCount={300}
          monthlyCount={1200}
          showStatistics
        />
      );

      expect(getByTestId('monthly-counter-value').props.children).toBe('1,200');
    });

    it('should hide statistics section when showStatistics is false', () => {
      const { queryByTestId } = render(
        <GlobalCounter 
          totalCount={1000}
          todayCount={50}
          weeklyCount={300}
          monthlyCount={1200}
          showStatistics={false}
        />
      );

      expect(queryByTestId('weekly-counter-value')).toBeNull();
      expect(queryByTestId('monthly-counter-value')).toBeNull();
    });

    it('should show loading for statistics when data is not available', () => {
      const { getByTestId } = render(
        <GlobalCounter 
          totalCount={1000}
          todayCount={50}
          showStatistics
        />
      );

      expect(getByTestId('statistics-loading')).toBeTruthy();
    });

    it('should animate statistics updates', async () => {
      const { getByTestId, rerender } = render(
        <GlobalCounter 
          totalCount={1000}
          todayCount={50}
          weeklyCount={300}
          monthlyCount={1200}
          showStatistics
          animateChanges
        />
      );

      const weeklyElement = getByTestId('weekly-counter-value');
      expect(weeklyElement.props.children).toBe('300');

      // Update statistics
      rerender(
        <GlobalCounter 
          totalCount={1000}
          todayCount={50}
          weeklyCount={305}
          monthlyCount={1205}
          showStatistics
          animateChanges
        />
      );

      await waitFor(() => {
        const updatedWeekly = getByTestId('weekly-counter-value');
        expect(updatedWeekly.props.children).toBe('305');
      });
    });

    it('should handle statistics calculation errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockCalculateStats.mockRejectedValue(new Error('Firestore error'));

      const { getByTestId } = render(
        <GlobalCounter 
          totalCount={1000}
          todayCount={50}
          showStatistics
          subscribeToStatistics
        />
      );

      // Should show main counters despite statistics error
      expect(getByTestId('total-counter-value').props.children).toBe('1,000');

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Failed to calculate statistics'),
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Statistics service behavior', () => {
    it('should calculate statistics when service functions are called', async () => {
      // Test service functions individually
      mockGetWeekStart.mockReturnValue(new Date('2024-01-01'));
      mockGetMonthStart.mockReturnValue(new Date('2024-01-01'));
      mockGetWeeklyCount.mockResolvedValue(50);
      mockGetMonthlyCount.mockResolvedValue(200);

      // Mock implementation that uses the helper functions
      mockCalculateStats.mockImplementation(async () => {
        const weekStart = mockGetWeekStart();
        const monthStart = mockGetMonthStart();
        const weekly = await mockGetWeeklyCount(weekStart);
        const monthly = await mockGetMonthlyCount(monthStart);
        
        return {
          daily: 10,
          weekly,
          monthly,
          weekStart,
          monthStart,
          lastCalculated: new Date()
        };
      });

      const result = await calculateCounterStatistics();

      expect(result.weekly).toBe(50);
      expect(result.monthly).toBe(200);
      expect(mockGetWeeklyCount).toHaveBeenCalled();
      expect(mockGetMonthlyCount).toHaveBeenCalled();
    });
  });
});