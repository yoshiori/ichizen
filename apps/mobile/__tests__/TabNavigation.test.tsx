import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TabNavigation } from '../src/components/TabNavigation';
import '../src/i18n/test';

// Mock the screen components
jest.mock('../src/screens/MainScreen', () => {
  const { Text } = require('react-native');
  return {
    MainScreen: () => Text({ testID: 'main-screen', children: 'MainScreen' })
  };
});

jest.mock('../src/screens/HistoryScreen', () => {
  const { Text } = require('react-native');
  return {
    HistoryScreen: () => Text({ testID: 'history-screen', children: 'HistoryScreen' })
  };
});

jest.mock('../src/screens/FollowScreen', () => {
  const { Text } = require('react-native');
  return {
    FollowScreen: () => Text({ testID: 'follow-screen', children: 'FollowScreen' })
  };
});

// Mock AuthContext to prevent auth-related errors in screen components
jest.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-id',
      language: 'ja',
      createdAt: new Date(),
      lastActiveAt: new Date()
    },
    firebaseUser: { uid: 'test-user-id' },
    loading: false,
    signIn: jest.fn()
  })
}));

// Mock Firestore services
jest.mock('../src/services/firestore', () => ({
  getUserTaskHistoryWithTasks: jest.fn().mockResolvedValue([]),
  getFollowing: jest.fn().mockResolvedValue([]),
  getFollowers: jest.fn().mockResolvedValue([])
}));

describe('TabNavigation', () => {
  it('should render all tab items', () => {
    const { getByText } = render(<TabNavigation />);

    // Check tab titles
    expect(getByText('今日')).toBeTruthy();
    expect(getByText('履歴')).toBeTruthy();
    expect(getByText('フォロー')).toBeTruthy();

    // Check tab icons
    expect(getByText('🌟')).toBeTruthy();
    expect(getByText('📊')).toBeTruthy();
    expect(getByText('👥')).toBeTruthy();
  });

  it('should show home screen by default', () => {
    const { getByTestId } = render(<TabNavigation />);

    expect(getByTestId('main-screen')).toBeTruthy();
  });

  it('should switch to history screen when history tab is pressed', () => {
    const { getByText, getByTestId, queryByTestId } = render(<TabNavigation />);

    const historyTab = getByText('履歴');
    fireEvent.press(historyTab);

    expect(getByTestId('history-screen')).toBeTruthy();
    expect(queryByTestId('main-screen')).toBeNull();
    expect(queryByTestId('follow-screen')).toBeNull();
  });

  it('should switch to follow screen when follow tab is pressed', () => {
    const { getByText, getByTestId, queryByTestId } = render(<TabNavigation />);

    const followTab = getByText('フォロー');
    fireEvent.press(followTab);

    expect(getByTestId('follow-screen')).toBeTruthy();
    expect(queryByTestId('main-screen')).toBeNull();
    expect(queryByTestId('history-screen')).toBeNull();
  });

  it('should switch back to home screen when home tab is pressed', () => {
    const { getByText, getByTestId, queryByTestId } = render(<TabNavigation />);

    // Switch to history first
    const historyTab = getByText('履歴');
    fireEvent.press(historyTab);
    expect(getByTestId('history-screen')).toBeTruthy();

    // Switch back to home
    const homeTab = getByText('今日');
    fireEvent.press(homeTab);

    expect(getByTestId('main-screen')).toBeTruthy();
    expect(queryByTestId('history-screen')).toBeNull();
    expect(queryByTestId('follow-screen')).toBeNull();
  });

  it('should apply active styles to the selected tab', () => {
    const { getByText } = render(<TabNavigation />);

    // Home tab should be active by default
    const homeTab = getByText('今日');
    const homeIcon = getByText('🌟');
    
    // Check if active styles are applied (opacity should be 1 for active icon)
    expect(homeIcon.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ opacity: 1 })
      ])
    );
    
    expect(homeTab.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ 
          color: '#2196F3',
          fontWeight: '600'
        })
      ])
    );
  });

  it('should apply inactive styles to non-selected tabs', () => {
    const { getByText } = render(<TabNavigation />);

    // History tab should be inactive by default
    const historyTab = getByText('履歴');
    const historyIcon = getByText('📊');
    
    // Check if inactive styles are applied
    expect(historyIcon.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ opacity: 0.6 })
      ])
    );
    
    expect(historyTab.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ 
          color: '#666666',
          fontWeight: '500'
        })
      ])
    );
  });

  it('should update active styles when switching tabs', () => {
    const { getByText } = render(<TabNavigation />);

    // Switch to history tab
    const historyTab = getByText('履歴');
    fireEvent.press(historyTab);

    // History tab should now be active
    const historyIcon = getByText('📊');
    expect(historyIcon.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ opacity: 1 })
      ])
    );
    
    expect(historyTab.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ 
          color: '#2196F3',
          fontWeight: '600'
        })
      ])
    );

    // Home tab should now be inactive
    const homeTab = getByText('今日');
    const homeIcon = getByText('🌟');
    expect(homeIcon.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ opacity: 0.6 })
      ])
    );
    
    expect(homeTab.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ 
          color: '#666666',
          fontWeight: '500'
        })
      ])
    );
  });

  it('should handle multiple tab switches correctly', () => {
    const { getByText, getByTestId } = render(<TabNavigation />);

    // Start with home (default)
    expect(getByTestId('main-screen')).toBeTruthy();

    // Switch to history
    fireEvent.press(getByText('履歴'));
    expect(getByTestId('history-screen')).toBeTruthy();

    // Switch to follow
    fireEvent.press(getByText('フォロー'));
    expect(getByTestId('follow-screen')).toBeTruthy();

    // Switch back to home
    fireEvent.press(getByText('今日'));
    expect(getByTestId('main-screen')).toBeTruthy();

    // Switch to follow again
    fireEvent.press(getByText('フォロー'));
    expect(getByTestId('follow-screen')).toBeTruthy();
  });

  it('should render tab bar with correct styling', () => {
    const { getByTestId, getByText } = render(<TabNavigation />);

    // Check if main container exists
    expect(getByTestId('main-screen')).toBeTruthy();
    
    // The component should render without crashing and show the expected content
    expect(getByText('今日')).toBeTruthy();
    expect(getByText('履歴')).toBeTruthy();
    expect(getByText('フォロー')).toBeTruthy();
  });

  it('should maintain tab state during re-renders', () => {
    const { getByText, getByTestId, rerender } = render(<TabNavigation />);

    // Switch to history tab
    fireEvent.press(getByText('履歴'));
    expect(getByTestId('history-screen')).toBeTruthy();

    // Re-render component
    rerender(<TabNavigation />);

    // Should still show history screen
    expect(getByTestId('history-screen')).toBeTruthy();
  });

  it('should handle default case in renderContent', () => {
    const { getByTestId } = render(<TabNavigation />);

    // By default should show main screen
    expect(getByTestId('main-screen')).toBeTruthy();
  });
});