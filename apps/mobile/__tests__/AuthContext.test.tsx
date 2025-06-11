import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import * as authService from '../src/services/auth';
import * as messagingService from '../src/services/messaging';
import * as firestoreService from '../src/services/firestore';

// Mock all external dependencies
jest.mock('../src/services/auth');
jest.mock('../src/services/messaging');
jest.mock('../src/services/firestore');

const mockAuthService = authService as jest.Mocked<typeof authService>;
const mockMessagingService = messagingService as jest.Mocked<typeof messagingService>;
const mockFirestoreService = firestoreService as jest.Mocked<typeof firestoreService>;

// Test component that uses AuthContext
const TestComponent = () => {
  const { user, firebaseUser, loading, signIn } = useAuth();
  return (
    <Text testID="auth-state">
      {loading ? 'loading' : user ? `user:${user.id}` : 'no-user'}
    </Text>
  );
};

const mockFirebaseUser = {
  uid: 'test-user-id',
  email: null,
  displayName: null,
  isAnonymous: true
} as any;

const mockUser = {
  id: 'test-user-id',
  createdAt: new Date(),
  language: 'ja',
  timezone: 'Asia/Tokyo',
  fcmToken: 'test-fcm-token'
} as any;

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockAuthService.onAuthStateChange.mockImplementation((callback) => {
      // Initially no user
      callback(null);
      return jest.fn(); // unsubscribe function
    });
    
    mockMessagingService.setupBackgroundMessageListener.mockResolvedValue(undefined);
    mockMessagingService.requestNotificationPermission.mockResolvedValue('test-fcm-token');
    mockMessagingService.setupTokenRefreshListener.mockReturnValue(jest.fn());
    mockMessagingService.setupForegroundMessageListener.mockReturnValue(jest.fn());
    mockMessagingService.setupNotificationOpenedListener.mockReturnValue(jest.fn());
    mockMessagingService.getInitialNotification.mockResolvedValue(null);
    
    mockFirestoreService.updateUserFCMToken.mockResolvedValue(undefined);
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    const TestOutsideProvider = () => {
      try {
        useAuth();
        return <Text>should not reach here</Text>;
      } catch (error) {
        return <Text testID="error">{(error as Error).message}</Text>;
      }
    };

    const { getByTestId } = render(<TestOutsideProvider />);
    
    expect(getByTestId('error')).toBeTruthy();
    expect(getByTestId('error').props.children).toBe('useAuth must be used within an AuthProvider');
  });

  it('should initially show loading state', () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(getByTestId('auth-state').props.children).toBe('loading');
  });

  it('should show no-user state when not authenticated', async () => {
    mockAuthService.onAuthStateChange.mockImplementation((callback) => {
      setTimeout(() => callback(null), 0);
      return jest.fn();
    });

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('auth-state').props.children).toBe('no-user');
    });
  });

  it('should initialize user when Firebase user is authenticated', async () => {
    mockAuthService.initializeUser.mockResolvedValue(mockUser);
    
    mockAuthService.onAuthStateChange.mockImplementation((callback) => {
      setTimeout(() => callback(mockFirebaseUser), 0);
      return jest.fn();
    });

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('auth-state').props.children).toBe('user:test-user-id');
    });

    expect(mockAuthService.initializeUser).toHaveBeenCalledWith(mockFirebaseUser);
  });

  it('should setup FCM when user is authenticated', async () => {
    mockAuthService.initializeUser.mockResolvedValue(mockUser);
    
    mockAuthService.onAuthStateChange.mockImplementation((callback) => {
      setTimeout(() => callback(mockFirebaseUser), 0);
      return jest.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockMessagingService.requestNotificationPermission).toHaveBeenCalled();
      expect(mockFirestoreService.updateUserFCMToken).toHaveBeenCalledWith('test-user-id', 'test-fcm-token');
      expect(mockMessagingService.setupTokenRefreshListener).toHaveBeenCalled();
      expect(mockMessagingService.setupForegroundMessageListener).toHaveBeenCalled();
      expect(mockMessagingService.setupNotificationOpenedListener).toHaveBeenCalled();
      expect(mockMessagingService.getInitialNotification).toHaveBeenCalled();
    });
  });

  it('should handle user initialization error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockAuthService.initializeUser.mockRejectedValue(new Error('User init error'));
    
    mockAuthService.onAuthStateChange.mockImplementation((callback) => {
      setTimeout(() => callback(mockFirebaseUser), 0);
      return jest.fn();
    });

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('auth-state').props.children).toBe('no-user');
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('User initialization error:', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });

  it('should handle FCM setup error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockAuthService.initializeUser.mockResolvedValue(mockUser);
    mockMessagingService.requestNotificationPermission.mockRejectedValue(new Error('FCM error'));
    
    mockAuthService.onAuthStateChange.mockImplementation((callback) => {
      setTimeout(() => callback(mockFirebaseUser), 0);
      return jest.fn();
    });

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('auth-state').props.children).toBe('user:test-user-id');
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('FCM setup error:', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });

  it('should call signInAnonymous when signIn is called', async () => {
    mockAuthService.signInAnonymous.mockResolvedValue(undefined);
    
    const TestSignIn = () => {
      const { signIn } = useAuth();
      React.useEffect(() => {
        signIn();
      }, []);
      return <Text testID="sign-in">signing in</Text>;
    };

    render(
      <AuthProvider>
        <TestSignIn />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockAuthService.signInAnonymous).toHaveBeenCalled();
    });
  });

  it('should handle signIn error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockAuthService.signInAnonymous.mockRejectedValue(new Error('Sign in error'));
    
    const TestSignIn = () => {
      const { signIn } = useAuth();
      React.useEffect(() => {
        signIn();
      }, []);
      return <Text testID="sign-in">signing in</Text>;
    };

    render(
      <AuthProvider>
        <TestSignIn />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Sign in error:', expect.any(Error));
    });
    consoleErrorSpy.mockRestore();
  });

  it('should setup background message listener on mount', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(mockMessagingService.setupBackgroundMessageListener).toHaveBeenCalled();
  });

  it('should cleanup auth state listener on unmount', () => {
    const mockUnsubscribe = jest.fn();
    mockAuthService.onAuthStateChange.mockReturnValue(mockUnsubscribe);

    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});