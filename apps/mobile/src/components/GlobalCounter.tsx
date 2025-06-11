import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { GlobalCounterData } from '../types';

interface GlobalCounterProps extends GlobalCounterData {
  style?: ViewStyle;
}

export const GlobalCounter: React.FC<GlobalCounterProps> = ({
  totalCount,
  todayCount,
  style,
}) => {
  const { t } = useTranslation();
  const earthRotation = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

  if (!totalCount && !todayCount) {
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
        {totalCount !== undefined && (
          <Animated.View
            style={[styles.counterItem, { transform: [{ scale: pulseAnim }] }]}
          >
            <Text style={styles.counterLabel}>
              {t('counter.totalTitle')}
            </Text>
            <Text style={styles.counterValue}>
              {formatNumber(totalCount)}
            </Text>
          </Animated.View>
        )}

        {todayCount !== undefined && (
          <Animated.View
            style={[styles.counterItem, { transform: [{ scale: pulseAnim }] }]}
          >
            <Text style={styles.counterLabel}>
              {t('counter.todayTitle')}
            </Text>
            <Text style={styles.counterValue}>
              {formatNumber(todayCount)}
            </Text>
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