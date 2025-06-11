import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DoneButton } from '../src/components/DoneButton';

describe('DoneButton', () => {
  it('should render DONE! button', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(<DoneButton onPress={mockOnPress} />);
    
    expect(getByText('DONE!')).toBeTruthy();
  });

  it('should call onPress when button is tapped', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(<DoneButton onPress={mockOnPress} />);
    
    fireEvent.press(getByText('DONE!'));
    
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when loading', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(<DoneButton onPress={mockOnPress} loading={true} />);
    
    const loadingIndicator = getByTestId('loading-indicator');
    fireEvent.press(loadingIndicator.parent);
    
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should show loading state when loading prop is true', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(<DoneButton onPress={mockOnPress} loading={true} />);
    
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });
});