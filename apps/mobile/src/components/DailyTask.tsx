import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Task } from '../types/firebase';
import { Language } from '../types';

interface DailyTaskProps {
  task: Task;
  language: Language;
  onRefresh?: () => void;
  refreshUsed?: boolean;
  style?: ViewStyle;
}

export const DailyTask: React.FC<DailyTaskProps> = ({
  task,
  language,
  onRefresh,
  refreshUsed = false,
  style,
}) => {
  const { t } = useTranslation();

  const handleRefresh = () => {
    if (!refreshUsed && onRefresh) {
      onRefresh();
    }
  };

  const getCategoryLabel = (category: Task['category']) => {
    return category[language];
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.categoryIcon}>{task.icon}</Text>
        <Text style={styles.categoryLabel} testID="task-category">
          {getCategoryLabel(task.category)}
        </Text>
      </View>

      <Text style={styles.taskText}>
        {task.text[language]}
      </Text>

      {onRefresh && (
        <TouchableOpacity
          style={[
            styles.refreshButton,
            refreshUsed && styles.refreshButtonDisabled,
          ]}
          onPress={handleRefresh}
          disabled={refreshUsed}
          testID="refresh-task-button"
        >
          <Text
            style={[
              styles.refreshButtonText,
              refreshUsed && styles.refreshButtonTextDisabled,
            ]}
          >
            {refreshUsed ? '🔄' : '🔄'}
          </Text>
          <Text
            style={[
              styles.refreshLabel,
              refreshUsed && styles.refreshLabelDisabled,
            ]}
          >
            {refreshUsed 
              ? t('task.refreshUsed')
              : t('task.refreshAvailable')
            }
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    margin: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  categoryLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  taskText: {
    fontSize: 20,
    lineHeight: 28,
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  refreshButtonDisabled: {
    backgroundColor: '#f9f9f9',
    borderColor: '#f0f0f0',
  },
  refreshButtonText: {
    fontSize: 16,
    marginRight: 8,
  },
  refreshButtonTextDisabled: {
    opacity: 0.3,
  },
  refreshLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  refreshLabelDisabled: {
    color: '#999',
  },
});