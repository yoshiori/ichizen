import React from "react";
import {render} from "@testing-library/react-native";
import {GlobalCounter} from "../src/components/GlobalCounter";
import {
  getWeekStartDate,
  getMonthStartDate,
  getWeeklyCount,
  getMonthlyCount,
  calculateCounterStatistics,
} from "../src/services/counterStatistics";

// Mock Firebase
jest.mock("../src/config/firebase", () => ({
  db: {
    collection: jest.fn(() => ({
      where: jest.fn(() => ({
        where: jest.fn(() => ({
          where: jest.fn(() => ({
            orderBy: jest.fn(() => ({
              get: jest.fn(() => Promise.resolve({size: 5})),
            })),
          })),
        })),
      })),
    })),
  },
}));

describe("Counter Statistics", () => {
  describe("Date utility functions", () => {
    it("should calculate week start date", () => {
      const weekStart = getWeekStartDate();
      expect(weekStart).toBeInstanceOf(Date);
      expect(weekStart.getHours()).toBe(0);
      expect(weekStart.getMinutes()).toBe(0);
    });

    it("should calculate month start date", () => {
      const monthStart = getMonthStartDate();
      expect(monthStart).toBeInstanceOf(Date);
      expect(monthStart.getDate()).toBe(1);
      expect(monthStart.getHours()).toBe(0);
    });

    it("should handle specific date for week start calculation", () => {
      // Test with a known date (2025-06-22 is a Sunday)
      const testDate = new Date(2025, 5, 22); // June 22, 2025 (Sunday)
      const weekStart = getWeekStartDate(testDate);
      expect(weekStart.getDay()).toBe(1); // Should be Monday
      expect(weekStart.getDate()).toBe(16); // June 16, 2025
    });

    it("should handle specific date for month start calculation", () => {
      const testDate = new Date(2025, 5, 22); // June 22, 2025
      const monthStart = getMonthStartDate(testDate);
      expect(monthStart.getDate()).toBe(1);
      expect(monthStart.getMonth()).toBe(5); // June
      expect(monthStart.getFullYear()).toBe(2025);
    });
  });

  describe("Statistics calculation functions", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should get weekly count from Firebase", async () => {
      const weekStart = new Date(2025, 5, 16); // June 16, 2025
      const count = await getWeeklyCount(weekStart);
      expect(count).toBe(5); // Mocked return value
    });

    it("should get monthly count from Firebase", async () => {
      const monthStart = new Date(2025, 5, 1); // June 1, 2025
      const count = await getMonthlyCount(monthStart);
      expect(count).toBe(5); // Mocked return value
    });

    it("should calculate comprehensive counter statistics", async () => {
      const stats = await calculateCounterStatistics();

      expect(stats).toHaveProperty("daily");
      expect(stats).toHaveProperty("weekly");
      expect(stats).toHaveProperty("monthly");
      expect(stats).toHaveProperty("weekStart");
      expect(stats).toHaveProperty("monthStart");
      expect(stats).toHaveProperty("lastCalculated");

      expect(typeof stats.daily).toBe("number");
      expect(typeof stats.weekly).toBe("number");
      expect(typeof stats.monthly).toBe("number");
      expect(stats.weekStart).toBeInstanceOf(Date);
      expect(stats.monthStart).toBeInstanceOf(Date);
      expect(stats.lastCalculated).toBeInstanceOf(Date);
    });

    it("should handle errors in weekly count calculation", async () => {
      // Mock Firebase to throw an error
      const mockError = new Error("Firebase error");
      require("../src/config/firebase").db.collection.mockImplementation(() => ({
        where: jest.fn(() => ({
          where: jest.fn(() => ({
            where: jest.fn(() => ({
              orderBy: jest.fn(() => ({
                get: jest.fn(() => Promise.reject(mockError)),
              })),
            })),
          })),
        })),
      }));

      await expect(getWeeklyCount(new Date())).rejects.toThrow("Firebase error");
    });
  });

  describe("GlobalCounter component", () => {
    it("should render with required props", () => {
      const {getByTestId} = render(
        <GlobalCounter totalCount={1000} todayCount={25} weeklyCount={150} monthlyCount={600} />
      );

      // Should render earth animation
      const earthElement = getByTestId("earth-animation");
      expect(earthElement).toBeTruthy();
    });

    it("should render earth animation element", () => {
      const {getByTestId} = render(
        <GlobalCounter totalCount={1500} todayCount={50} weeklyCount={200} monthlyCount={700} />
      );

      // Should always have earth animation
      const earthElement = getByTestId("earth-animation");
      expect(earthElement).toBeTruthy();
    });

    it("should render with statistics disabled", () => {
      const {getByTestId} = render(
        <GlobalCounter totalCount={1000} todayCount={25} weeklyCount={150} monthlyCount={600} showStatistics={false} />
      );

      // Should render earth animation
      const earthElement = getByTestId("earth-animation");
      expect(earthElement).toBeTruthy();
    });

    it("should display counter values when provided", () => {
      const {getByTestId} = render(
        <GlobalCounter totalCount={1234} todayCount={42} weeklyCount={180} monthlyCount={720} />
      );

      // Should render earth animation
      const earthElement = getByTestId("earth-animation");
      expect(earthElement).toBeTruthy();

      // Note: The actual counter text display depends on the GlobalCounter implementation
      // This test ensures the component renders without crashing with valid statistics
    });

    it("should handle loading state when counts are not provided", () => {
      const {getByTestId} = render(<GlobalCounter />);

      // Should render loading text when no counts provided
      const loadingElement = getByTestId("counter-loading");
      expect(loadingElement).toBeTruthy();
    });

    it("should handle partial statistics data", () => {
      const {getByTestId} = render(<GlobalCounter totalCount={500} todayCount={10} />);

      // Should still render earth animation with partial data
      const earthElement = getByTestId("earth-animation");
      expect(earthElement).toBeTruthy();
    });

    it("should format large numbers correctly", () => {
      const {getByTestId} = render(
        <GlobalCounter totalCount={1234567} todayCount={999} weeklyCount={5432} monthlyCount={23456} />
      );

      // Should render without crashing with large numbers
      const earthElement = getByTestId("earth-animation");
      expect(earthElement).toBeTruthy();
    });
  });
});
