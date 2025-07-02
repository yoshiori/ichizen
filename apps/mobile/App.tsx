import React, {Suspense} from "react";
import {View, Text, ActivityIndicator, StyleSheet} from "react-native";
import "./src/i18n";
import {ErrorBoundary} from "./src/components/ErrorBoundary";
import {AuthProvider} from "./src/contexts/AuthContext";
import {TabNavigation} from "./src/components/TabNavigation";

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={styles.loadingText}>アプリを読み込み中...</Text>
  </View>
);

const AppContent = () => {
  return <TabNavigation />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Suspense>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6c757d",
  },
});
