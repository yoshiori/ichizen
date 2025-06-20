import React, {useState, useMemo} from "react";
import {View, Text, TouchableOpacity, StyleSheet} from "react-native";
import {useTranslation} from "react-i18next";

import {MainScreen} from "../screens/MainScreen";
import {FollowScreen} from "../screens/FollowScreen";
import {ProfileScreen} from "../screens/ProfileScreen";

type TabType = "home" | "community" | "profile";

interface Tab {
  key: TabType;
  title: string;
  icon: string;
}

export const TabNavigation: React.FC = () => {
  const {t} = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>("home");

  const tabs: Tab[] = useMemo(
    () => [
      {
        key: "home",
        title: t("navigation.home", "Home"),
        icon: "🏠",
      },
      {
        key: "community",
        title: t("navigation.community", "Community"),
        icon: "👥",
      },
      {
        key: "profile",
        title: t("navigation.profile", "Profile"),
        icon: "👤",
      },
    ],
    [t]
  );

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <MainScreen />;
      case "community":
        return <FollowScreen />;
      case "profile":
        return <ProfileScreen />;
      default:
        return <MainScreen />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Main content */}
      <View style={styles.content}>{renderContent()}</View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={activeTab === tab.key ? styles.tabIconActive : styles.tabIcon}>{tab.icon}</Text>
            <Text style={activeTab === tab.key ? styles.tabTitleActive : styles.tabTitle}>{tab.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingBottom: 34, // Safe area for iPhone X+
    paddingTop: 10,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tabItemActive: {
    // Active tab style
  },
  tabIcon: {
    fontSize: 22,
    marginBottom: 4,
    color: "#9E9E9E",
  },
  tabIconActive: {
    color: "#1a1a1a",
  },
  tabTitle: {
    fontSize: 11,
    color: "#9E9E9E",
    fontWeight: "500",
  },
  tabTitleActive: {
    color: "#1a1a1a",
    fontWeight: "600",
  },
});
