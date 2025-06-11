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

  it('should call onComplete when animation finishes', (done) => {
    const mockOnComplete = jest.fn(() => done());
    
    render(<DoneFeedback visible={true} onComplete={mockOnComplete} />);
    
    // Animation should complete after a delay
    setTimeout(() => {
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
      done();
    }, 3000);
  });
});