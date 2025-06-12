import { 
  signInAnonymously, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth } from '../src/config/firebase';
import * as firestoreService from '../src/services/firestore';
import {
  signInWithGoogle,
  signInAnonymous,
  getCurrentUser,
  onAuthStateChange,
  initializeUser
} from '../src/services/auth';

// Mock Firebase Auth
jest.mock('firebase/auth');
jest.mock('../src/config/firebase');
jest.mock('../src/services/firestore');

const mockSignInAnonymously = signInAnonymously as jest.MockedFunction<typeof signInAnonymously>;
const mockSignInWithPopup = signInWithPopup as jest.MockedFunction<typeof signInWithPopup>;
const mockOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<typeof onAuthStateChanged>;
const mockFirestoreService = firestoreService as jest.Mocked<typeof firestoreService>;

const mockFirebaseUser: FirebaseUser = {
  uid: 'test-user-id',
  email: null,
  displayName: null,
  isAnonymous: true,
  emailVerified: false,
  phoneNumber: null,
  photoURL: null,
  providerId: 'firebase',
  refreshToken: 'refresh-token',
  tenantId: null
} as any;

const mockAuthResult = {
  user: mockFirebaseUser,
  providerId: 'firebase',
  operationType: 'signIn'
} as any;

const mockUser = {
  id: 'test-user-id',
  language: 'ja' as const,
  createdAt: new Date('2023-01-01'),
  lastActiveAt: new Date('2023-01-01')
};

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signInWithGoogle', () => {
    it('should sign in with Google provider', async () => {
      mockSignInWithPopup.mockResolvedValue(mockAuthResult);

      const result = await signInWithGoogle();

      expect(mockSignInWithPopup).toHaveBeenCalledWith(
        auth,
        expect.any(GoogleAuthProvider)
      );
      expect(result).toBe(mockFirebaseUser);
    });

    it('should throw error when Google sign in fails', async () => {
      const error = new Error('Google sign in failed');
      mockSignInWithPopup.mockRejectedValue(error);

      await expect(signInWithGoogle()).rejects.toThrow('Google sign in failed');
    });
  });

  describe('signInAnonymous', () => {
    it('should sign in anonymously', async () => {
      mockSignInAnonymously.mockResolvedValue(mockAuthResult);

      const result = await signInAnonymous();

      expect(mockSignInAnonymously).toHaveBeenCalledWith(auth);
      expect(result).toBe(mockFirebaseUser);
    });

    it('should throw error when anonymous sign in fails', async () => {
      const error = new Error('Anonymous sign in failed');
      mockSignInAnonymously.mockRejectedValue(error);

      await expect(signInAnonymous()).rejects.toThrow('Anonymous sign in failed');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user from auth', () => {
      (auth as any).currentUser = mockFirebaseUser;

      const result = getCurrentUser();

      expect(result).toBe(mockFirebaseUser);
    });

    it('should return null when no current user', () => {
      (auth as any).currentUser = null;

      const result = getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('onAuthStateChange', () => {
    it('should set up auth state change listener', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();
      mockOnAuthStateChanged.mockReturnValue(mockUnsubscribe);

      const unsubscribe = onAuthStateChange(mockCallback);

      expect(mockOnAuthStateChanged).toHaveBeenCalledWith(auth, mockCallback);
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe('initializeUser', () => {
    it('should return existing user if found', async () => {
      mockFirestoreService.getUser.mockResolvedValue(mockUser);

      const result = await initializeUser(mockFirebaseUser);

      expect(mockFirestoreService.getUser).toHaveBeenCalledWith('test-user-id');
      expect(result).toBe(mockUser);
      expect(mockFirestoreService.createUser).not.toHaveBeenCalled();
    });

    it('should create new user if not found', async () => {
      mockFirestoreService.getUser.mockResolvedValue(null);
      mockFirestoreService.createUser.mockResolvedValue(undefined);

      const result = await initializeUser(mockFirebaseUser);

      expect(mockFirestoreService.getUser).toHaveBeenCalledWith('test-user-id');
      expect(mockFirestoreService.createUser).toHaveBeenCalledWith(
        'test-user-id',
        expect.objectContaining({
          language: 'ja',
          createdAt: expect.any(Date),
          lastActiveAt: expect.any(Date)
        })
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: 'test-user-id',
          language: 'ja',
          createdAt: expect.any(Date),
          lastActiveAt: expect.any(Date)
        })
      );
    });

    it('should handle error when getUser fails', async () => {
      const error = new Error('Firestore error');
      mockFirestoreService.getUser.mockRejectedValue(error);

      await expect(initializeUser(mockFirebaseUser)).rejects.toThrow('Firestore error');
    });

    it('should handle error when createUser fails', async () => {
      mockFirestoreService.getUser.mockResolvedValue(null);
      const error = new Error('Create user failed');
      mockFirestoreService.createUser.mockRejectedValue(error);

      await expect(initializeUser(mockFirebaseUser)).rejects.toThrow('Create user failed');
    });

    it('should set default language to Japanese', async () => {
      mockFirestoreService.getUser.mockResolvedValue(null);
      mockFirestoreService.createUser.mockResolvedValue(undefined);

      const result = await initializeUser(mockFirebaseUser);

      expect(result.language).toBe('ja');
    });

    it('should set created and last active timestamps', async () => {
      mockFirestoreService.getUser.mockResolvedValue(null);
      mockFirestoreService.createUser.mockResolvedValue(undefined);

      const beforeCall = new Date();
      const result = await initializeUser(mockFirebaseUser);
      const afterCall = new Date();

      expect(result.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
      expect(result.createdAt.getTime()).toBeLessThanOrEqual(afterCall.getTime());
      expect(result.lastActiveAt.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
      expect(result.lastActiveAt.getTime()).toBeLessThanOrEqual(afterCall.getTime());
    });
  });
});