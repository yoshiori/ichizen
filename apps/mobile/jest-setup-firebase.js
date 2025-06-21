/**
 * Firebase Emulator Setup for Jest
 *
 * This file configures Jest to use Firebase Emulator for all tests.
 * Simple setup that focuses on environment configuration.
 */

// Set environment variables for Firebase Emulator
process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9098";
process.env.FIREBASE_FUNCTIONS_EMULATOR_HOST = "localhost:5001";

// Force test environment
process.env.NODE_ENV = "test";

// Extend Jest timeout for Firebase operations
// eslint-disable-next-line no-undef
jest.setTimeout(15000);

console.log("🧪 Firebase Emulator environment configured for tests");
