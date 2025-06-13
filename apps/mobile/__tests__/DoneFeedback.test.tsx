import React from 'react';
import { render } from '@testing-library/react-native';
import { Animated } from 'react-native';
import { DoneFeedback } from '../src/components/DoneFeedback';

// Mock React Native Animated API
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  
  // Keep the original Animated API but mock specific methods if needed
  RN.Animated.timing = jest.fn((value, config) => ({
    start: jest.fn((callback) => {
      if (callback) callback({ finished: true });
    })
  }));
  
  RN.Animated.spring = jest.fn((value, config) => ({
    start: jest.fn((callback) => {
      if (callback) callback({ finished: true });
    })
  }));

  return RN;
});

describe('DoneFeedback', () => {
  it('should not render when not visible', () => {
    const { queryByTestId } = render(<DoneFeedback visible={false} />);
    
    expect(queryByTestId('done-feedback')).toBeNull();
  });

  it('should render feedback message when visible', () => {
    const { getByTestId, getByText } = render(<DoneFeedback visible={true} />);
    
    expect(getByTestId('done-feedback')).toBeTruthy();
    expect(getByText(/あなたのこの行動は/)).toBeTruthy();
  });

  it('should show animation when visible', () => {
    const { getByTestId } = render(<DoneFeedback visible={true} />);
    
    expect(getByTestId('celebration-animation')).toBeTruthy();
  });

  it('should render with onComplete callback prop', () => {
    // Test that component renders correctly with onComplete prop
    // This verifies the prop interface without testing complex animation timing
    const mockOnComplete = jest.fn();
    
    const { getByTestId } = render(<DoneFeedback visible={true} onComplete={mockOnComplete} />);
    
    // Verify component renders with callback prop
    expect(getByTestId('done-feedback')).toBeTruthy();
    expect(getByTestId('celebration-animation')).toBeTruthy();
  });
});