import {Platform} from "react-native";
import {GoogleSignin} from "@react-native-google-signin/google-signin";
import {appleAuth} from "@invertase/react-native-apple-authentication";
import {auth} from "../config/firebase";
import {FirebaseAuthTypes} from "@react-native-firebase/auth";

// Google Sign-In configuration (stub for now)
GoogleSignin.configure({
  webClientId: "179557978249-YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
  iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",
});

/**
 * Google Sign-In for React Native (Stub)
 */
export const signInWithGoogle = async (): Promise<FirebaseAuthTypes.User> => {
  throw new Error("Google Sign-In not implemented yet for React Native");
};

/**
 * Apple Sign-In for React Native (Stub)
 */
export const signInWithApple = async (): Promise<FirebaseAuthTypes.User> => {
  throw new Error("Apple Sign-In not implemented yet for React Native");
};

/**
 * Anonymous Sign-In
 */
export const signInAnonymous = async (): Promise<FirebaseAuthTypes.User> => {
  const result = await auth.signInAnonymously();
  return result.user;
};

/**
 * Check if Apple Sign-In is available
 */
export const isAppleSignInAvailable = (): boolean => {
  return Platform.OS === "ios" && appleAuth.isSupported;
};
