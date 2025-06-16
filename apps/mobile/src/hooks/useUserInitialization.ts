import {useState, useCallback, startTransition} from "react";
import {FirebaseAuthTypes} from "@react-native-firebase/auth";
import {initializeUser} from "../services/auth";
import {User} from "../types/firebase";

interface UseUserInitializationReturn {
  user: User | null;
  initError: string | null;
  initializeUserData: (firebaseUser: FirebaseAuthTypes.User) => Promise<void>;
  clearUser: () => void;
}

export const useUserInitialization = (): UseUserInitializationReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  const initializeUserData = useCallback(async (firebaseUser: FirebaseAuthTypes.User) => {
    try {
      const userData = await initializeUser(firebaseUser);
      startTransition(() => {
        setUser(userData);
        setInitError(null);
      });
    } catch (error) {
      console.error("User initialization error:", error);
      startTransition(() => {
        setUser(null);
        setInitError(error instanceof Error ? error.message : "User initialization failed");
      });
      throw error; // Re-throw to allow caller to handle
    }
  }, []);

  const clearUser = useCallback(() => {
    startTransition(() => {
      setUser(null);
      setInitError(null);
    });
  }, []);

  return {
    user,
    initError,
    initializeUserData,
    clearUser,
  };
};
