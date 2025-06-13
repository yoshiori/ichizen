import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';

import { useAuth } from '../contexts/AuthContext';
import { getUserTaskHistoryWithTasks } from '../services/firestore';
import { DailyTaskHistory, Task } from '../types/firebase';
import { Language } from '../types';
import { getMonthBoundaries, formatMonthYearByLanguage } from '../utils/dateFormat';

const { width } = Dimensions.get('window');

interface HistoryEntry extends DailyTaskHistory {
  task?: Task;
}

interface CalendarDay {
  date: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  hasTask: boolean;
  isCompleted: boolean;
  taskEntry?: HistoryEntry;
}

export const HistoryScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, firebaseUser } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const currentLanguage = (user?.language || i18n.language) as Language;

  useEffect(() => {
    loadHistory();
  }, [user, currentMonth]);

  const loadHistory = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get month boundaries using consistent UTC calculation
      const { start, end } = getMonthBoundaries(currentMonth);
      
      const historyData = await getUserTaskHistoryWithTasks(user.id, start, end);
      setHistory(historyData);
      
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First and last day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Calendar start date (from Monday)
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(firstDay.getDate() - mondayOffset);
    
    const days: CalendarDay[] = [];
    const currentDate = new Date(startDate);
    
    // Generate 6 weeks worth of calendar
    for (let week = 0; week < 6; week++) {
      for (let day = 0; day < 7; day++) {
        const dateString = currentDate.toISOString().split('T')[0];
        const isCurrentMonth = currentDate.getMonth() === month;
        
        // Find task history for this day
        const taskEntry = history.find(entry => entry.date === dateString);
        
        days.push({
          date: dateString,
          dayOfMonth: currentDate.getDate(),
          isCurrentMonth,
          hasTask: !!taskEntry,
          isCompleted: taskEntry?.completed || false,
          taskEntry
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
    setSelectedDate(null);
  };


  const handleDayPress = (day: CalendarDay) => {
    if (day.hasTask) {
      setSelectedDate(selectedDate === day.date ? null : day.date);
    }
  };

  const calendarDays = generateCalendarDays();
  const selectedEntry = selectedDate 
    ? calendarDays.find(day => day.date === selectedDate)?.taskEntry 
    : null;

  const weekDays = currentLanguage === 'ja' 
    ? ['月', '火', '水', '木', '金', '土', '日']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {t('history.title', 'あなたの善行履歴')}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Month navigation */}
        <View style={styles.monthNavigation}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigateMonth('prev')}
          >
            <Text style={styles.navButtonText}>‹</Text>
          </TouchableOpacity>
          
          <Text style={styles.monthText}>
            {formatMonthYearByLanguage(currentMonth, currentLanguage)}
          </Text>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigateMonth('next')}
          >
            <Text style={styles.navButtonText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Day of week header */}
        <View style={styles.weekHeader}>
          {weekDays.map((day, index) => (
            <View key={index} style={styles.weekDayCell}>
              <Text style={styles.weekDayText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>
              {t('history.loading', '履歴を読み込み中...')}
            </Text>
          </View>
        ) : (
          <View style={styles.calendar}>
            {Array.from({ length: 6 }).map((_, weekIndex) => (
              <View key={weekIndex} style={styles.weekRow}>
                {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => (
                  <TouchableOpacity
                    key={`${weekIndex}-${dayIndex}`}
                    style={[
                      styles.dayCell,
                      !day.isCurrentMonth && styles.dayOtherMonth,
                      day.hasTask && styles.dayWithTask,
                      day.isCompleted && styles.dayCompleted,
                      selectedDate === day.date && styles.daySelected
                    ]}
                    onPress={() => handleDayPress(day)}
                    disabled={!day.hasTask}
                  >
                    <Text style={[
                      styles.dayText,
                      !day.isCurrentMonth && styles.dayTextOtherMonth,
                      day.hasTask && styles.dayTextWithTask,
                      day.isCompleted && styles.dayTextCompleted
                    ]}>
                      {day.dayOfMonth}
                    </Text>
                    {day.isCompleted && (
                      <View style={styles.completedIndicator}>
                        <Text style={styles.completedEmoji}>✨</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Selected day details */}
        {selectedEntry && (
          <View style={styles.taskDetail}>
            <View style={styles.taskDetailHeader}>
              <Text style={styles.taskDetailDate}>
                {new Date(selectedDate!).toLocaleDateString(
                  currentLanguage === 'ja' ? 'ja-JP' : 'en-US',
                  { month: 'long', day: 'numeric', weekday: 'long' }
                )}
              </Text>
              <View style={[
                styles.statusBadge,
                selectedEntry.completed ? styles.statusCompleted : styles.statusIncomplete
              ]}>
                <Text style={styles.statusText}>
                  {selectedEntry.completed 
                    ? t('history.completed', '完了') 
                    : t('history.incomplete', '未完了')
                  }
                </Text>
              </View>
            </View>
            
            {selectedEntry.task && (
              <View style={styles.taskInfo}>
                <Text style={styles.taskCategory}>
                  {selectedEntry.task.icon} {selectedEntry.task.category[currentLanguage]}
                </Text>
                <Text style={styles.taskText}>
                  {selectedEntry.task.text[currentLanguage]}
                </Text>
                {selectedEntry.completed && selectedEntry.completedAt && (
                  <Text style={styles.completedTime}>
                    {t('history.completedAt', '完了時刻')}: {' '}
                    {new Date(selectedEntry.completedAt).toLocaleTimeString(
                      currentLanguage === 'ja' ? 'ja-JP' : 'en-US',
                      { hour: '2-digit', minute: '2-digit' }
                    )}
                  </Text>
                )}
              </View>
            )}
          </View>
        )}

        {/* Statistics */}
        <View style={styles.stats}>
          <Text style={styles.statsTitle}>
            {t('history.monthlyStats', '今月の統計')}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {history.filter(entry => entry.completed).length}
              </Text>
              <Text style={styles.statLabel}>
                {t('history.completed', '完了')}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {history.length}
              </Text>
              <Text style={styles.statLabel}>
                {t('history.total', '総数')}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {history.length > 0 
                  ? Math.round((history.filter(entry => entry.completed).length / history.length) * 100)
                  : 0
                }%
              </Text>
              <Text style={styles.statLabel}>
                {t('history.completionRate', '達成率')}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  weekHeader: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  weekDayCell: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },
  calendar: {
    backgroundColor: '#ffffff',
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  dayOtherMonth: {
    backgroundColor: '#f8f9fa',
  },
  dayWithTask: {
    backgroundColor: '#e3f2fd',
  },
  dayCompleted: {
    backgroundColor: '#e8f5e8',
  },
  daySelected: {
    backgroundColor: '#2196F3',
  },
  dayText: {
    fontSize: 16,
    color: '#333333',
  },
  dayTextOtherMonth: {
    color: '#cccccc',
  },
  dayTextWithTask: {
    fontWeight: '600',
    color: '#1976d2',
  },
  dayTextCompleted: {
    fontWeight: '600',
    color: '#2e7d32',
  },
  completedIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  completedEmoji: {
    fontSize: 12,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  taskDetail: {
    margin: 16,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  taskDetailDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusCompleted: {
    backgroundColor: '#e8f5e8',
  },
  statusIncomplete: {
    backgroundColor: '#ffebee',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
  },
  taskInfo: {
    gap: 8,
  },
  taskCategory: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  taskText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
  },
  completedTime: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
  },
  stats: {
    margin: 16,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
});