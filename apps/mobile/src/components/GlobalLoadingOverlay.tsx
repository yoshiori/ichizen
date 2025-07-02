import React from "react";
import {Modal, View, Text, ActivityIndicator, StyleSheet} from "react-native";
import {useTranslation} from "react-i18next";

interface GlobalLoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const GlobalLoadingOverlay: React.FC<GlobalLoadingOverlayProps> = ({visible, message}) => {
  const {t} = useTranslation();

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" testID="global-loading-overlay" style={styles.modal}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#007AFF" testID="global-loading-spinner" />
          <Text style={styles.message}>{message || t("common.loading", "Loading...")}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 160,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: "#333333",
    textAlign: "center",
    fontWeight: "500",
  },
});
