import React from "react";
import {View, Text, TouchableOpacity, StyleSheet, Alert} from "react-native";
import {useAuth, AuthMethod} from "../contexts/AuthContext";
import {useTranslation} from "react-i18next";
import {GlobalLoadingOverlay} from "../components/GlobalLoadingOverlay";

const SignInScreen: React.FC = () => {
  const {signIn, loading, signingInMethod, isSigningIn} = useAuth();
  const {t} = useTranslation();

  // Computed property for button disabled state
  const isButtonDisabled = loading || signingInMethod !== null;

  const getLoadingMessage = (method: string) => {
    switch (method) {
      case "google":
        return t("signIn.loading.google");
      case "apple":
        return t("signIn.loading.apple");
      case "anonymous":
        return t("signIn.loading.guest");
      default:
        return t("signIn.loading");
    }
  };

  const handleSignIn = async (method: AuthMethod) => {
    try {
      await signIn(method);
      // Global loading overlay will handle the loading state
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t("signIn.error.general");
      Alert.alert(t("signIn.error.title"), errorMessage);
    }
  };

  const getButtonText = (method: AuthMethod) => {
    switch (method) {
      case "google":
        return t("signIn.google");
      case "apple":
        return t("signIn.apple");
      case "anonymous":
        return t("signIn.guest");
      default:
        return "";
    }
  };

  const getButtonStyle = (method: AuthMethod) => {
    switch (method) {
      case "google":
        return [styles.button, styles.googleButton];
      case "apple":
        return [styles.button, styles.appleButton];
      case "anonymous":
        return [styles.button, styles.guestButton];
      default:
        return styles.button;
    }
  };

  const getTextStyle = (method: AuthMethod) => {
    switch (method) {
      case "google":
        return [styles.buttonText, styles.googleText];
      case "apple":
        return [styles.buttonText, styles.appleText];
      case "anonymous":
        return [styles.buttonText, styles.guestText];
      default:
        return styles.buttonText;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("signIn.title")}</Text>
        <Text style={styles.subtitle}>{t("signIn.subtitle")}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={getButtonStyle("google")}
          onPress={() => handleSignIn("google")}
          disabled={isButtonDisabled}
        >
          <Text style={styles.buttonIcon}>🌐</Text>
          <Text style={getTextStyle("google")}>{getButtonText("google")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={getButtonStyle("apple")}
          onPress={() => handleSignIn("apple")}
          disabled={isButtonDisabled}
        >
          <Text style={styles.buttonIcon}>🍎</Text>
          <Text style={getTextStyle("apple")}>{getButtonText("apple")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={getButtonStyle("anonymous")}
          onPress={() => handleSignIn("anonymous")}
          disabled={isButtonDisabled}
        >
          <Text style={styles.buttonIcon}>👤</Text>
          <Text style={getTextStyle("anonymous")}>{getButtonText("anonymous")}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>{t("signIn.privacy")}</Text>

      <GlobalLoadingOverlay
        visible={isSigningIn}
        message={signingInMethod ? getLoadingMessage(signingInMethod) : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 15,
    marginBottom: 30,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    minHeight: 50,
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  googleButton: {
    backgroundColor: "#4285f4",
  },
  googleText: {
    color: "#ffffff",
  },
  appleButton: {
    backgroundColor: "#000000",
  },
  appleText: {
    color: "#ffffff",
  },
  guestButton: {
    backgroundColor: "#95a5a6",
  },
  guestText: {
    color: "#ffffff",
  },
  footer: {
    fontSize: 12,
    color: "#95a5a6",
    textAlign: "center",
    lineHeight: 18,
  },
});

export default SignInScreen;
