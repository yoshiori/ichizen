import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { GlobalCounter } from '../src/components/GlobalCounter';
import { 
  subscribeToGlobalCounter, 
  unsubscribeFromGlobalCounter 
} from '../src/services/globalCounterSubscription';

// Mock Firestore subscription service
jest.mock('../src/services/globalCounterSubscription', () => ({
  subscribeToGlobalCounter: jest.fn(),
  unsubscribeFromGlobalCounter: jest.fn(),
}));

const mockSubscribe = subscribeToGlobalCounter as jest.MockedFunction<typeof subscribeToGlobalCounter>;
const mockUnsubscribe = unsubscribeFromGlobalCounter as jest.MockedFunction<typeof unsubscribeFromGlobalCounter>;

describe('GlobalCounter Firestore Persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should subscribe to Firestore updates on mount', async () => {
    const mockCallback = jest.fn();
    const mockUnsubscriber = jest.fn();
    
    mockSubscribe.mockImplementation((callback) => {
      // Simulate initial data load
      setTimeout(() => {
        callback({ totalCompleted: 1000, todayCompleted: 50 });
      }, 100);
      return mockUnsubscriber;
    });

    const { getByTestId } = render(
      <GlobalCounter subscribeToUpdates onCounterUpdate={mockCallback} />
    );

    // Should show loading initially
    expect(getByTestId('counter-loading')).toBeTruthy();

    // Should subscribe to Firestore
    expect(mockSubscribe).toHaveBeenCalledWith(expect.any(Function));

    // Should receive and display data from Firestore
    await waitFor(() => {
      const totalElement = getByTestId('total-counter-value');
      expect(totalElement.props.children).toBe('1,000');
    });

    expect(mockCallback).toHaveBeenCalledWith({ 
      total: 1000, 
      today: 50 
    });
  });

  it('should handle real-time Firestore updates', async () => {
    let firestoreCallback: ((data: any) => void) | null = null;
    const mockUnsubscriber = jest.fn();
    
    mockSubscribe.mockImplementation((callback) => {
      firestoreCallback = callback;
      // Simulate initial data
      setTimeout(() => callback({ totalCompleted: 1000, todayCompleted: 50 }), 50);
      return mockUnsubscriber;
    });

    const { getByTestId } = render(
      <GlobalCounter subscribeToUpdates animateChanges />
    );

    // Wait for initial data
    await waitFor(() => {
      expect(getByTestId('total-counter-value').props.children).toBe('1,000');
    });

    // Simulate Firestore update
    act(() => {
      if (firestoreCallback) {
        firestoreCallback({ totalCompleted: 1001, todayCompleted: 51 });
      }
    });

    // Should show updated values
    await waitFor(() => {
      expect(getByTestId('total-counter-value').props.children).toBe('1,001');
      expect(getByTestId('today-counter-value').props.children).toBe('51');
    });
  });

  it('should unsubscribe on unmount', () => {
    const mockUnsubscriber = jest.fn();
    mockSubscribe.mockImplementation((callback) => {
      // Simulate initial data to trigger subscription
      setTimeout(() => callback({ totalCompleted: 100, todayCompleted: 10 }), 10);
      return mockUnsubscriber;
    });

    const { unmount } = render(<GlobalCounter subscribeToUpdates />);

    expect(mockSubscribe).toHaveBeenCalled();

    unmount();

    expect(mockUnsubscriber).toHaveBeenCalled();
  });

  it('should handle subscription errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    mockSubscribe.mockImplementation(() => {
      // Simulate subscription error by throwing immediately
      throw new Error('Firestore connection failed');
    });

    const { getByTestId } = render(<GlobalCounter subscribeToUpdates />);

    // Should still show loading and not crash
    expect(getByTestId('counter-loading')).toBeTruthy();

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to subscribe to global counter'),
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  it('should work in offline mode with cached data', async () => {
    const mockUnsubscriber = jest.fn();
    
    mockSubscribe.mockImplementation((callback) => {
      // Simulate cached data from offline storage
      setTimeout(() => {
        callback({ totalCompleted: 500, todayCompleted: 25, fromCache: true });
      }, 50);
      return mockUnsubscriber;
    });

    const { getByTestId } = render(<GlobalCounter subscribeToUpdates />);

    await waitFor(() => {
      expect(getByTestId('total-counter-value').props.children).toBe('500');
      expect(getByTestId('today-counter-value').props.children).toBe('25');
    });
  });
});