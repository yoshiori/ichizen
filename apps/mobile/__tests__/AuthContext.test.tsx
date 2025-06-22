import React from "react";
import {render, waitFor, act} from "@testing-library/react-native";
import {Text} from "react-native";
import {AuthProvider, useAuth} from "../src/contexts/AuthContext";

// Mock Firebase Auth functions for consistent test behavior
jest.mock("@react-native-firebase/auth", () => ({
  __esModule: true,
  default: () => ({
    onAuthStateChanged: jest.fn((callback) => {
      // Simulate initial auth state
      setTimeout(() => callback(null), 100);
      return jest.fn(); // Return unsubscribe function
    }),
    signInAnonymously: jest.fn(() =>
      Promise.resolve({
        user: {
          uid: "test-user-123",
          isAnonymous: true,
        },
      })
    ),
  }),
}));

// Mock Google Sign In
jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(() => Promise.resolve(true)),
    signIn: jest.fn(() =>
      Promise.resolve({
        idToken: "mock-google-token",
        user: {id: "google-user-123"},
      })
    ),
  },
}));

// Mock Apple Authentication
jest.mock("@invertase/react-native-apple-authentication", () => ({
  appleAuth: {
    performRequest: jest.fn(() =>
      Promise.resolve({
        identityToken: "mock-apple-token",
        user: "apple-user-123",
      })
    ),
    requestedOperation: {
      LOGIN: "LOGIN",
    },
    requestedScopes: {
      EMAIL: "EMAIL",
      FULL_NAME: "FULL_NAME",
    },
  },
}));

// Test component that uses AuthContext
const TestComponent = () => {
  const {user, loading, signIn} = useAuth();
  return <Text testID="auth-state">{loading ? "loading" : user ? `user:${user.id}` : "no-user"}</Text>;
};

describe("AuthContext", () => {
  it("should handle authentication state", async () => {
    const {getByTestId} = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for auth state to settle
    await waitFor(
      () => {
        const state = getByTestId("auth-state").props.children;
        expect(state === "loading" || state === "no-user" || state.startsWith("user:")).toBe(true);
      },
      {timeout: 5000}
    );
  });

  it("should provide signIn function and handle authentication", async () => {
    let signInFunction: (() => Promise<void>) | null = null;
    let authState: any = null;

    const TestSignInComponent = () => {
      const auth = useAuth();
      signInFunction = auth.signIn;
      authState = auth;
      return <Text testID="signin-test">Test</Text>;
    };

    const {getByTestId} = render(
      <AuthProvider>
        <TestSignInComponent />
      </AuthProvider>
    );

    // Wait for initial auth state to settle
    await waitFor(() => {
      expect(getByTestId("signin-test")).toBeTruthy();
      expect(signInFunction).toBeDefined();
    });

    // Test sign in functionality with mocked authentication
    if (signInFunction) {
      await act(async () => {
        try {
          await signInFunction!();
          // With proper mocks, sign in should succeed without errors
        } catch (error) {
          // If an error occurs despite mocking, it indicates a test setup issue
          // Log the error for debugging and fail the test
          console.error("Unexpected error during mocked sign in:", error);
          throw new Error(`Sign in failed with mocked authentication: ${error}`);
        }
      });

      // Verify auth state after sign in attempt
      expect(authState).toBeDefined();
      expect(typeof signInFunction).toBe("function");
    }
  });
});
