// Import polyfills for Jest environment

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

// Ensure Alert is properly mocked - jest-expo may not include it
// This extends jest-expo's existing React Native mock
Object.defineProperty(ReactNative, "Alert", {
  value: {alert: jest.fn()},
  writable: true,
  enumerable: true,
  configurable: true,
});

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
// ENVIRONMENT CONFIGURATION
// ============================================================================

// Consistent environment configuration for all test environments
// This ensures tests behave the same way in CI and local development
jest.mock("./src/config/env", () => ({
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

// Mock React Native StatusBar
jest.mock("react-native/Libraries/Components/StatusBar/StatusBar", () => ({
  __esModule: true,
  default: jest.fn(() => null),
  setBarStyle: jest.fn(),
  setBackgroundColor: jest.fn(),
  setHidden: jest.fn(),
  setNetworkActivityIndicatorVisible: jest.fn(),
  setTranslucent: jest.fn(),
}));

// ============================================================================
// FIREBASE MOCKS
// ============================================================================

// All Firebase modules are mocked by files in __mocks__/@react-native-firebase/
// This provides better organization and easier maintenance

// ============================================================================
// PROJECT SPECIFIC MOCKS
// ============================================================================

// Firebase config uses real Firebase emulator for integration testing
// Individual tests can mock specific services if needed

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Username utilities use real Firebase emulator for integration testing
// Individual tests can mock specific username functions if needed

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
