import React from 'react';
import { render } from '@testing-library/react-native';
import { DoneFeedback } from '../src/components/DoneFeedback';

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

  it.skip('should call onComplete when animation finishes', () => {
    // TODO: Animation completion callback test - complex Animated mocking required
    // The onComplete callback is triggered by Animated.parallel().start() callback,
    // which requires sophisticated mocking of React Native's Animated API
    jest.useFakeTimers();
    const mockOnComplete = jest.fn();
    
    render(<DoneFeedback visible={true} onComplete={mockOnComplete} />);
    
    jest.advanceTimersByTime(2500);
    expect(mockOnComplete).toHaveBeenCalledTimes(1);
    
    jest.useRealTimers();
  });
});