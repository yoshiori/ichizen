import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { MainScreen } from '../screens/MainScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { FollowScreen } from '../screens/FollowScreen';

type TabType = 'home' | 'history' | 'follow';

interface Tab {
  key: TabType;
  title: string;
  icon: string;
}

export const TabNavigation: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('home');

  const tabs: Tab[] = [
    {
      key: 'home',
      title: t('common.today', '今日'),
      icon: '🌟'
    },
    {
      key: 'history',
      title: t('history.title', '履歴'),
      icon: '📊'
    },
    {
      key: 'follow',
      title: t('follow.title', 'フォロー'),
      icon: '👥'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <MainScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'follow':
        return <FollowScreen />;
      default:
        return <MainScreen />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Main content */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabItem,
              activeTab === tab.key && styles.tabItemActive
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[
              styles.tabIcon,
              activeTab === tab.key && styles.tabIconActive
            ]}>
              {tab.icon}
            </Text>
            <Text style={[
              styles.tabTitle,
              activeTab === tab.key && styles.tabTitleActive
            ]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 34, // Safe area for iPhone X+
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tabItemActive: {
    // Active tab style
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.6,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabTitle: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  tabTitleActive: {
    color: '#2196F3',
    fontWeight: '600',
  },
});