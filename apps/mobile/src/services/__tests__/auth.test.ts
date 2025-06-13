import { 
  signInAnonymous, 
  signInWithGoogle, 
  signInWithApple, 
  getCurrentUser,
  initializeUser
} from '../auth';
import { auth } from '../../config/firebase';
import { createUser, getUser } from '../firestore';

// Mock Firebase modules
jest.mock('firebase/auth', () => ({
  signInAnonymously: jest.fn(),
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  OAuthProvider: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('../../config/firebase', () => ({
  auth: {
    currentUser: null
  }
}));

jest.mock('../firestore', () => ({
  createUser: jest.fn(),
  getUser: jest.fn(),
}));

const mockFirebaseAuth = require('firebase/auth');
const mockFirestore = require('../firestore');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Anonymous Authentication', () => {
    it('should sign in anonymously successfully', async () => {
      const mockUser = { uid: 'anonymous-user-123', isAnonymous: true };
      mockFirebaseAuth.signInAnonymously.mockResolvedValue({ user: mockUser });

      const result = await signInAnonymous();

      expect(mockFirebaseAuth.signInAnonymously).toHaveBeenCalledWith(auth);
      expect(result).toEqual(mockUser);
    });

    it('should handle anonymous sign-in error', async () => {
      const error = new Error('Network error');
      mockFirebaseAuth.signInAnonymously.mockRejectedValue(error);

      await expect(signInAnonymous()).rejects.toThrow('Network error');
    });
  });

  describe('Google Authentication', () => {
    it('should sign in with Google successfully', async () => {
      const mockUser = { uid: 'google-user-123', email: 'test@gmail.com' };
      const mockProvider = { addScope: jest.fn() };
      
      mockFirebaseAuth.GoogleAuthProvider.mockImplementation(() => mockProvider);
      mockFirebaseAuth.signInWithPopup.mockResolvedValue({ user: mockUser });

      const result = await signInWithGoogle();

      expect(mockFirebaseAuth.GoogleAuthProvider).toHaveBeenCalled();
      expect(mockFirebaseAuth.signInWithPopup).toHaveBeenCalledWith(auth, mockProvider);
      expect(result).toEqual(mockUser);
    });

    it('should handle Google sign-in error', async () => {
      const error = new Error('Google sign-in failed');
      mockFirebaseAuth.signInWithPopup.mockRejectedValue(error);

      await expect(signInWithGoogle()).rejects.toThrow('Google sign-in failed');
    });
  });

  describe('Apple Authentication', () => {
    it('should sign in with Apple successfully', async () => {
      const mockUser = { uid: 'apple-user-123', email: 'test@privaterelay.appleid.com' };
      const mockProvider = { addScope: jest.fn() };
      
      mockFirebaseAuth.OAuthProvider.mockImplementation(() => mockProvider);
      mockFirebaseAuth.signInWithPopup.mockResolvedValue({ user: mockUser });

      const result = await signInWithApple();

      expect(mockFirebaseAuth.OAuthProvider).toHaveBeenCalledWith('apple.com');
      expect(mockProvider.addScope).toHaveBeenCalledWith('email');
      expect(mockProvider.addScope).toHaveBeenCalledWith('name');
      expect(mockFirebaseAuth.signInWithPopup).toHaveBeenCalledWith(auth, mockProvider);
      expect(result).toEqual(mockUser);
    });

    it('should handle Apple sign-in error', async () => {
      const error = new Error('Apple sign-in failed');
      mockFirebaseAuth.signInWithPopup.mockRejectedValue(error);

      await expect(signInWithApple()).rejects.toThrow('Apple sign-in failed');
    });
  });

  describe('User Initialization', () => {
    it('should initialize new user', async () => {
      const mockFirebaseUser = { uid: 'new-user-123' };
      const mockUserData = {
        language: 'ja',
        createdAt: expect.any(Date),
        lastActiveAt: expect.any(Date)
      };

      mockFirestore.getUser.mockResolvedValue(null);
      mockFirestore.createUser.mockResolvedValue(undefined);

      const result = await initializeUser(mockFirebaseUser as any);

      expect(mockFirestore.getUser).toHaveBeenCalledWith('new-user-123');
      expect(mockFirestore.createUser).toHaveBeenCalledWith('new-user-123', mockUserData);
      expect(result).toEqual({
        id: 'new-user-123',
        ...mockUserData
      });
    });

    it('should return existing user', async () => {
      const mockFirebaseUser = { uid: 'existing-user-123' };
      const existingUser = {
        id: 'existing-user-123',
        language: 'en',
        createdAt: new Date('2023-01-01'),
        lastActiveAt: new Date('2023-01-02')
      };

      mockFirestore.getUser.mockResolvedValue(existingUser);

      const result = await initializeUser(mockFirebaseUser as any);

      expect(mockFirestore.getUser).toHaveBeenCalledWith('existing-user-123');
      expect(mockFirestore.createUser).not.toHaveBeenCalled();
      expect(result).toEqual(existingUser);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', () => {
      const mockUser = { uid: 'current-user-123' };
      (auth as any).currentUser = mockUser;

      const result = getCurrentUser();

      expect(result).toEqual(mockUser);
    });

    it('should return null when no user', () => {
      (auth as any).currentUser = null;

      const result = getCurrentUser();

      expect(result).toBeNull();
    });
  });
});