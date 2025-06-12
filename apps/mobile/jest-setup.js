// Import polyfills for Jest environment
import 'react-native-gesture-handler/jestSetup';

// Import i18n test configuration
import './src/i18n/test';

// ============================================================================
// GLOBAL ENVIRONMENT SETUP
// ============================================================================

// Ensure proper global object structure for React Native Testing Library
global.window = global.window || {
  location: {
    hostname: 'test',
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000'
  },
  navigator: {
    userAgent: 'Jest'
  },
  // Ensure timer functions are accessible through window object
  setTimeout: setTimeout,
  setInterval: setInterval,
  clearTimeout: clearTimeout,
  clearInterval: clearInterval,
  setImmediate: (fn, ...args) => setTimeout(fn, 0, ...args),
  clearImmediate: (id) => clearTimeout(id)
};

// Create globalObj for React Native Testing Library compatibility
global.globalObj = global.globalObj || {
  setTimeout: setTimeout,
  setInterval: setInterval,
  clearTimeout: clearTimeout,
  clearInterval: clearInterval,
  setImmediate: (fn, ...args) => setTimeout(fn, 0, ...args),
  clearImmediate: (id) => clearTimeout(id)
};

// Ensure all timer functions are available globally
global.setTimeout = global.setTimeout || setTimeout;
global.setInterval = global.setInterval || setInterval;
global.clearTimeout = global.clearTimeout || clearTimeout;
global.clearInterval = global.clearInterval || clearInterval;
global.setImmediate = global.setImmediate || ((fn, ...args) => setTimeout(fn, 0, ...args));
global.clearImmediate = global.clearImmediate || ((id) => clearTimeout(id));

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn()
};

// ============================================================================
// REACT NATIVE MOCKS
// ============================================================================

// Mock React Native core modules
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn()
}));

jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  TouchableHighlight: 'TouchableHighlight',
  TouchableWithoutFeedback: 'TouchableWithoutFeedback',
  Pressable: 'Pressable',
  TextInput: 'TextInput',
  ScrollView: 'ScrollView',
  Image: 'Image',
  ActivityIndicator: 'ActivityIndicator',
  SafeAreaView: 'SafeAreaView',
  Alert: {
    alert: jest.fn()
  },
  Animated: {
    View: 'Animated.View',
    Text: 'Animated.Text',
    Value: jest.fn(() => ({
      interpolate: jest.fn(() => 'mocked-interpolated-value'),
      setValue: jest.fn(),
      setOffset: jest.fn(),
      flattenOffset: jest.fn(),
      extractOffset: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
      stopAnimation: jest.fn(),
      resetAnimation: jest.fn()
    })),
    timing: jest.fn(() => ({
      start: jest.fn(),
      stop: jest.fn(),
      reset: jest.fn()
    })),
    spring: jest.fn(() => ({
      start: jest.fn(),
      stop: jest.fn(),
      reset: jest.fn()
    })),
    sequence: jest.fn(() => ({
      start: jest.fn(),
      stop: jest.fn(),
      reset: jest.fn()
    })),
    parallel: jest.fn(() => ({
      start: jest.fn(),
      stop: jest.fn(),
      reset: jest.fn()
    })),
    delay: jest.fn(() => ({
      start: jest.fn(),
      stop: jest.fn(),
      reset: jest.fn()
    })),
    loop: jest.fn(() => ({
      start: jest.fn(),
      stop: jest.fn(),
      reset: jest.fn()
    }))
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  },
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios || obj.default)
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
    hairlineWidth: 1,
    absoluteFill: {},
    flatten: jest.fn()
  },
  NativeModules: {
    RNFBAnalyticsModule: {},
    RNFBAppModule: {},
    RNFBAuthModule: {},
    RNFBDatabaseModule: {},
    RNFBFirestoreModule: {},
    RNFBFunctionsModule: {},
    RNFBMessagingModule: {},
    RNFBStorageModule: {}
  }
}));

// ============================================================================
// EXPO MOCKS
// ============================================================================

jest.mock('expo-status-bar', () => ({
  StatusBar: ({ children, ...props }) => children
}));

jest.mock('expo-constants', () => ({
  default: {
    debugMode: false,
    manifest: {}
  }
}));

// ============================================================================
// FIREBASE MOCKS
// ============================================================================

// Mock Firebase v9+ SDK
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
    setBackgroundMessageHandler: jest.fn(),
    hasPermission: jest.fn(() => Promise.resolve(true))
  })
}));

// ============================================================================
// PROJECT SPECIFIC MOCKS
// ============================================================================

// Mock Firebase config files
jest.mock('./src/config/firebase', () => ({
  auth: {
    currentUser: null
  },
  db: {},
  messaging: {}
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve())
}));

// Mock react-native-localize
jest.mock('react-native-localize', () => ({
  getLocales: jest.fn(() => [{ languageCode: 'en', countryCode: 'US' }]),
  getTimeZone: jest.fn(() => 'America/New_York'),
  findBestAvailableLanguage: jest.fn(() => ({ languageTag: 'en' }))
}));

// ============================================================================
// TEST CLEANUP
// ============================================================================

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Import jest-native extensions AFTER all setup
import '@testing-library/jest-native/extend-expect';