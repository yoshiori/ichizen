// Import polyfills for Jest environment
import "react-native-gesture-handler/jestSetup";

// Import i18n test configuration
import "./src/i18n/test";

// ============================================================================
// GLOBAL ENVIRONMENT SETUP
// ============================================================================

// Ensure proper global object structure for React Native Testing Library
global.window = global.window || {
  location: {
    hostname: "test",
    href: "http://localhost:3000",
    origin: "http://localhost:3000",
  },
  navigator: {
    userAgent: "Jest",
  },
  // Ensure timer functions are accessible through window object
  setTimeout: setTimeout,
  setInterval: setInterval,
  clearTimeout: clearTimeout,
  clearInterval: clearInterval,
  setImmediate: (fn, ...args) => setTimeout(fn, 0, ...args),
  clearImmediate: (id) => clearTimeout(id),
};

// Create globalObj for React Native Testing Library compatibility
global.globalObj = global.globalObj || {
  setTimeout: setTimeout,
  setInterval: setInterval,
  clearTimeout: clearTimeout,
  clearInterval: clearInterval,
  setImmediate: (fn, ...args) => setTimeout(fn, 0, ...args),
  clearImmediate: (id) => clearTimeout(id),
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
  log: jest.fn(),
};

// ============================================================================
// REACT NATIVE MOCKS
// ============================================================================

// Mock React Native core modules - Alert module specifically
jest.mock("react-native/Libraries/Alert/Alert", () => ({
  alert: jest.fn(),
}));

// Enhance React Native's Animated module after jest-expo has set up its mocks
// This runs in setupFilesAfterEnv, so it executes after jest-expo setup
const ReactNative = require("react-native");

// Create comprehensive Animated.Value mock with all required methods
const mockAnimatedValue = jest.fn(() => ({
  interpolate: jest.fn((config) => {
    // Provide a more realistic interpolate mock that simulates actual behavior
    if (config && config.outputRange && config.outputRange.length > 0) {
      // Return the first value from outputRange for consistent test behavior
      return config.outputRange[0];
    }
    return "0deg"; // Default rotation value for consistent test results
  }),
  setValue: jest.fn(),
  setOffset: jest.fn(),
  flattenOffset: jest.fn(),
  extractOffset: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  removeAllListeners: jest.fn(),
  stopAnimation: jest.fn(),
  resetAnimation: jest.fn(),
}));

// Ensure Alert is properly mocked
if (!ReactNative.Alert || !ReactNative.Alert.alert) {
  ReactNative.Alert = {
    alert: jest.fn(),
  };
}

// Enhance the existing Animated object from React Native
if (ReactNative.Animated) {
  ReactNative.Animated.Value = mockAnimatedValue;
  ReactNative.Animated.timing = jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    reset: jest.fn(),
  }));
  ReactNative.Animated.spring = jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    reset: jest.fn(),
  }));
  ReactNative.Animated.sequence = jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    reset: jest.fn(),
  }));
  ReactNative.Animated.parallel = jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    reset: jest.fn(),
  }));
  ReactNative.Animated.delay = jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    reset: jest.fn(),
  }));
  ReactNative.Animated.loop = jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    reset: jest.fn(),
  }));
} else {
  // If no Animated exists, create it entirely
  ReactNative.Animated = {
    View: "Animated.View",
    Text: "Animated.Text",
    Value: mockAnimatedValue,
    timing: jest.fn(() => ({
      start: jest.fn(),
      stop: jest.fn(),
      reset: jest.fn(),
    })),
    spring: jest.fn(() => ({
      start: jest.fn(),
      stop: jest.fn(),
      reset: jest.fn(),
    })),
    sequence: jest.fn(() => ({
      start: jest.fn(),
      stop: jest.fn(),
      reset: jest.fn(),
    })),
    parallel: jest.fn(() => ({
      start: jest.fn(),
      stop: jest.fn(),
      reset: jest.fn(),
    })),
    delay: jest.fn(() => ({
      start: jest.fn(),
      stop: jest.fn(),
      reset: jest.fn(),
    })),
    loop: jest.fn(() => ({
      start: jest.fn(),
      stop: jest.fn(),
      reset: jest.fn(),
    })),
  };
}

