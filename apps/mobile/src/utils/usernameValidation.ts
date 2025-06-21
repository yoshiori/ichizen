/**
 * Username validation utilities
 *
 * This module contains pure functions for username validation
 * that can be easily unit tested without Firebase dependencies.
 */

export interface ValidationResult {
  isValid: boolean;
  message: string;
  messageKey?: string;
}

/**
 * Validate username format and rules
 */
export const validateUsernameFormat = (username: string): ValidationResult => {
  // Remove whitespace
  const trimmed = username.trim();

  // Check length (3-20 characters)
  if (trimmed.length < 3) {
    return {
      isValid: false,
      message: "Username must be at least 3 characters",
      messageKey: "profile.usernameValidation.tooShort",
    };
  }

  if (trimmed.length > 20) {
    return {
      isValid: false,
      message: "Username must be no more than 20 characters",
      messageKey: "profile.usernameValidation.tooLong",
    };
  }

  // Check allowed characters (alphanumeric and underscore only)
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return {
      isValid: false,
      message: "Username can only contain letters, numbers, and underscores",
      messageKey: "profile.usernameValidation.invalidChars",
    };
  }

  // Check if it starts with a letter or number (not underscore)
  if (!/^[a-zA-Z0-9]/.test(trimmed)) {
    return {
      isValid: false,
      message: "Username must start with a letter or number",
      messageKey: "profile.usernameValidation.mustStartWithAlphanumeric",
    };
  }

  return {
    isValid: true,
    message: "Username format is valid",
  };
};

/**
 * Debounce utility for function calls
 */
export class DebounceHelper {
  private timeoutRef: NodeJS.Timeout | null = null;

  /**
   * Debounce a function call (supports both sync and async functions)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => {
      // Clear previous timeout
      if (this.timeoutRef) {
        clearTimeout(this.timeoutRef);
        this.timeoutRef = null;
      }

      // Set new timeout
      this.timeoutRef = setTimeout(() => {
        func(...args);
        this.timeoutRef = null;
      }, delay);
    };
  }

  /**
   * Cancel any pending debounced call
   */
  cancel(): void {
    if (this.timeoutRef) {
      clearTimeout(this.timeoutRef);
      this.timeoutRef = null;
    }
  }

  /**
   * Check if there's a pending debounced call
   */
  isPending(): boolean {
    return this.timeoutRef !== null;
  }
}

/**
 * Username validation state manager
 */
export interface UsernameValidationState {
  value: string;
  isValid: boolean;
  isChecking: boolean;
  message: string;
  messageKey?: string;
}

export interface UsernameValidationCallbacks {
  onValidationStart: (username: string) => void;
  onValidationComplete: (result: ValidationResult) => void;
  onAvailabilityCheckStart: (username: string) => void;
  onAvailabilityCheckComplete: (username: string, available: boolean) => void;
  onError: (error: Error) => void;
}

/**
 * Username validation manager with debouncing
 */
export class UsernameValidator {
  private debouncer = new DebounceHelper();
  private currentUsername: string;
  private callbacks: UsernameValidationCallbacks;

  constructor(currentUsername: string, callbacks: UsernameValidationCallbacks) {
    this.currentUsername = currentUsername;
    this.callbacks = callbacks;
  }

  /**
   * Validate username with debouncing
   */
  validateUsername = (
    newUsername: string,
    checkAvailability: (username: string) => Promise<boolean>,
    debounceDelay: number = 500
  ): void => {
    const trimmedUsername = newUsername.trim();

    // If empty, don't validate
    if (trimmedUsername.length === 0) {
      return;
    }

    // Start validation
    this.callbacks.onValidationStart(trimmedUsername);

    // Basic format validation (immediate)
    const formatResult = validateUsernameFormat(trimmedUsername);
    if (!formatResult.isValid) {
      this.callbacks.onValidationComplete(formatResult);
      return;
    }

    // If it's the same as current username, it's valid (immediate)
    if (trimmedUsername === this.currentUsername) {
      this.callbacks.onValidationComplete({
        isValid: true,
        message: "Username unchanged",
      });
      return;
    }

    // Debounce availability check
    const debouncedAvailabilityCheck = this.debouncer.debounce(async (username: string) => {
      try {
        this.callbacks.onAvailabilityCheckStart(username);
        const available = await checkAvailability(username);
        this.callbacks.onAvailabilityCheckComplete(username, available);

        this.callbacks.onValidationComplete({
          isValid: available,
          message: available ? "✓ Username is available" : "Username is already taken",
          messageKey: available ? "profile.usernameValidation.available" : "profile.usernameValidation.taken",
        });
      } catch (error) {
        this.callbacks.onError(error instanceof Error ? error : new Error(String(error)));
      }
    }, debounceDelay);

    debouncedAvailabilityCheck(trimmedUsername);
  };

  /**
   * Cancel any pending validation
   */
  cancel(): void {
    this.debouncer.cancel();
  }

  /**
   * Check if validation is pending
   */
  isPending(): boolean {
    return this.debouncer.isPending();
  }

  /**
   * Update current username
   */
  updateCurrentUsername(username: string): void {
    this.currentUsername = username;
  }
}
