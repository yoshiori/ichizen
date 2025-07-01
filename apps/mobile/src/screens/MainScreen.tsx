import React from "react";
import {View, ScrollView, StyleSheet, SafeAreaView, Text, TouchableOpacity, StatusBar} from "react-native";
import {useTranslation} from "react-i18next";

import {IllustrationCard} from "../components/IllustrationCard";
import {DoneFeedback} from "../components/DoneFeedback";
import {Language} from "../types";
import {useAuth} from "../contexts/AuthContext";
import {useTaskManager, useGlobalCounter, useAppInitialization, useFeedbackManager} from "../hooks";

export const MainScreen: React.FC = () => {
  const {t, i18n} = useTranslation();
  const {user, firebaseUser} = useAuth();

  // Custom hooks for separated concerns
  const {currentTask, refreshUsed, isCompleted, refreshTask, markCompleted} = useTaskManager(user?.id);
  const {incrementCounter} = useGlobalCounter();
  const {isInitialized: _isInitialized} = useAppInitialization(firebaseUser?.uid);
  const {showFeedback, isLoading, showFeedbackWithDelay, hideFeedback, setLoading} = useFeedbackManager();

  const currentLanguage = (user?.language || i18n.language) as Language;

  const handleRefreshTask = () => {
    if (!refreshUsed && !isCompleted) {
      refreshTask();
    }
  };

  const handleDonePress = async () => {
    console.log("🎭 Demo mode: Simulating task completion");

    setLoading(true);

    try {
      // Simulate task completion delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Increment global counter in Firestore
      await incrementCounter();

      markCompleted();
      showFeedbackWithDelay();
    } catch (error) {
      console.error("❌ Done press error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackComplete = () => {
    hideFeedback();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.contentWrapper}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Illustration Card */}
          <IllustrationCard category={currentTask.category.en} icon={currentTask.icon} />

          {/* Task Info */}
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>{currentTask.text[currentLanguage]}</Text>
            <Text style={styles.taskDescription}>
              {currentTask.category[currentLanguage]} • {t("task.todaysTask", "Today's task")}
            </Text>
          </View>

          {/* Status Text */}
          {isCompleted && (
            <View style={styles.statusContainer}>
              <Text style={styles.completedStatusText}>{t("feedback.celebration")}</Text>
            </View>
          )}
        </ScrollView>

        {/* Action Buttons - Fixed at bottom */}
        <View style={styles.buttonContainer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.changeButton, (refreshUsed || isCompleted) && styles.buttonDisabled]}
              onPress={handleRefreshTask}
              disabled={refreshUsed || isCompleted}
            >
              <Text style={[styles.changeButtonText, (refreshUsed || isCompleted) && styles.buttonTextDisabled]}>
                {t("task.changeTask", "Change Task")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.completeButton, isCompleted && styles.completeButtonDisabled]}
              onPress={handleDonePress}
              disabled={isCompleted || isLoading}
            >
              <Text style={styles.completeButtonText}>
                {isCompleted ? t("task.completed", "Completed") : t("task.complete", "Complete")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Feedback Overlay */}
      <DoneFeedback visible={showFeedback} onComplete={handleFeedbackComplete} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentWrapper: {
    flex: 1,
    paddingTop: 20,
  },
  taskInfo: {
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  taskTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 12,
  },
  taskDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  changeButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#333",
  },
  changeButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  completeButton: {
    backgroundColor: "#2196F3",
  },
  completeButtonDisabled: {
    backgroundColor: "#4CAF50",
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonTextDisabled: {
    opacity: 0.5,
  },
  statusContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 24,
  },
  completedStatusText: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "600",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
  },
});
