/**
 * Date formatting utilities with locale support
 */

import {Language} from "../types";

/**
 * Format a date to locale-specific string
 * Always returns consistent format regardless of environment
 */
export const formatDate = (date: Date, locale: string = "ja-JP"): string => {
  try {
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  } catch {
    // Fallback to ISO format if locale is not supported
    return date.toISOString().split("T")[0];
  }
};

/**
 * Format date based on user language preference
 */
export const formatDateByLanguage = (date: Date, language: Language): string => {
  const locale = language === "en" ? "en-US" : "ja-JP";
  return formatDate(date, locale);
};

/**
 * Format date for display in Japanese format
 */
export const formatDateJP = (date: Date): string => {
  return formatDate(date, "ja-JP");
};

/**
 * Format date for display in US English format
 */
export const formatDateUS = (date: Date): string => {
  return formatDate(date, "en-US");
};

/**
 * Get month boundaries for a given date
 * Returns consistent UTC dates regardless of timezone
 */
export const getMonthBoundaries = (date: Date): {start: string; end: string} => {
  const year = date.getFullYear();
  const month = date.getMonth();

  // Always use UTC to ensure consistency across environments
  const startDate = new Date(Date.UTC(year, month, 1));
  const endDate = new Date(Date.UTC(year, month + 1, 0)); // Last day of month

  return {
    start: startDate.toISOString().split("T")[0],
    end: endDate.toISOString().split("T")[0],
  };
};

/**
 * Format month year for display
 */
export const formatMonthYear = (date: Date, locale: string = "ja-JP"): string => {
  try {
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
    });
  } catch {
    // Fallback for unsupported locales
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return locale === "ja-JP" ? `${year}年${month}月` : `${year}/${month}`;
  }
};

/**
 * Format month year based on user language preference
 */
export const formatMonthYearByLanguage = (date: Date, language: Language): string => {
  const locale = language === "en" ? "en-US" : "ja-JP";
  return formatMonthYear(date, locale);
};
