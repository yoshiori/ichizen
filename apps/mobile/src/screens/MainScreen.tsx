import React, { useState, useEffect } from 'react';
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
import { Task } from '../types/firebase';
import { Language } from '../types';
import { sampleTasks } from '../data/sampleTasks';
import { useAuth } from '../contexts/AuthContext';
import { 
  getUserTaskHistory,
  getGlobalCounter
} from '../services/firestore';
import { 
  getTodayTask, 
  completeTask 
} from '../services/cloudFunctions';
import { testFirestoreConnection } from '../services/testFirestore';

const { height } = Dimensions.get('window');

export const MainScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, firebaseUser, loading: authLoading, signIn } = useAuth();
  const [currentTask, setCurrentTask] = useState<Task>(sampleTasks[0]);
  const [refreshUsed, setRefreshUsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [globalCounters, setGlobalCounters] = useState({
    totalCount: 125847,
    todayCount: 1246
  });

  const currentLanguage = (user?.language || i18n.language) as Language;

  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 Initializing app...', {
        environment: __DEV__ ? 'development' : 'production',
        user: firebaseUser?.uid,
        hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A'
      });
      
      try {
        // Load global counter
        console.log('📊 Loading global counter...');
        const counter = await getGlobalCounter();
        console.log('📊 Global counter loaded:', counter);
        
        if (counter) {
          setGlobalCounters({
            totalCount: counter.totalCompleted,
            todayCount: counter.todayCompleted
          });
        }

        // Get today's task using Cloud Functions
        if (firebaseUser) {
          try {
            console.log('📡 Getting today task from Cloud Functions...');
            const todayTaskData = await getTodayTask();
            console.log('✅ Today task loaded:', todayTaskData);
            setCurrentTask(todayTaskData.task);
            setIsCompleted(todayTaskData.completed);
          } catch (error) {
            console.error('❌ Error getting today task:', error);
            // Fallback to sample task
            const randomIndex = Math.floor(Math.random() * sampleTasks.length);
            setCurrentTask(sampleTasks[randomIndex]);
          }
        } else {
          // Not authenticated, show sample task
          const randomIndex = Math.floor(Math.random() * sampleTasks.length);
          setCurrentTask(sampleTasks[randomIndex]);
        }
        
        // Test Firestore connection
        console.log('🔥 Testing Firestore connection...');
        await testFirestoreConnection();
        console.log('✅ Firestore connection test completed');
      } catch (error) {
        console.error('❌ Initialization error:', error);
      }
    };

    initializeApp();
  }, [user, firebaseUser]);

  const handleRefreshTask = () => {
    if (!refreshUsed) {
      setRefreshUsed(true);
      // Get a different random task
      const availableTasks = sampleTasks.filter(task => task.id !== currentTask.id);
      const randomIndex = Math.floor(Math.random() * availableTasks.length);
      setCurrentTask(availableTasks[randomIndex]);
    }
  };

  const handleDonePress = async () => {
    if (!firebaseUser) return;
    
    console.log('🚀 Starting task completion...', {
      user: firebaseUser.uid,
      environment: __DEV__ ? 'development' : 'production'
    });
    
    setIsLoading(true);
    
    try {
      // Complete task using Cloud Functions
      console.log('📡 Calling completeTask Cloud Function...');
      const result = await completeTask();
      console.log('✅ completeTask result:', result);

      // Load updated counter
      console.log('📊 Loading global counter...');
      const counter = await getGlobalCounter();
      console.log('📊 Global counter:', counter);
      
      if (counter) {
        setGlobalCounters({
          totalCount: counter.totalCompleted,
          todayCount: counter.todayCompleted
        });
      }

      setIsCompleted(true);
      setShowFeedback(true);
      
    } catch (error) {
      console.error('❌ Done press error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedbackComplete = () => {
    setShowFeedback(false);
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

  // Show sign in button if no user
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authContainer}>
          <Text style={styles.title}>今日の小さな善行</Text>
          <Text style={styles.subtitle}>Today's Small Good Deed</Text>
          <DoneButton
            onPress={signIn}
            loading={isLoading}
            disabled={false}
          />
        </View>
      </SafeAreaView>
    );
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
          <DoneButton
            onPress={() => testFirestoreConnection()}
            loading={false}
            disabled={false}
          />
        </View>

        {/* Global Counter */}
        <GlobalCounter 
          totalCount={globalCounters.totalCount}
          todayCount={globalCounters.todayCount}
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
});