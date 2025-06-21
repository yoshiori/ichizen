/**
 * Username Validation Utilities Unit Tests
 *
 * These tests specifically target the separated debounce and validation logic
 * without any Firebase dependencies.
 */

import {
  validateUsernameFormat,
  DebounceHelper,
  UsernameValidator,
  UsernameValidationCallbacks,
} from "../src/utils/usernameValidation";

describe("validateUsernameFormat", () => {
  describe("valid usernames", () => {
    it("should accept alphanumeric usernames", () => {
      const result = validateUsernameFormat("testuser123");
      expect(result).toEqual({
        isValid: true,
        message: "Username format is valid",
      });
    });

    it("should accept usernames with underscores", () => {
      const result = validateUsernameFormat("test_user_123");
      expect(result).toEqual({
        isValid: true,
        message: "Username format is valid",
      });
    });

    it("should accept 3-character usernames", () => {
      const result = validateUsernameFormat("abc");
      expect(result).toEqual({
        isValid: true,
        message: "Username format is valid",
      });
    });

    it("should accept 20-character usernames", () => {
      const result = validateUsernameFormat("abcdefghij1234567890");
      expect(result).toEqual({
        isValid: true,
        message: "Username format is valid",
      });
    });

    it("should trim whitespace and accept valid username", () => {
      const result = validateUsernameFormat("  validuser  ");
      expect(result).toEqual({
        isValid: true,
        message: "Username format is valid",
      });
    });
  });

  describe("invalid usernames - length", () => {
    it("should reject usernames too short", () => {
      const result = validateUsernameFormat("ab");
      expect(result).toEqual({
        isValid: false,
        message: "Username must be at least 3 characters",
        messageKey: "profile.usernameValidation.tooShort",
      });
    });

    it("should reject usernames too long", () => {
      const result = validateUsernameFormat("abcdefghij1234567890x");
      expect(result).toEqual({
        isValid: false,
        message: "Username must be no more than 20 characters",
        messageKey: "profile.usernameValidation.tooLong",
      });
    });

    it("should reject empty string after trimming", () => {
      const result = validateUsernameFormat("   ");
      expect(result).toEqual({
        isValid: false,
        message: "Username must be at least 3 characters",
        messageKey: "profile.usernameValidation.tooShort",
      });
    });
  });

  describe("invalid usernames - characters", () => {
    it("should reject usernames with special characters", () => {
      const result = validateUsernameFormat("test@user");
      expect(result).toEqual({
        isValid: false,
        message: "Username can only contain letters, numbers, and underscores",
        messageKey: "profile.usernameValidation.invalidChars",
      });
    });

    it("should reject usernames with spaces", () => {
      const result = validateUsernameFormat("test user");
      expect(result).toEqual({
        isValid: false,
        message: "Username can only contain letters, numbers, and underscores",
        messageKey: "profile.usernameValidation.invalidChars",
      });
    });

    it("should reject usernames with hyphens", () => {
      const result = validateUsernameFormat("test-user");
      expect(result).toEqual({
        isValid: false,
        message: "Username can only contain letters, numbers, and underscores",
        messageKey: "profile.usernameValidation.invalidChars",
      });
    });

    it("should reject usernames starting with underscore", () => {
      const result = validateUsernameFormat("_testuser");
      expect(result).toEqual({
        isValid: false,
        message: "Username must start with a letter or number",
        messageKey: "profile.usernameValidation.mustStartWithAlphanumeric",
      });
    });
  });
});

describe("DebounceHelper", () => {
  let debounceHelper: DebounceHelper;

  beforeEach(() => {
    debounceHelper = new DebounceHelper();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should delay function execution", () => {
    const mockFn = jest.fn();
    const debouncedFn = debounceHelper.debounce(mockFn, 500);

    debouncedFn("test");
    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);
    expect(mockFn).toHaveBeenCalledWith("test");
  });

  it("should cancel previous call when new call is made", () => {
    const mockFn = jest.fn();
    const debouncedFn = debounceHelper.debounce(mockFn, 500);

    debouncedFn("first");
    jest.advanceTimersByTime(300);

    debouncedFn("second");
    jest.advanceTimersByTime(500);

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith("second");
  });

  it("should handle multiple arguments", () => {
    const mockFn = jest.fn();
    const debouncedFn = debounceHelper.debounce(mockFn, 100);

    debouncedFn("arg1", "arg2", 123);
    jest.advanceTimersByTime(100);

    expect(mockFn).toHaveBeenCalledWith("arg1", "arg2", 123);
  });

  it("should track pending state correctly", () => {
    const mockFn = jest.fn();
    const debouncedFn = debounceHelper.debounce(mockFn, 500);

    expect(debounceHelper.isPending()).toBe(false);

    debouncedFn("test");
    expect(debounceHelper.isPending()).toBe(true);

    jest.advanceTimersByTime(500);
    expect(debounceHelper.isPending()).toBe(false);
  });

  it("should cancel pending call", () => {
    const mockFn = jest.fn();
    const debouncedFn = debounceHelper.debounce(mockFn, 500);

    debouncedFn("test");
    expect(debounceHelper.isPending()).toBe(true);

    debounceHelper.cancel();
    expect(debounceHelper.isPending()).toBe(false);

    jest.advanceTimersByTime(500);
    expect(mockFn).not.toHaveBeenCalled();
  });
});

