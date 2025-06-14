import { useState, useCallback } from 'react';

interface UseFeedbackManagerReturn {
  showFeedback: boolean;
  isLoading: boolean;
  showFeedbackWithDelay: () => void;
  hideFeedback: () => void;
  setLoading: (loading: boolean) => void;
}

export const useFeedbackManager = (): UseFeedbackManagerReturn => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const showFeedbackWithDelay = useCallback(() => {
    setShowFeedback(true);
    // Auto-hide feedback after 3 seconds
    setTimeout(() => {
      setShowFeedback(false);
    }, 3000);
  }, []);

  const hideFeedback = useCallback(() => {
    setShowFeedback(false);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  return {
    showFeedback,
    isLoading,
    showFeedbackWithDelay,
    hideFeedback,
    setLoading
  };
};