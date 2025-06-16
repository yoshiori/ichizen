import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as RNLocalize from "react-native-localize";

import ja from "./locales/ja.json";
import en from "./locales/en.json";

// Detect language synchronously to avoid Suspense issues
const detectLanguageSync = (): string => {
  try {
    const bestLanguage = RNLocalize.findBestLanguageTag(["en", "ja"]);
    return bestLanguage?.languageTag || "en";
  } catch (error) {
    console.log("Error detecting language", error);
    return "en";
  }
};

// Initialize i18n synchronously
i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  lng: detectLanguageSync(), // Set language synchronously
  resources: {
    en: {
      translation: en,
    },
    ja: {
      translation: ja,
    },
  },
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

// Asynchronously load persisted language and update
const loadPersistedLanguage = async () => {
  try {
    const persistedLanguage = await AsyncStorage.getItem("user-language");
    if (persistedLanguage && persistedLanguage !== i18n.language) {
      await i18n.changeLanguage(persistedLanguage);
    }
  } catch (error) {
    console.log("Error loading persisted language", error);
  }
};

// Load persisted language after initialization
loadPersistedLanguage();

// Function to save language preference
export const saveLanguagePreference = async (language: string) => {
  try {
    await AsyncStorage.setItem("user-language", language);
    await i18n.changeLanguage(language);
  } catch (error) {
    console.log("Error saving language preference", error);
  }
};

export default i18n;
