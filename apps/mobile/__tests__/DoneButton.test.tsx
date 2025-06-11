import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DoneButton } from '../src/components/DoneButton';
import '../src/i18n/test';

describe('DoneButton', () => {
  it('should render DONE! button', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(<DoneButton onPress={mockOnPress} />);
    
    expect(getByTestId('done-button-text')).toBeTruthy();
  });

  it('should call onPress when button is tapped', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(<DoneButton onPress={mockOnPress} />);
    
    const button = getByTestId('done-button');
    fireEvent.press(button);
    
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when loading', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(<DoneButton onPress={mockOnPress} loading={true} />);
    
    const button = getByTestId('done-button');
    fireEvent.press(button);
    
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should show loading state when loading prop is true', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(<DoneButton onPress={mockOnPress} loading={true} />);
    
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });
});