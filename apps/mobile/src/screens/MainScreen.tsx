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
import { Task, Language } from '../types';
import { sampleTasks } from '../data/sampleTasks';

const { height } = Dimensions.get('window');

export const MainScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [currentTask, setCurrentTask] = useState<Task>(sampleTasks[0]);
  const [refreshUsed, setRefreshUsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [globalCounters, setGlobalCounters] = useState({
    totalCount: 125847,
    todayCount: 1246
  });

  const currentLanguage = i18n.language as Language;

  useEffect(() => {
    // Reset daily state (simulate new day)
    const resetDailyState = () => {
      setRefreshUsed(false);
      setIsCompleted(false);
      // Pick random task for the day
      const randomIndex = Math.floor(Math.random() * sampleTasks.length);
      setCurrentTask(sampleTasks[randomIndex]);
    };

    resetDailyState();
  }, []);

  const handleRefreshTask = () => {
    if (!refreshUsed) {
      setRefreshUsed(true);
      // Get a different random task
      const availableTasks = sampleTasks.filter(task => task.id !== currentTask.id);
      const randomIndex = Math.floor(Math.random() * availableTasks.length);
      setCurrentTask(availableTasks[randomIndex]);
    }
  };

  const handleDonePress = () => {
    setIsLoading(true);
    
    // Simulate network request
    setTimeout(() => {
      setIsLoading(false);
      setIsCompleted(true);
      setShowFeedback(true);
      
      // Update counters
      setGlobalCounters(prev => ({
        totalCount: prev.totalCount + 1,
        todayCount: prev.todayCount + 1
      }));
    }, 1500);
  };

  const handleFeedbackComplete = () => {
    setShowFeedback(false);
  };

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
});