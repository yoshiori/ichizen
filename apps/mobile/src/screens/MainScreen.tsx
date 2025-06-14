import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Text,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';

import { DailyTask } from '../components/DailyTask';
import { DoneButton } from '../components/DoneButton';
import { DoneFeedback } from '../components/DoneFeedback';
import { GlobalCounter } from '../components/GlobalCounter';
import { Language } from '../types';
import { useAuth } from '../contexts/AuthContext';
import SignInScreen from './SignInScreen';
import { testFirestoreConnection } from '../services/testFirestore';
import { 
  useTaskManager, 
  useGlobalCounter, 
  useAppInitialization, 
  useFeedbackManager 
} from '../hooks';

const { height } = Dimensions.get('window');

export const MainScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, firebaseUser, loading: authLoading } = useAuth();
  
  // Custom hooks for separated concerns
  const { currentTask, refreshUsed, isCompleted, refreshTask, markCompleted } = useTaskManager(user?.id);
  const { globalCounters, incrementCounter, updateCounters } = useGlobalCounter();
  const { isInitialized, initializationError } = useAppInitialization(firebaseUser?.uid);
  const { showFeedback, isLoading, showFeedbackWithDelay, hideFeedback, setLoading } = useFeedbackManager();

  const currentLanguage = (user?.language || i18n.language) as Language;

  const handleRefreshTask = () => {
    if (!refreshUsed && !isCompleted) {
      refreshTask();
    }
  };

  const handleDonePress = async () => {
    console.log('🎭 Demo mode: Simulating task completion');
    
    setLoading(true);
    
    try {
      // Simulate task completion delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Increment global counter in Firestore
      await incrementCounter();
      
      markCompleted();
      showFeedbackWithDelay();
      
    } catch (error) {
      console.error('❌ Done press error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackComplete = () => {
    hideFeedback();
  };

  // Show loading screen while authenticating
  if (authLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show sign in screen if no user
  if (!user) {
    return <SignInScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>今日の小さな善行</Text>
          <Text style={styles.subtitle}>Today's Small Good Deed</Text>
          {initializationError && (
            <Text style={styles.errorText}>
              {t('error.initialization')}: {initializationError}
            </Text>
          )}
        </View>

        {/* Global Counter */}
        <GlobalCounter 
          totalCount={globalCounters.totalCount}
          todayCount={globalCounters.todayCount}
          animateChanges
          subscribeToUpdates
          onCounterUpdate={(data) => {
            console.log('📊 カウンターが更新されました:', data);
            // Update local state with Firestore data
            updateCounters({
              totalCount: data.total,
              todayCount: data.today
            });
          }}
        />

        {/* Daily Task */}
        <DailyTask
          task={currentTask}
          language={currentLanguage}
          onRefresh={!isCompleted ? handleRefreshTask : undefined}
          refreshUsed={refreshUsed}
        />

        {/* Done Button */}
        <View style={styles.buttonContainer}>
          <DoneButton
            onPress={handleDonePress}
            loading={isLoading}
            disabled={isCompleted}
          />
          
          {isCompleted && (
            <Text style={styles.completedText}>
              {t('feedback.celebration')}
            </Text>
          )}
        </View>

        {/* Status Text */}
        <View style={styles.statusContainer}>
          {refreshUsed && !isCompleted && (
            <Text style={styles.statusText}>
              {t('task.refreshUsed')}
            </Text>
          )}
          
          {!refreshUsed && !isCompleted && (
            <Text style={styles.statusText}>
              {t('task.refreshAvailable')}
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Feedback Overlay */}
      <DoneFeedback
        visible={showFeedback}
        onComplete={handleFeedbackComplete}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    minHeight: height - 100,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  completedText: {
    marginTop: 16,
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statusText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#ff6b6b',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
});