describe("UsernameValidator", () => {
  let mockCallbacks: UsernameValidationCallbacks;
  let mockCheckAvailability: jest.Mock;
  let validator: UsernameValidator;

  beforeEach(() => {
    mockCallbacks = {
      onValidationStart: jest.fn(),
      onValidationComplete: jest.fn(),
      onAvailabilityCheckStart: jest.fn(),
      onAvailabilityCheckComplete: jest.fn(),
      onError: jest.fn(),
    };

    mockCheckAvailability = jest.fn();
    validator = new UsernameValidator("currentuser", mockCallbacks);

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("immediate validation scenarios", () => {
    it("should not validate empty string", () => {
      validator.validateUsername("", mockCheckAvailability);

      expect(mockCallbacks.onValidationStart).not.toHaveBeenCalled();
    });

    it("should not validate whitespace-only string", () => {
      validator.validateUsername("   ", mockCheckAvailability);

      expect(mockCallbacks.onValidationStart).not.toHaveBeenCalled();
    });

    it("should immediately reject invalid format", () => {
      validator.validateUsername("ab", mockCheckAvailability);

      expect(mockCallbacks.onValidationStart).toHaveBeenCalledWith("ab");
      expect(mockCallbacks.onValidationComplete).toHaveBeenCalledWith({
        isValid: false,
        message: "Username must be at least 3 characters",
        messageKey: "profile.usernameValidation.tooShort",
      });
      expect(mockCheckAvailability).not.toHaveBeenCalled();
    });

    it("should immediately accept unchanged username", () => {
      validator.validateUsername("currentuser", mockCheckAvailability);

      expect(mockCallbacks.onValidationStart).toHaveBeenCalledWith("currentuser");
      expect(mockCallbacks.onValidationComplete).toHaveBeenCalledWith({
        isValid: true,
        message: "Username unchanged",
      });
      expect(mockCheckAvailability).not.toHaveBeenCalled();
    });
  });

  describe("debounced availability check", () => {
    it("should perform availability check after delay", async () => {
      mockCheckAvailability.mockResolvedValue(true);

      validator.validateUsername("newuser", mockCheckAvailability, 500);

      expect(mockCallbacks.onValidationStart).toHaveBeenCalledWith("newuser");
      expect(mockCheckAvailability).not.toHaveBeenCalled();

      jest.advanceTimersByTime(500);
      await Promise.resolve(); // Wait for async operation

      expect(mockCallbacks.onAvailabilityCheckStart).toHaveBeenCalledWith("newuser");
      expect(mockCheckAvailability).toHaveBeenCalledWith("newuser");
      expect(mockCallbacks.onAvailabilityCheckComplete).toHaveBeenCalledWith("newuser", true);
      expect(mockCallbacks.onValidationComplete).toHaveBeenCalledWith({
        isValid: true,
        message: "✓ Username is available",
        messageKey: "profile.usernameValidation.available",
      });
    });

    it("should handle unavailable username", async () => {
      mockCheckAvailability.mockResolvedValue(false);

      validator.validateUsername("takenuser", mockCheckAvailability, 100);
      jest.advanceTimersByTime(100);
      await Promise.resolve();

      expect(mockCallbacks.onValidationComplete).toHaveBeenCalledWith({
        isValid: false,
        message: "Username is already taken",
        messageKey: "profile.usernameValidation.taken",
      });
    });

    it("should handle availability check error", async () => {
      const error = new Error("Network error");
      mockCheckAvailability.mockRejectedValue(error);

      validator.validateUsername("erroruser", mockCheckAvailability, 100);
      jest.advanceTimersByTime(100);
      await Promise.resolve();

      expect(mockCallbacks.onError).toHaveBeenCalledWith(error);
    });

    it("should convert non-Error objects to Error", async () => {
      mockCheckAvailability.mockRejectedValue("string error");

      validator.validateUsername("erroruser", mockCheckAvailability, 100);
      jest.advanceTimersByTime(100);
      await Promise.resolve();

      expect(mockCallbacks.onError).toHaveBeenCalledWith(new Error("string error"));
    });
  });

  describe("debounce behavior", () => {
    it("should cancel previous validation when new one starts", async () => {
      mockCheckAvailability.mockResolvedValue(true);

      validator.validateUsername("firstuser", mockCheckAvailability, 500);
      jest.advanceTimersByTime(300);

      validator.validateUsername("seconduser", mockCheckAvailability, 500);
      jest.advanceTimersByTime(500);
      await Promise.resolve();

      expect(mockCheckAvailability).toHaveBeenCalledTimes(1);
      expect(mockCheckAvailability).toHaveBeenCalledWith("seconduser");
    });

    it("should respect custom debounce delay", async () => {
      mockCheckAvailability.mockResolvedValue(true);

      validator.validateUsername("testuser", mockCheckAvailability, 1000);

      jest.advanceTimersByTime(999);
      expect(mockCheckAvailability).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1);
      await Promise.resolve();
      expect(mockCheckAvailability).toHaveBeenCalled();
    });
  });

  describe("validator state management", () => {
    it("should track pending state", () => {
      validator.validateUsername("testuser", mockCheckAvailability, 500);
      expect(validator.isPending()).toBe(true);

      jest.advanceTimersByTime(500);
      expect(validator.isPending()).toBe(false);
    });

    it("should allow canceling validation", () => {
      mockCheckAvailability.mockResolvedValue(true);

      validator.validateUsername("testuser", mockCheckAvailability, 500);
      expect(validator.isPending()).toBe(true);

      validator.cancel();
      expect(validator.isPending()).toBe(false);

      jest.advanceTimersByTime(500);
      expect(mockCheckAvailability).not.toHaveBeenCalled();
    });

    it("should update current username", () => {
      validator.updateCurrentUsername("newcurrent");
      validator.validateUsername("newcurrent", mockCheckAvailability);

      expect(mockCallbacks.onValidationComplete).toHaveBeenCalledWith({
        isValid: true,
        message: "Username unchanged",
      });
    });
  });
});
