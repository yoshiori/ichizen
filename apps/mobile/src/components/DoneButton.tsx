import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

interface DoneButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const DoneButton: React.FC<DoneButtonProps> = ({
  onPress,
  loading = false,
  disabled = false,
  style,
}) => {
  const { t } = useTranslation();

  const handlePress = () => {
    if (!loading && !disabled) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        (loading || disabled) && styles.buttonDisabled,
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={loading || disabled}
    >
      {loading ? (
        <View style={styles.loadingContainer} testID="loading-indicator">
          <ActivityIndicator color="#fff" size="large" />
        </View>
      ) : (
        <Text style={styles.buttonText}>{t('common.done')}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 50,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonDisabled: {
    backgroundColor: '#9E9E9E',
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  loadingContainer: {
    minHeight: 29, // Same height as text to prevent layout shift
  },
});