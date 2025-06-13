import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { signInWithGoogle, signInWithApple, signInAnonymous, initializeUser } from '../services/auth';
import { signInWithGoogleNative, signInWithAppleNative, isAppleSignInAvailable } from '../services/nativeAuth';

interface SignInScreenProps {
  onSignIn: () => void;
}

const SignInScreen: React.FC<SignInScreenProps> = ({ onSignIn }) => {
  const { t } = useTranslation();

  const handleGoogleSignIn = async () => {
    try {
      let firebaseUser;
      
      if (Platform.OS === 'web') {
        firebaseUser = await signInWithGoogle();
      } else {
        firebaseUser = await signInWithGoogleNative();
      }
      
      await initializeUser(firebaseUser);
      onSignIn();
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      Alert.alert(
        t('signIn.error.title', 'Sign-In Error'),
        t('signIn.error.google', 'Google Sign-In failed. Please try again.')
      );
    }
  };

  const handleAppleSignIn = async () => {
    try {
      let firebaseUser;
      
      if (Platform.OS === 'web') {
        firebaseUser = await signInWithApple();
      } else if (Platform.OS === 'ios') {
        firebaseUser = await signInWithAppleNative();
      } else {
        throw new Error('Apple Sign-In is not supported on this platform');
      }
      
      await initializeUser(firebaseUser);
      onSignIn();
    } catch (error) {
      console.error('Apple Sign-In failed:', error);
      Alert.alert(
        t('signIn.error.title', 'Sign-In Error'),
        t('signIn.error.apple', 'Apple Sign-In failed. Please try again.')
      );
    }
  };

  const handleAnonymousSignIn = async () => {
    try {
      const firebaseUser = await signInAnonymous();
      await initializeUser(firebaseUser);
      onSignIn();
    } catch (error) {
      console.error('Anonymous Sign-In failed:', error);
      Alert.alert(
        t('signIn.error.title', 'Sign-In Error'),
        t('signIn.error.anonymous', 'Anonymous Sign-In failed. Please try again.')
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('app.name', '今日の小さな善行')}</Text>
        <Text style={styles.subtitle}>
          {t('signIn.subtitle', 'Join our community of daily good deeds')}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.googleButton]} onPress={handleGoogleSignIn}>
          <Text style={styles.buttonText}>
            {t('signIn.google', 'Continue with Google')}
          </Text>
        </TouchableOpacity>

        {(Platform.OS === 'ios' && isAppleSignInAvailable()) || Platform.OS === 'web' ? (
          <TouchableOpacity style={[styles.button, styles.appleButton]} onPress={handleAppleSignIn}>
            <Text style={[styles.buttonText, styles.appleButtonText]}>
              {t('signIn.apple', 'Continue with Apple')}
            </Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={[styles.button, styles.anonymousButton]} onPress={handleAnonymousSignIn}>
          <Text style={[styles.buttonText, styles.anonymousButtonText]}>
            {t('signIn.anonymous', 'Continue as Guest')}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimer}>
        {t('signIn.disclaimer', 'By continuing, you agree to our terms of service and privacy policy.')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  googleButton: {
    backgroundColor: '#4285f4',
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  anonymousButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#bdc3c7',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  appleButtonText: {
    color: '#ffffff',
  },
  anonymousButtonText: {
    color: '#2c3e50',
  },
  disclaimer: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
    marginTop: 30,
    lineHeight: 18,
  },
});

export default SignInScreen;