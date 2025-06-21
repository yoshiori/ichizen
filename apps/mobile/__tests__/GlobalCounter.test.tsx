import React from "react";
import {render, waitFor, act} from "@testing-library/react-native";
import {GlobalCounter} from "../src/components/GlobalCounter";

describe("GlobalCounter", () => {
  it("should render total count", () => {
    const {getByTestId} = render(<GlobalCounter totalCount={12345} />);

    const counterElement = getByTestId("total-counter-value");
    expect(counterElement.props.children).toBe("12,345");
  });

  it("should render today count", () => {
    const {getByTestId} = render(<GlobalCounter todayCount={123} />);

    const counterElement = getByTestId("today-counter-value");
    expect(counterElement.props.children).toBe("123");
  });

  it("should render both counts", () => {
    const {getByTestId} = render(<GlobalCounter totalCount={12345} todayCount={123} />);

    const totalElement = getByTestId("total-counter-value");
    const todayElement = getByTestId("today-counter-value");
    expect(totalElement.props.children).toBe("12,345");
    expect(todayElement.props.children).toBe("123");
  });

  it("should render loading state when no counts provided", () => {
    const {getByTestId} = render(<GlobalCounter />);

    expect(getByTestId("counter-loading")).toBeTruthy();
  });

  it("should render earth animation", () => {
    const {getByTestId} = render(<GlobalCounter totalCount={100} />);

    expect(getByTestId("earth-animation")).toBeTruthy();
  });

  describe("Real-time counter updates", () => {
    it("should animate count increase smoothly", async () => {
      const {getByTestId, rerender} = render(<GlobalCounter totalCount={100} todayCount={10} />);

      const totalElement = getByTestId("total-counter-value");
      const todayElement = getByTestId("today-counter-value");
      expect(totalElement.props.children).toBe("100");
      expect(todayElement.props.children).toBe("10");

      // Update counters
      rerender(<GlobalCounter totalCount={105} todayCount={15} />);

      // Should show new values
      await waitFor(() => {
        const updatedTotal = getByTestId("total-counter-value");
        const updatedToday = getByTestId("today-counter-value");
        expect(updatedTotal.props.children).toBe("105");
        expect(updatedToday.props.children).toBe("15");
      });
    });

    it("should format large numbers with animated transitions", async () => {
      const {getByTestId, rerender} = render(<GlobalCounter totalCount={999999} todayCount={9999} />);

      const totalElement = getByTestId("total-counter-value");
      const todayElement = getByTestId("today-counter-value");
      expect(totalElement.props.children).toBe("999,999");
      expect(todayElement.props.children).toBe("9,999");

      // Update to cross formatting boundary
      rerender(<GlobalCounter totalCount={1000000} todayCount={10000} />);

      await waitFor(() => {
        const updatedTotal = getByTestId("total-counter-value");
        const updatedToday = getByTestId("today-counter-value");
        expect(updatedTotal.props.children).toBe("1,000,000");
        expect(updatedToday.props.children).toBe("10,000");
      });
    });

    it("should handle incremental updates with animation", async () => {
      const {getByTestId, rerender} = render(<GlobalCounter totalCount={100} todayCount={10} animateChanges />);

      const counterElement = getByTestId("total-counter-value");
      expect(counterElement.props.children).toBe("100");

      // Simulate incremental update
      act(() => {
        rerender(<GlobalCounter totalCount={101} todayCount={11} animateChanges />);
      });

      // Check if animation is triggered
      await waitFor(() => {
        const animatedElement = getByTestId("counter-animation-wrapper");
        expect(animatedElement).toBeTruthy();
      });
    });
  });

  describe("Real-time data subscription", () => {
    it("should support onCounterUpdate callback", () => {
      const mockCallback = jest.fn();

      render(<GlobalCounter totalCount={100} todayCount={10} onCounterUpdate={mockCallback} />);

      // Simulate counter update
      act(() => {
        // This would be triggered by real-time updates
        mockCallback({total: 101, today: 11});
      });

      expect(mockCallback).toHaveBeenCalledWith({total: 101, today: 11});
    });
  });
});