// ============================================================================
// ENVIRONMENT CONFIGURATION MOCKS
// ============================================================================

// Mock environment configuration for testing to avoid env validation issues
jest.mock("src/config/env", () => ({
  env: {
    FIREBASE_API_KEY: "test-api-key", // pragma: allowlist secret
    FIREBASE_AUTH_DOMAIN: "test.firebaseapp.com",
    FIREBASE_PROJECT_ID: "test-project",
    FIREBASE_STORAGE_BUCKET: "test-project.appspot.com",
    FIREBASE_MESSAGING_SENDER_ID: "123456789012",
    FIREBASE_APP_ID: "1:123456789012:web:test123456",
    ENVIRONMENT: "development",
    FIREBASE_ENV: "emulator",
  },
}));

// ============================================================================
// SVG MOCKS
// ============================================================================

// Mock react-native-svg - selective mocking to preserve library functionality
jest.mock("react-native-svg", () => {
  const React = require("react");

  // Try to get the actual module first, fall back to mocks if unavailable
  let actualModule;
  try {
    actualModule = jest.requireActual("react-native-svg");
  } catch {
    // Fallback to basic mocks if actual module is not available
    actualModule = {};
  }

  // Create minimal mocks only for components we use
  const MockedSvg = (props) => React.createElement("Svg", props, props.children);
  const MockedPath = (props) => React.createElement("Path", props);
  const MockedCircle = (props) => React.createElement("Circle", props);
  const MockedG = (props) => React.createElement("G", props, props.children);
  const MockedLinearGradient = (props) => React.createElement("LinearGradient", props, props.children);
  const MockedStop = (props) => React.createElement("Stop", props);
  const MockedDefs = (props) => React.createElement("Defs", props, props.children);

  return {
    __esModule: true,
    // Spread actual module first to preserve real functionality
    ...actualModule,
    // Override only the specific components we need for testing
    default: actualModule.default || MockedSvg,
    Svg: actualModule.Svg || MockedSvg,
    Path: actualModule.Path || MockedPath,
    Circle: actualModule.Circle || MockedCircle,
    G: actualModule.G || MockedG,
    LinearGradient: actualModule.LinearGradient || MockedLinearGradient,
    Stop: actualModule.Stop || MockedStop,
    Defs: actualModule.Defs || MockedDefs,
  };
});

// ============================================================================
// EXPO MOCKS
// ============================================================================

jest.mock("expo-status-bar", () => ({
  StatusBar: ({children, ...props}) => children,
}));

jest.mock("expo-constants", () => ({
  default: {
    debugMode: false,
    manifest: {},
  },
}));

// ============================================================================
// FIREBASE MOCKS
// ============================================================================

// Mock React Native Firebase SDK
jest.mock("@react-native-firebase/app", () => ({
  firebase: {
    app: jest.fn(() => ({})),
  },
}));

jest.mock("@react-native-firebase/auth", () => {
  const mockAuth = jest.fn(() => ({
    currentUser: null,
    signInAnonymously: jest.fn(() => Promise.resolve({user: {uid: "test-uid"}})),
    onAuthStateChanged: jest.fn((callback) => {
      callback(null);
      return jest.fn();
    }),
  }));

  return {
    __esModule: true,
    default: mockAuth,
  };
});

