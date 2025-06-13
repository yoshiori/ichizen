import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { signInWithCredential, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebase';

// Google Sign-In configuration
GoogleSignin.configure({
  webClientId: '179557978249-YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // Replace with your actual web client ID
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com', // Replace with your iOS client ID
});

export const signInWithGoogleNative = async () => {
  try {
    // Check if device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    // Get user's ID token
    const signInResult = await GoogleSignin.signIn();
    const idToken = (signInResult as any).idToken;
    
    // Create Firebase credential with the token
    const googleCredential = GoogleAuthProvider.credential(idToken);
    
    // Sign in to Firebase with credential
    const result = await signInWithCredential(auth, googleCredential);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

export const signInWithAppleNative = async () => {
  if (Platform.OS !== 'ios') {
    throw new Error('Apple Sign-In is only available on iOS');
  }

  try {
    // Start the Apple Sign-In request
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });

    // Ensure Apple returned user identityToken
    if (!appleAuthRequestResponse.identityToken) {
      throw new Error('Apple Sign-In failed - no identify token returned');
    }

    // Create Firebase credential with Apple token
    const { identityToken, nonce } = appleAuthRequestResponse;
    const appleCredential = new OAuthProvider('apple.com').credential({
      idToken: identityToken,
      rawNonce: nonce,
    });

    // Sign in to Firebase with credential
    const result = await signInWithCredential(auth, appleCredential);
    return result.user;
  } catch (error) {
    console.error('Apple Sign-In Error:', error);
    throw error;
  }
};

export const isAppleSignInAvailable = () => {
  return Platform.OS === 'ios' && appleAuth.isSupported;
};

export const signOutFromGoogle = async () => {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.error('Google Sign-Out Error:', error);
  }
};