import React from "react";
import {View, Text, StyleSheet, SafeAreaView, TouchableOpacity} from "react-native";
import {useTranslation} from "react-i18next";
import {useAuth} from "../contexts/AuthContext";
import {Language} from "../types";

export const ProfileScreen: React.FC = () => {
  const {t, i18n} = useTranslation();
  const {user} = useAuth();

  const handleLanguageChange = async (lang: Language) => {
    await i18n.changeLanguage(lang);
    // In a real app, you would also update the user's language preference in Firestore
  };

  const currentLanguage = (user?.language || i18n.language) as Language;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("profile.title", "Profile")}</Text>
      </View>

      <View style={styles.content}>
        {/* User ID Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("profile.userId", "User ID")}</Text>
          <View style={styles.userIdContainer}>
            <Text style={styles.userId}>{user?.id || "Not available"}</Text>
          </View>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("profile.language", "Language")}</Text>
          <View style={styles.languageButtons}>
            <TouchableOpacity
              style={[styles.languageButton, currentLanguage === "ja" && styles.languageButtonActive]}
              onPress={() => handleLanguageChange("ja")}
            >
              <Text style={[styles.languageButtonText, currentLanguage === "ja" && styles.languageButtonTextActive]}>
                日本語
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.languageButton, currentLanguage === "en" && styles.languageButtonActive]}
              onPress={() => handleLanguageChange("en")}
            >
              <Text style={[styles.languageButtonText, currentLanguage === "en" && styles.languageButtonTextActive]}>
                English
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  userIdContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  userId: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
  languageButtons: {
    flexDirection: "row",
    gap: 12,
  },
  languageButton: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
  },
  languageButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  languageButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  languageButtonTextActive: {
    color: "#fff",
  },
});
