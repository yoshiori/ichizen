import React, {Component, ErrorInfo, ReactNode} from "react";
import {View, Text, StyleSheet} from "react-native";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError(error: Error): State {
    console.error("ErrorBoundary caught error:", error);
    return {hasError: true, error};
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary error details:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>アプリでエラーが発生しました</Text>
          <Text style={styles.subtitle}>Something went wrong</Text>
          <Text style={styles.error}>
            A component suspended while responding to synchronous input. This will cause the UI to be replaced with a
            loading indicator. To fix, updates that suspend should be wrapped with startTransition.
          </Text>
          <Text style={styles.details}>Error: {this.state.error?.message || "Unknown error"}</Text>
          <Text style={styles.details}>Stack: {this.state.error?.stack?.slice(0, 500) || "No stack trace"}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#dc3545",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
    marginBottom: 16,
  },
  error: {
    fontSize: 14,
    color: "#495057",
    textAlign: "center",
    fontFamily: "monospace",
    backgroundColor: "#f1f3f4",
    padding: 12,
    borderRadius: 4,
    marginBottom: 8,
  },
  details: {
    fontSize: 12,
    color: "#6c757d",
    textAlign: "left",
    fontFamily: "monospace",
    backgroundColor: "#e9ecef",
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
});
