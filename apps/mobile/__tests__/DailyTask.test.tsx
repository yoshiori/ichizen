import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DailyTask } from '../src/components/DailyTask';

const mockTask = {
  id: 'test-task-1',
  text: {
    ja: 'ありがとうを言う',
    en: 'Say thank you'
  },
  category: {
    ja: '人間関係',
    en: 'Relationships'
  },
  icon: '💝'
};

describe('DailyTask', () => {
  it('should render task text in Japanese', () => {
    const { getByText } = render(<DailyTask task={mockTask} language="ja" />);
    
    expect(getByText('ありがとうを言う')).toBeTruthy();
  });

  it('should render task text in English', () => {
    const { getByText } = render(<DailyTask task={mockTask} language="en" />);
    
    expect(getByText('Say thank you')).toBeTruthy();
  });

  it('should render task category icon', () => {
    const { getByText } = render(<DailyTask task={mockTask} language="ja" />);
    
    expect(getByText('💝')).toBeTruthy();
  });

  it('should render task category label', () => {
    const { getByTestId } = render(<DailyTask task={mockTask} language="ja" />);
    
    expect(getByTestId('task-category')).toBeTruthy();
  });

  it('should render refresh button', () => {
    const mockOnRefresh = jest.fn();
    const { getByTestId } = render(
      <DailyTask task={mockTask} language="ja" onRefresh={mockOnRefresh} />
    );
    
    expect(getByTestId('refresh-task-button')).toBeTruthy();
  });

  it('should call onRefresh when refresh button is pressed', () => {
    const mockOnRefresh = jest.fn();
    const { getByTestId } = render(
      <DailyTask task={mockTask} language="ja" onRefresh={mockOnRefresh} />
    );
    
    fireEvent.press(getByTestId('refresh-task-button'));
    
    expect(mockOnRefresh).toHaveBeenCalledTimes(1);
  });

  it('should disable refresh button when refreshUsed is true', () => {
    const mockOnRefresh = jest.fn();
    const { getByTestId } = render(
      <DailyTask 
        task={mockTask} 
        language="ja" 
        onRefresh={mockOnRefresh} 
        refreshUsed={true} 
      />
    );
    
    const refreshButton = getByTestId('refresh-task-button');
    fireEvent.press(refreshButton);
    
    expect(mockOnRefresh).not.toHaveBeenCalled();
  });
});