import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { GlobalCounterData, CounterUpdateData } from '../types';
import { 
  subscribeToGlobalCounter, 
  unsubscribeFromGlobalCounter,
  type Unsubscriber 
} from '../services/globalCounterSubscription';

interface GlobalCounterProps extends GlobalCounterData {
  style?: ViewStyle;
  animateChanges?: boolean;
  onCounterUpdate?: (data: CounterUpdateData) => void;
  subscribeToUpdates?: boolean;
}

export const GlobalCounter: React.FC<GlobalCounterProps> = ({
  totalCount,
  todayCount,
  style,
  animateChanges = false,
  onCounterUpdate,
  subscribeToUpdates = false,
}) => {
  const { t } = useTranslation();
  const earthRotation = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const countAnim = useRef(new Animated.Value(0)).current;
  const [prevTotal, setPrevTotal] = React.useState(totalCount);
  const [prevToday, setPrevToday] = React.useState(todayCount);
  const [firestoreData, setFirestoreData] = useState<{ totalCount?: number; todayCount?: number } | null>(null);
  const unsubscriberRef = useRef<Unsubscriber | null>(null);

  useEffect(() => {
    // Earth rotation animation
    Animated.loop(
      Animated.timing(earthRotation, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation for counters
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [earthRotation, pulseAnim]);

  // Firestore subscription effect
  useEffect(() => {
    if (!subscribeToUpdates) return;

    let unsubscriber: Unsubscriber | null = null;

    try {
      unsubscriber = subscribeToGlobalCounter((data) => {
        setFirestoreData({
          totalCount: data.totalCompleted,
          todayCount: data.todayCompleted
        });

        // Call callback if provided
        if (onCounterUpdate) {
          onCounterUpdate({
            total: data.totalCompleted,
            today: data.todayCompleted
          });
        }
      });

      unsubscriberRef.current = unsubscriber;
    } catch (error) {
      console.error('Failed to subscribe to global counter updates:', error);
    }

    // Cleanup on unmount
    return () => {
      if (unsubscriber) {
        unsubscriber();
      }
      unsubscriberRef.current = null;
    };
  }, [subscribeToUpdates, onCounterUpdate]);

  // Handle counter changes with animation
  useEffect(() => {
    const currentTotal = displayTotalCount;
    const currentToday = displayTodayCount;
    
    if (animateChanges && (currentTotal !== prevTotal || currentToday !== prevToday)) {
      // Trigger animation when values change
      Animated.sequence([
        Animated.timing(countAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(countAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Update previous values
      setPrevTotal(currentTotal);
      setPrevToday(currentToday);
    }
  }, [displayTotalCount, displayTodayCount, animateChanges, prevTotal, prevToday, countAnim]);

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const earthRotationStyle = {
    transform: [
      {
        rotate: earthRotation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  };

  // Use Firestore data if available, otherwise use props
  const displayTotalCount = firestoreData?.totalCount ?? totalCount;
  const displayTodayCount = firestoreData?.todayCount ?? todayCount;

  if (!displayTotalCount && !displayTodayCount) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.loadingText} testID="counter-loading">
          {t('counter.loading')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[styles.earthContainer, earthRotationStyle]}
        testID="earth-animation"
      >
        <Text style={styles.earthEmoji}>🌍</Text>
      </Animated.View>

      <View style={styles.countersContainer}>
        {displayTotalCount !== undefined && (
          <Animated.View
            style={[styles.counterItem, { transform: [{ scale: pulseAnim }] }]}
            testID={animateChanges ? 'counter-animation-wrapper' : undefined}
          >
            <Text style={styles.counterLabel}>
              {t('counter.totalTitle')}
            </Text>
            <Animated.Text 
              style={[
                styles.counterValue,
                animateChanges ? {
                  opacity: countAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 0.3, 1],
                  }),
                  transform: [{
                    scale: countAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 1.2, 1],
                    }),
                  }],
                } : {}
              ]}
              testID="total-counter-value"
            >
              {formatNumber(displayTotalCount)}
            </Animated.Text>
          </Animated.View>
        )}

        {displayTodayCount !== undefined && (
          <Animated.View
            style={[styles.counterItem, { transform: [{ scale: pulseAnim }] }]}
          >
            <Text style={styles.counterLabel}>
              {t('counter.todayTitle')}
            </Text>
            <Animated.Text 
              style={[
                styles.counterValue,
                animateChanges ? {
                  opacity: countAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 0.3, 1],
                  }),
                  transform: [{
                    scale: countAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 1.2, 1],
                    }),
                  }],
                } : {}
              ]}
              testID="today-counter-value"
            >
              {formatNumber(displayTodayCount)}
            </Animated.Text>
          </Animated.View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    margin: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  earthContainer: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  earthEmoji: {
    fontSize: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  countersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  counterItem: {
    alignItems: 'center',
    flex: 1,
  },
  counterLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  counterValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
  },
});