/**
 * Firebase Authentication Provider Test Utility
 * 
 * This utility helps verify which authentication providers are enabled
 * in the Firebase Console and provides guidance for setup.
 */

import auth from '@react-native-firebase/auth';
import { signInAnonymous, signInWithGoogle, signInWithApple } from '../services/auth';

export interface AuthProviderStatus {
  name: string;
  isImplemented: boolean;
  requiresConsoleSetup: boolean;
  setupInstructions: string;
  testFunction: () => Promise<any>;
}

export const AUTH_PROVIDERS: AuthProviderStatus[] = [
  {
    name: 'Anonymous',
    isImplemented: true,
    requiresConsoleSetup: true,
    setupInstructions: `
Firebase Console > Authentication > Sign-in method > Anonymous
1. Click on "Anonymous" provider
2. Enable toggle switch
3. Save changes
    `,
    testFunction: signInAnonymous
  },
  {
    name: 'Google',
    isImplemented: true,
    requiresConsoleSetup: true,
    setupInstructions: `
Firebase Console > Authentication > Sign-in method > Google
1. Click on "Google" provider
2. Enable toggle switch
3. Add your project support email
4. Save changes

Note: signInWithPopup may not work in React Native.
Consider using @react-native-google-signin/google-signin for mobile.
    `,
    testFunction: signInWithGoogle
  },
  {
    name: 'Apple',
    isImplemented: true,
    requiresConsoleSetup: true,
    setupInstructions: `
Firebase Console > Authentication > Sign-in method > Apple
1. Click on "Apple" provider
2. Enable toggle switch
3. Configure App ID, Team ID, Key ID, and Private Key from Apple Developer Console
4. Save changes

Note: signInWithPopup may not work in React Native.
Consider using @invertase/react-native-apple-authentication for mobile.
    `,
    testFunction: signInWithApple
  }
];

export const getFirebaseConsoleUrl = (): string => {
  const projectId = 'ichizen-daily-good-deeds';
  return `https://console.firebase.google.com/project/${projectId}/authentication/providers`;
};

export const getProjectInfo = () => {
  return {
    projectId: 'ichizen-daily-good-deeds',
    authDomain: 'ichizen-daily-good-deeds.firebaseapp.com',
    consoleUrl: getFirebaseConsoleUrl(),
    currentAuthState: auth().currentUser
  };
};

/**
 * Test authentication providers in a controlled way
 * This is meant for development/testing purposes only
 */
export const testAuthProviders = async () => {
  console.log('🔍 Firebase Authentication Provider Test');
  console.log('=' .repeat(50));
  
  const projectInfo = getProjectInfo();
  console.log(`Project ID: ${projectInfo.projectId}`);
  console.log(`Auth Domain: ${projectInfo.authDomain}`);
  console.log(`Console URL: ${projectInfo.consoleUrl}`);
  console.log(`Current User: ${projectInfo.currentAuthState ? 'Signed In' : 'Not Signed In'}`);
  console.log();

  for (const provider of AUTH_PROVIDERS) {
    console.log(`📱 ${provider.name} Authentication`);
    console.log(`   Implemented: ${provider.isImplemented ? '✅' : '❌'}`);
    console.log(`   Requires Console Setup: ${provider.requiresConsoleSetup ? '🔧' : '✅'}`);
    
    if (provider.requiresConsoleSetup) {
      console.log(`   Setup Instructions:${provider.setupInstructions}`);
    }
    
    // Note: We don't actually test the sign-in here to avoid popup/redirect issues
    // Instead, we just verify the functions exist and are callable
    console.log(`   Test Function Available: ${typeof provider.testFunction === 'function' ? '✅' : '❌'}`);
    console.log();
  }

  console.log('📋 Next Steps:');
  console.log('1. Visit Firebase Console to enable authentication providers');
  console.log('2. Configure each provider according to setup instructions');
  console.log('3. Test authentication in your app');
  console.log();
  console.log(`🔗 Firebase Console: ${getFirebaseConsoleUrl()}`);
};

/**
 * Check if a specific provider is likely configured
 * This is a basic check and doesn't guarantee the provider works
 */
export const checkProviderConfig = async (providerName: string): Promise<boolean> => {
  try {
    switch (providerName.toLowerCase()) {
      case 'anonymous':
        // Anonymous auth is usually enabled by default, but let's be conservative
        return false; // Requires manual verification in console
      case 'google':
      case 'apple':
        // These definitely require console configuration
        return false;
      default:
        return false;
    }
  } catch (error) {
    console.error(`Error checking ${providerName} provider:`, error);
    return false;
  }
};