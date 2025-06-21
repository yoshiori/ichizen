export default {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest-setup.js"],
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|firebase|@firebase/.*|@react-native-firebase/.*)",
  ],
  testMatch: ["**/__tests__/**/*.(ts|tsx|js)", "**/*.(test|spec).(ts|tsx|js)", "**/*.emulator.(test|spec).(ts|tsx|js)"],
  testPathIgnorePatterns: ["<rootDir>/e2e/", "<rootDir>/node_modules/"],
  fakeTimers: {
    enableGlobally: false,
    legacyFakeTimers: false,
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/__tests__/**",
    "!**/coverage/**",
    "!src/types/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  // Unified settings for all environments to ensure consistency
  clearMocks: true,
  // Note: resetMocks removed to maintain mock implementations consistency
  restoreMocks: true,
  // CI-specific memory optimizations only
  ...(process.env.CI
    ? {
        maxWorkers: 1,
        forceExit: true,
        detectOpenHandles: true,
        workerIdleMemoryLimit: "256MB",
        cache: false,
      }
    : {}),
  // Coverage thresholds (disabled in CI for now)
  ...(process.env.CI
    ? {}
    : {
        coverageThreshold: {
          global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
          },
        },
      }),
};
