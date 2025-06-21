import React, {useState, useEffect, useRef} from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {useTranslation} from "react-i18next";
import {isUsernameAvailable, changeUsername} from "../utils/username";
import {UsernameValidator} from "../utils/usernameValidation";

interface UsernameEditModalProps {
  visible: boolean;
  currentUsername: string;
  userId: string;
  onClose: () => void;
  onSuccess: (newUsername: string) => void;
}

export const UsernameEditModal: React.FC<UsernameEditModalProps> = ({
  visible,
  currentUsername,
  userId,
  onClose,
  onSuccess,
}) => {
  const {t} = useTranslation();
  const [newUsername, setNewUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [isValid, setIsValid] = useState(false);
  const validatorRef = useRef<UsernameValidator | null>(null);

  useEffect(() => {
    if (visible) {
      setNewUsername(currentUsername);
      setValidationMessage("");
      setIsValid(false);
      setIsCheckingAvailability(false);

      // Initialize validator
      validatorRef.current = new UsernameValidator(currentUsername, {
        onValidationStart: () => {
          // Validation started
        },
        onValidationComplete: (result) => {
          setValidationMessage(result.messageKey ? t(result.messageKey, result.message) : result.message);
          setIsValid(result.isValid);
        },
        onAvailabilityCheckStart: () => {
          setIsCheckingAvailability(true);
        },
        onAvailabilityCheckComplete: () => {
          setIsCheckingAvailability(false);
        },
        onError: (error) => {
          setIsCheckingAvailability(false);

          // Provide more specific error messages
          let errorMessage = t("profile.usernameValidation.checkError", "Error checking availability");
          if (error.message.includes("unavailable")) {
            errorMessage = t(
              "profile.usernameValidation.serviceUnavailable",
              "Service temporarily unavailable. Please try again."
            );
          } else if (error.message.includes("network") || error.message.includes("connection")) {
            errorMessage = t("profile.usernameValidation.networkError", "Network error. Please check your connection.");
          }

          setValidationMessage(errorMessage);
          setIsValid(false);
        },
      });
    } else {
      // Cancel validation when modal is closed
      if (validatorRef.current) {
        validatorRef.current.cancel();
      }
      setIsCheckingAvailability(false);
      setValidationMessage("");
      setIsValid(false);
    }
  }, [visible, currentUsername, t]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (validatorRef.current) {
        validatorRef.current.cancel();
      }
    };
  }, []);

  const handleUsernameChange = (text: string) => {
    setNewUsername(text);

    // Clear any existing state
    setValidationMessage("");
    setIsValid(false);
    setIsCheckingAvailability(false);

    // Use the new validator
    if (validatorRef.current) {
      validatorRef.current.validateUsername(text, isUsernameAvailable, 500);
    }
  };

  const handleSave = async () => {
    const trimmedUsername = newUsername.trim();

    if (!isValid) {
      Alert.alert(
        t("common.error", "Error"),
        t("profile.usernameValidation.fixErrors", "Please fix validation errors before saving")
      );
      return;
    }

    if (trimmedUsername === currentUsername) {
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      await changeUsername(userId, trimmedUsername);

      onSuccess(trimmedUsername);
      onClose();
      Alert.alert(t("common.success", "Success"), t("profile.usernameChangeSuccess", "Username changed successfully"));
    } catch (error) {
      let errorMessage = t("profile.usernameChangeError", "Failed to change username");

      if (error instanceof Error) {
        if (error.message.includes("Username already taken")) {
          errorMessage = t("profile.usernameValidation.taken", "Username is already taken");
        } else if (error.message.includes("User not found")) {
          errorMessage = t("profile.userNotFound", "User not found");
        }
      }

      Alert.alert(t("common.error", "Error"), errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getValidationStyle = () => {
    if (!validationMessage) return styles.validationMessage;
    if (isValid) return [styles.validationMessage, styles.validationSuccess];
    return [styles.validationMessage, styles.validationError];
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>{t("profile.editUsername", "Edit Username")}</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t("profile.newUsername", "New Username")}</Text>
              <TextInput
                style={styles.input}
                value={newUsername}
                onChangeText={handleUsernameChange}
                placeholder={t("profile.enterUsername", "Enter username")}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                maxLength={20}
              />

              <View style={styles.validationContainer}>
                {isCheckingAvailability ? (
                  <View style={styles.checkingContainer}>
                    <ActivityIndicator size="small" color="#007AFF" />
                    <Text style={styles.checkingText}>
                      {t("profile.checkingAvailability", "Checking availability...")}
                    </Text>
                  </View>
                ) : validationMessage ? (
                  <Text style={getValidationStyle()}>{validationMessage}</Text>
                ) : null}
              </View>
            </View>

            <View style={styles.helpText}>
              <Text style={styles.helpTitle}>{t("profile.usernameRules.title", "Username Rules:")}</Text>
              <Text style={styles.helpRule}>• {t("profile.usernameRules.length", "3-20 characters")}</Text>
              <Text style={styles.helpRule}>
                • {t("profile.usernameRules.chars", "Letters, numbers, and underscores only")}
              </Text>
              <Text style={styles.helpRule}>
                • {t("profile.usernameRules.start", "Must start with letter or number")}
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={isLoading}>
                <Text style={styles.cancelButtonText}>{t("common.cancel", "Cancel")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, (!isValid || isLoading) && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={!isValid || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>{t("common.save", "Save")}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  validationContainer: {
    minHeight: 24,
    marginTop: 8,
  },
  validationMessage: {
    fontSize: 14,
    color: "#666",
  },
  validationSuccess: {
    color: "#4CAF50",
  },
  validationError: {
    color: "#f44336",
  },
  checkingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkingText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  helpText: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  helpRule: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  saveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
});
