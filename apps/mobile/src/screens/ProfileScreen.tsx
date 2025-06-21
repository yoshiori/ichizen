import React, {useState} from "react";
import {View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert} from "react-native";
import {useTranslation} from "react-i18next";
import {useAuth} from "../contexts/AuthContext";
import {UsernameEditModal} from "../components/UsernameEditModal";
import {Language} from "../types";

export const ProfileScreen: React.FC = () => {
  const {t, i18n} = useTranslation();
  const {user, signOut, refreshUser} = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const handleLanguageChange = async (lang: Language) => {
    await i18n.changeLanguage(lang);
    // In a real app, you would also update the user's language preference in Firestore
  };

  const handleEditUsername = () => {
    setIsEditModalVisible(true);
  };

  const handleUsernameChangeSuccess = async (_newUsername: string) => {
    await refreshUser();
  };

  const handleSignOut = () => {
    Alert.alert(
      t("profile.signOutConfirmTitle", "Confirm Sign Out"),
      t("profile.signOutConfirmMessage", "Are you sure you want to sign out?"),
      [
        {
          text: t("profile.signOutCancel", "Cancel"),
          style: "cancel",
        },
        {
          text: t("profile.signOutConfirm", "Sign Out"),
          style: "destructive",
          onPress: async () => {
            try {
              setIsSigningOut(true);
              await signOut();
            } catch (error) {
              console.error("Sign out error:", error);
              Alert.alert(
                t("common.error", "Error"),
                t("profile.signOutError", "Failed to sign out. Please try again.")
              );
            } finally {
              setIsSigningOut(false);
            }
          },
        },
      ]
    );
  };

  const currentLanguage = (user?.language || i18n.language) as Language;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("profile.title", "Profile")}</Text>
      </View>

      <View style={styles.content}>
        {/* Username Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("profile.username", "Username")}</Text>
          <View style={styles.usernameContainer}>
            <Text style={styles.username}>{user?.username || "Not available"}</Text>
            <TouchableOpacity style={styles.editButton} onPress={handleEditUsername}>
              <Text style={styles.editButtonText}>{t("profile.edit", "Edit")}</Text>
            </TouchableOpacity>
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

        {/* Sign Out Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.signOutButton, isSigningOut && styles.signOutButtonDisabled]}
            onPress={handleSignOut}
            disabled={isSigningOut}
          >
            <Text style={styles.signOutButtonText}>
              {isSigningOut ? t("common.loading", "Loading...") : t("profile.signOut", "Sign Out")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Username Edit Modal */}
      <UsernameEditModal
        visible={isEditModalVisible}
        currentUsername={user?.username || ""}
        userId={user?.id || ""}
        onClose={() => setIsEditModalVisible(false)}
        onSuccess={handleUsernameChangeSuccess}
      />
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
  usernameContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  username: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
    flex: 1,
  },
  editButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
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
  signOutButton: {
    backgroundColor: "#ff3b30",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  signOutButtonDisabled: {
    backgroundColor: "#ff9999",
    opacity: 0.7,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
