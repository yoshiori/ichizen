// Basic Jest setup for React Native testing
import './src/i18n/test';

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  getApp: jest.fn()
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: null
  })),
  signInAnonymously: jest.fn(),
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  onAuthStateChanged: jest.fn(),
  connectAuthEmulator: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  updateDoc: jest.fn(),
  increment: jest.fn(),
  deleteDoc: jest.fn(),
  connectFirestoreEmulator: jest.fn()
}));

jest.mock('firebase/messaging', () => ({
  getMessaging: jest.fn(),
  getToken: jest.fn(),
  onMessage: jest.fn(),
  getIsSupported: jest.fn(() => Promise.resolve(true))
}));

// Mock React Native specific modules
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn()
}));

// Mock global objects
Object.defineProperty(global, 'window', {
  value: {
    location: {
      hostname: 'test'
    }
  },
  writable: true
});

// Ensure setTimeout is available globally
global.setTimeout = setTimeout;
global.setInterval = setInterval;
global.clearTimeout = clearTimeout;
global.clearInterval = clearInterval;

// Mock Firebase config files
jest.mock('./src/config/firebase', () => ({
  auth: {
    currentUser: null
  },
  db: {},
  messaging: {}
}));

// Mock React Native Firebase
jest.mock('@react-native-firebase/messaging', () => ({
  __esModule: true,
  default: () => ({
    requestPermission: jest.fn(() => Promise.resolve(true)),
    getToken: jest.fn(() => Promise.resolve('mock-token')),
    onTokenRefresh: jest.fn(),
    onMessage: jest.fn(),
    onNotificationOpenedApp: jest.fn(),
    getInitialNotification: jest.fn(() => Promise.resolve(null)),
    setBackgroundMessageHandler: jest.fn()
  })
}));

// Mock Expo modules
jest.mock('expo-status-bar', () => ({
  StatusBar: ({ children, ...props }) => children
}));