import React from "react";
import {render} from "@testing-library/react-native";
import {GlobalCounter} from "../src/components/GlobalCounter";
import {getWeekStartDate, getMonthStartDate} from "../src/services/counterStatistics";

describe("Counter Statistics", () => {
  describe("Date utility functions", () => {
    it("should calculate week start date", () => {
      const weekStart = getWeekStartDate();
      expect(weekStart).toBeInstanceOf(Date);
    });

    it("should calculate month start date", () => {
      const monthStart = getMonthStartDate();
      expect(monthStart).toBeInstanceOf(Date);
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
  });
});