jest.mock("@react-native-firebase/firestore", () => {
  const mockFirestore = jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(() =>
          Promise.resolve({
            exists: true,
            id: "test-id",
            data: jest.fn(() => ({name: "test"})),
          })
        ),
        set: jest.fn(() => Promise.resolve()),
        update: jest.fn(() => Promise.resolve()),
        delete: jest.fn(() => Promise.resolve()),
        onSnapshot: jest.fn((callback) => {
          callback({
            exists: () => true,
            data: () => ({name: "test"}),
          });
          return jest.fn();
        }),
      })),
      where: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({size: 0, docs: []})),
        orderBy: jest.fn(() => ({
          get: jest.fn(() => Promise.resolve({size: 0, docs: []})),
          limit: jest.fn(() => ({
            get: jest.fn(() => Promise.resolve({size: 0, docs: []})),
          })),
        })),
        where: jest.fn(() => ({
          get: jest.fn(() => Promise.resolve({size: 0, docs: []})),
          limit: jest.fn(() => ({
            get: jest.fn(() => Promise.resolve({size: 0, docs: []})),
          })),
        })),
        limit: jest.fn(() => ({
          get: jest.fn(() => Promise.resolve({size: 0, docs: []})),
        })),
      })),
      get: jest.fn(() => Promise.resolve({size: 0, docs: []})),
      add: jest.fn(() => Promise.resolve({id: "mock-id"})),
    })),
  }));

  return {
    __esModule: true,
    default: mockFirestore,
    FieldValue: {
      increment: jest.fn(),
      serverTimestamp: jest.fn(),
    },
  };
});

// Web Firebase messaging mock removed - using React Native Firebase instead

// Mock React Native Firebase
jest.mock("@react-native-firebase/messaging", () => ({
  __esModule: true,
  default: () => ({
    requestPermission: jest.fn(() => Promise.resolve(true)),
    getToken: jest.fn(() => Promise.resolve("mock-token")),
    onTokenRefresh: jest.fn(),
    onMessage: jest.fn(),
    onNotificationOpenedApp: jest.fn(),
    getInitialNotification: jest.fn(() => Promise.resolve(null)),
    setBackgroundMessageHandler: jest.fn(),
    hasPermission: jest.fn(() => Promise.resolve(true)),
  }),
}));

jest.mock("@react-native-firebase/functions", () => {
  const mockFunctions = jest.fn(() => ({
    region: jest.fn(() => ({
      httpsCallable: jest.fn(() => jest.fn(() => Promise.resolve({data: {}}))),
    })),
    httpsCallable: jest.fn(() => jest.fn(() => Promise.resolve({data: {}}))),
  }));

  // Mock modular API for v22
  const mockGetFunctions = jest.fn(() => ({}));
  const mockHttpsCallable = jest.fn(() => jest.fn(() => Promise.resolve({data: {}})));

  return {
    __esModule: true,
    default: mockFunctions,
    getFunctions: mockGetFunctions,
    httpsCallable: mockHttpsCallable,
  };
});

// ============================================================================
// PROJECT SPECIFIC MOCKS
// ============================================================================

// Mock Firebase config files for React Native Firebase v22
jest.mock("./src/config/firebase", () => ({
  auth: {
    currentUser: null,
    signInAnonymously: jest.fn(() => Promise.resolve({user: {uid: "test-uid"}})),
    onAuthStateChanged: jest.fn((callback) => {
      callback(null);
      return jest.fn();
    }),
  },
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(() =>
          Promise.resolve({
            exists: true,
            id: "test-id",
            data: jest.fn(() => ({name: "test"})),
          })
        ),
        set: jest.fn(() => Promise.resolve()),
        update: jest.fn(() => Promise.resolve()),
      })),
    })),
  },
  cloudFunctions: {
    region: jest.fn(() => ({
      httpsCallable: jest.fn(() => jest.fn(() => Promise.resolve({data: {}}))),
    })),
  },
}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock username utilities
jest.mock("./src/utils/username", () => ({
  generateRandomUsername: jest.fn(() => Promise.resolve("test_user123")),
  isUsernameAvailable: jest.fn(() => Promise.resolve(true)),
  reserveUsername: jest.fn(() => Promise.resolve()),
  changeUsername: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-localize
jest.mock("react-native-localize", () => ({
  getLocales: jest.fn(() => [{languageCode: "en", countryCode: "US"}]),
  getTimeZone: jest.fn(() => "America/New_York"),
  findBestAvailableLanguage: jest.fn(() => ({languageTag: "en"})),
}));

// ============================================================================
// TEST CLEANUP
// ============================================================================

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Import jest-native extensions AFTER all setup
import "@testing-library/jest-native/extend-expect";
