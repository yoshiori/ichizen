import React from "react";
import {render, fireEvent, waitFor} from "@testing-library/react-native";
import {Alert} from "react-native";
import SignInScreen from "../src/screens/SignInScreen";
import {useAuth} from "../src/contexts/AuthContext";

// Mock the AuthContext
jest.mock("../src/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// Mock i18n
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => {
      const translations: Record<string, string> = {
        "signIn.title": "Welcome",
        "signIn.subtitle": "Join our community",
        "signIn.google": "Continue with Google",
        "signIn.apple": "Continue with Apple",
        "signIn.guest": "Continue as Guest",
        "signIn.loading": "Signing in...",
        "signIn.loading.google": "Signing in with Google...",
        "signIn.loading.apple": "Signing in with Apple...",
        "signIn.loading.guest": "Signing in as guest...",
        "signIn.privacy": "Privacy policy",
        "signIn.error.title": "Sign-In Error",
        "signIn.error.general": "Sign-in failed",
      };
      return translations[key] || fallback || key;
    },
  }),
}));

// Mock Alert
jest.spyOn(Alert, "alert");

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe("SignInScreen Loading UI", () => {
  const mockSignIn = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      signIn: mockSignIn,
      user: null,
      firebaseUser: null,
      loading: false,
      initError: null,
      isSigningIn: false,
      signingInMethod: null,
      signOut: jest.fn(),
      refreshUser: jest.fn(),
      markTransitionComplete: jest.fn(),
    });
  });

  describe("Button States During Loading", () => {
    it("should disable all buttons when google login is loading", async () => {
      const {getByText, rerender} = render(<SignInScreen />);

      // Mock signIn to simulate loading state
      mockSignIn.mockImplementation(() => {
        // Simulate isSigningIn state change
        mockUseAuth.mockReturnValue({
          signIn: mockSignIn,
          user: null,
          firebaseUser: null,
          loading: false,
          initError: null,
          isSigningIn: true,
          signingInMethod: "google",
          signOut: jest.fn(),
          refreshUser: jest.fn(),
          markTransitionComplete: jest.fn(),
        });
        return new Promise(() => {}); // Never resolves
      });

      const googleButton = getByText("Continue with Google");

      // Press Google button
      fireEvent.press(googleButton);

      // Re-render to reflect state change
      rerender(<SignInScreen />);

      await waitFor(() => {
        // Check that buttons have disabled accessibility state by examining TouchableOpacity
        const googleButton = getByText("Continue with Google");
        const appleButton = getByText("Continue with Apple");
        const guestButton = getByText("Continue as Guest");

        // TouchableOpacity is the grandparent of the text (Text -> View -> TouchableOpacity)
        expect(googleButton.parent?.parent).toHaveProperty("props.accessibilityState.disabled", true);
        expect(appleButton.parent?.parent).toHaveProperty("props.accessibilityState.disabled", true);
        expect(guestButton.parent?.parent).toHaveProperty("props.accessibilityState.disabled", true);
      });

      // Try pressing other buttons - they should not trigger signIn again
      const signInCallCount = mockSignIn.mock.calls.length;
      fireEvent.press(getByText("Continue with Apple"));
      fireEvent.press(getByText("Continue as Guest"));

      // signIn should still only have been called once (for Google)
      expect(mockSignIn).toHaveBeenCalledTimes(signInCallCount);
    });

    it("should disable all buttons when apple login is loading", async () => {
      const {getByText, rerender} = render(<SignInScreen />);

      mockSignIn.mockImplementation(() => {
        mockUseAuth.mockReturnValue({
          signIn: mockSignIn,
          user: null,
          firebaseUser: null,
          loading: false,
          initError: null,
          isSigningIn: true,
          signingInMethod: "apple",
          signOut: jest.fn(),
          refreshUser: jest.fn(),
          markTransitionComplete: jest.fn(),
        });
        return new Promise(() => {});
      });

      const appleButton = getByText("Continue with Apple");

      fireEvent.press(appleButton);

      // Re-render to reflect state change
      rerender(<SignInScreen />);

      await waitFor(() => {
        const googleButton = getByText("Continue with Google");
        const appleButton = getByText("Continue with Apple");
        const guestButton = getByText("Continue as Guest");

        expect(googleButton.parent?.parent).toHaveProperty("props.accessibilityState.disabled", true);
        expect(appleButton.parent?.parent).toHaveProperty("props.accessibilityState.disabled", true);
        expect(guestButton.parent?.parent).toHaveProperty("props.accessibilityState.disabled", true);
      });

      const signInCallCount = mockSignIn.mock.calls.length;
      fireEvent.press(getByText("Continue with Google"));
      fireEvent.press(getByText("Continue as Guest"));

      expect(mockSignIn).toHaveBeenCalledTimes(signInCallCount);
    });

    it("should disable all buttons when guest login is loading", async () => {
      const {getByText, rerender} = render(<SignInScreen />);

      mockSignIn.mockImplementation(() => {
        mockUseAuth.mockReturnValue({
          signIn: mockSignIn,
          user: null,
          firebaseUser: null,
          loading: false,
          initError: null,
          isSigningIn: true,
          signingInMethod: "anonymous",
          signOut: jest.fn(),
          refreshUser: jest.fn(),
          markTransitionComplete: jest.fn(),
        });
        return new Promise(() => {});
      });

      const guestButton = getByText("Continue as Guest");

      fireEvent.press(guestButton);

      // Re-render to reflect state change
      rerender(<SignInScreen />);

      await waitFor(() => {
        const googleButton = getByText("Continue with Google");
        const appleButton = getByText("Continue with Apple");
        const guestButton = getByText("Continue as Guest");

        expect(googleButton.parent?.parent).toHaveProperty("props.accessibilityState.disabled", true);
        expect(appleButton.parent?.parent).toHaveProperty("props.accessibilityState.disabled", true);
        expect(guestButton.parent?.parent).toHaveProperty("props.accessibilityState.disabled", true);
      });

      const signInCallCount = mockSignIn.mock.calls.length;
      fireEvent.press(getByText("Continue with Google"));
      fireEvent.press(getByText("Continue with Apple"));

      expect(mockSignIn).toHaveBeenCalledTimes(signInCallCount);
    });
  });

  describe("Sign In Method Tracking", () => {
    it("should call signIn with correct method for google login", async () => {
      const {getByText} = render(<SignInScreen />);

      mockSignIn.mockResolvedValue(undefined);

      const googleButton = getByText("Continue with Google");
      fireEvent.press(googleButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith("google");
      });
    });

    it("should call signIn with correct method for apple login", async () => {
      const {getByText} = render(<SignInScreen />);

      mockSignIn.mockResolvedValue(undefined);

      const appleButton = getByText("Continue with Apple");
      fireEvent.press(appleButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith("apple");
      });
    });

    it("should call signIn with correct method for guest login", async () => {
      const {getByText} = render(<SignInScreen />);

      mockSignIn.mockResolvedValue(undefined);

      const guestButton = getByText("Continue as Guest");
      fireEvent.press(guestButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith("anonymous");
      });
    });

    it("should show error alert when login fails", async () => {
      const {getByText} = render(<SignInScreen />);

      mockSignIn.mockRejectedValue(new Error("Login failed"));

      const guestButton = getByText("Continue as Guest");
      fireEvent.press(guestButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith("Sign-In Error", "Login failed");
      });
    });
  });

  describe("Button Text Consistency", () => {
    it("should maintain original button text when not signing in", () => {
      const {getByText} = render(<SignInScreen />);

      // All buttons should show their original text
      expect(getByText("Continue with Google")).toBeTruthy();
      expect(getByText("Continue with Apple")).toBeTruthy();
      expect(getByText("Continue as Guest")).toBeTruthy();
    });

    it("should maintain button text even when disabled during sign in", async () => {
      const {getByText, rerender} = render(<SignInScreen />);

      // Mock isSigningIn state
      mockUseAuth.mockReturnValue({
        signIn: mockSignIn,
        user: null,
        firebaseUser: null,
        loading: false,
        initError: null,
        isSigningIn: true,
        signingInMethod: "google",
        signOut: jest.fn(),
        refreshUser: jest.fn(),
        markTransitionComplete: jest.fn(),
      });

      rerender(<SignInScreen />);

      // Button text should remain the same even when disabled
      expect(getByText("Continue with Google")).toBeTruthy();
      expect(getByText("Continue with Apple")).toBeTruthy();
      expect(getByText("Continue as Guest")).toBeTruthy();
    });
  });

  describe("Prevent Button Flicker During Screen Transition", () => {
    it("should maintain disabled state until screen transition is complete", async () => {
      const {getByText, rerender} = render(<SignInScreen />);

      let resolveSignIn: (() => void) | undefined;

      mockSignIn.mockImplementation(() => {
        // Simulate AuthContext setting isSigningIn to true during sign in
        mockUseAuth.mockReturnValue({
          signIn: mockSignIn,
          user: null,
          firebaseUser: null,
          loading: false,
          initError: null,
          isSigningIn: true, // Now signing in
          signingInMethod: "anonymous",
          signOut: jest.fn(),
          refreshUser: jest.fn(),
          markTransitionComplete: jest.fn(),
        });

        return new Promise<void>((resolve) => {
          resolveSignIn = resolve;
        });
      });

      const guestButton = getByText("Continue as Guest");
      fireEvent.press(guestButton);

      // Re-render to reflect the isSigningIn state change
      rerender(<SignInScreen />);

      // Verify buttons are disabled
      await waitFor(() => {
        const googleButton = getByText("Continue with Google");
        const appleButton = getByText("Continue with Apple");
        const guestButton = getByText("Continue as Guest");

        expect(googleButton.parent?.parent).toHaveProperty("props.accessibilityState.disabled", true);
        expect(appleButton.parent?.parent).toHaveProperty("props.accessibilityState.disabled", true);
        expect(guestButton.parent?.parent).toHaveProperty("props.accessibilityState.disabled", true);
      });

      // Resolve the sign-in promise to simulate successful login
      if (resolveSignIn) {
        resolveSignIn();
      }

      // Wait for the promise to resolve
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Buttons should remain disabled because isSigningIn is still true
      const googleButton2 = getByText("Continue with Google");
      const appleButton2 = getByText("Continue with Apple");
      const guestButton2 = getByText("Continue as Guest");

      expect(googleButton2.parent?.parent).toHaveProperty("props.accessibilityState.disabled", true);
      expect(appleButton2.parent?.parent).toHaveProperty("props.accessibilityState.disabled", true);
      expect(guestButton2.parent?.parent).toHaveProperty("props.accessibilityState.disabled", true);

      // Simulate screen transition completion
      mockUseAuth.mockReturnValue({
        signIn: mockSignIn,
        user: {
          id: "user123",
          username: "testuser",
          language: "ja" as const,
          createdAt: new Date(),
          lastActiveAt: new Date(),
        },
        firebaseUser: null,
        loading: false,
        initError: null,
        isSigningIn: false, // Transition completed
        signingInMethod: null,
        signOut: jest.fn(),
        refreshUser: jest.fn(),
        markTransitionComplete: jest.fn(),
      });

      // Re-render with transition completed
      rerender(<SignInScreen />);

      // Now buttons should be enabled again
      await waitFor(() => {
        const googleButtonFinal = getByText("Continue with Google");
        const appleButtonFinal = getByText("Continue with Apple");
        const guestButtonFinal = getByText("Continue as Guest");

        expect(googleButtonFinal.parent?.parent).toHaveProperty("props.accessibilityState.disabled", false);
        expect(appleButtonFinal.parent?.parent).toHaveProperty("props.accessibilityState.disabled", false);
        expect(guestButtonFinal.parent?.parent).toHaveProperty("props.accessibilityState.disabled", false);
      });
    });

    it("should prevent multiple sign-in calls during transition", async () => {
      const {getByText, rerender} = render(<SignInScreen />);

      let resolveSignIn: (() => void) | undefined;

      mockSignIn.mockImplementation(() => {
        // Simulate AuthContext setting isSigningIn to true during sign in
        mockUseAuth.mockReturnValue({
          signIn: mockSignIn,
          user: null,
          firebaseUser: null,
          loading: false,
          initError: null,
          isSigningIn: true, // Now signing in
          signingInMethod: "anonymous",
          signOut: jest.fn(),
          refreshUser: jest.fn(),
          markTransitionComplete: jest.fn(),
        });

        return new Promise<void>((resolve) => {
          resolveSignIn = resolve;
        });
      });

      const guestButton = getByText("Continue as Guest");
      const appleButton = getByText("Continue with Apple");
      const googleButton = getByText("Continue with Google");

      fireEvent.press(guestButton);

      // Re-render to reflect the isSigningIn state change
      rerender(<SignInScreen />);

      await waitFor(() => {
        const googleButton = getByText("Continue with Google");
        const appleButton = getByText("Continue with Apple");
        const guestButton = getByText("Continue as Guest");

        expect(googleButton.parent?.parent).toHaveProperty("props.accessibilityState.disabled", true);
        expect(appleButton.parent?.parent).toHaveProperty("props.accessibilityState.disabled", true);
        expect(guestButton.parent?.parent).toHaveProperty("props.accessibilityState.disabled", true);
      });

      // Resolve sign-in
      if (resolveSignIn) {
        resolveSignIn();
      }

      // Wait for promise resolution
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Buttons should remain disabled during transition - try pressing them
      const signInCallCount = mockSignIn.mock.calls.length;
      fireEvent.press(appleButton);
      fireEvent.press(googleButton);

      // No additional signIn calls should be made
      expect(mockSignIn).toHaveBeenCalledTimes(signInCallCount);

      // Simulate screen transition completion
      mockUseAuth.mockReturnValue({
        signIn: mockSignIn,
        user: {
          id: "user123",
          username: "testuser",
          language: "ja" as const,
          createdAt: new Date(),
          lastActiveAt: new Date(),
        },
        firebaseUser: null,
        loading: false,
        initError: null,
        isSigningIn: false, // Transition completed
        signingInMethod: null,
        signOut: jest.fn(),
        refreshUser: jest.fn(),
        markTransitionComplete: jest.fn(),
      });

      // Re-render with transition completed
      rerender(<SignInScreen />);

      // Now buttons should be enabled again
      await waitFor(() => {
        const googleButtonFinal = getByText("Continue with Google");
        const appleButtonFinal = getByText("Continue with Apple");
        const guestButtonFinal = getByText("Continue as Guest");

        expect(googleButtonFinal.parent?.parent).toHaveProperty("props.accessibilityState.disabled", false);
        expect(appleButtonFinal.parent?.parent).toHaveProperty("props.accessibilityState.disabled", false);
        expect(guestButtonFinal.parent?.parent).toHaveProperty("props.accessibilityState.disabled", false);
      });
    });
  });
});
