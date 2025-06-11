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
  addDailyTaskHistory, 
  getUserTaskHistory,
  getGlobalCounter,
  incrementGlobalCounter 
} from '../services/firestore';
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
      try {
        // Load global counter
        const counter = await getGlobalCounter();
        if (counter) {
          setGlobalCounters({
            totalCount: counter.totalCompleted,
            todayCount: counter.todayCompleted
          });
        }

        // Check if user completed today's task
        if (user) {
          const today = new Date().toISOString().split('T')[0];
          const todayHistory = await getUserTaskHistory(user.id, today);
          setIsCompleted(!!todayHistory);
        }

        // Pick random task for the day
        const randomIndex = Math.floor(Math.random() * sampleTasks.length);
        setCurrentTask(sampleTasks[randomIndex]);
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    if (user) {
      initializeApp();
    }
  }, [user]);

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
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Add task history
      await addDailyTaskHistory({
        userId: user.id,
        taskId: currentTask.id,
        completedAt: new Date(),
        date: today
      });

      // Update global counter
      await incrementGlobalCounter();

      // Load updated counter
      const counter = await getGlobalCounter();
      if (counter) {
        setGlobalCounters({
          totalCount: counter.totalCompleted,
          todayCount: counter.todayCompleted
        });
      }

      setIsCompleted(true);
      setShowFeedback(true);
      
    } catch (error) {
      console.error('Done press error:', error);
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