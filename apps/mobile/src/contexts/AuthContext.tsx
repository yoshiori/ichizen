import React, {createContext, useContext, useEffect, useState, ReactNode, startTransition} from "react";
import {FirebaseAuthTypes} from "@react-native-firebase/auth";
import {InteractionManager} from "react-native";
import {onAuthStateChange, signInAnonymous, signInWithGoogle, signInWithApple, signOut} from "../services/auth";
import {User} from "../types/firebase";
import {useFCMSetup} from "../hooks/useFCMSetup";
import {useUserInitialization} from "../hooks/useUserInitialization";

export type AuthMethod = "google" | "apple" | "anonymous";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseAuthTypes.User | null;
  loading: boolean;
  initError: string | null;
  isSigningIn: boolean;
  signingInMethod: AuthMethod | null;
  signIn: (method?: AuthMethod) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signingInMethod, setSigningInMethod] = useState<AuthMethod | null>(null);

  // Custom hooks for separated concerns
  const {user, initError, initializeUserData, clearUser} = useUserInitialization();
  const {setupFCMForUser} = useFCMSetup();

  const signIn = async (method: AuthMethod = "anonymous") => {
    try {
      setLoading(true);
      setIsSigningIn(true);
      setSigningInMethod(method);
      switch (method) {
        case "google":
          await signInWithGoogle();
          break;
        case "apple":
          await signInWithApple();
          break;
        case "anonymous":
        default:
          await signInAnonymous();
          break;
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setIsSigningIn(false); // Reset on error
      setSigningInMethod(null);
      throw error; // Re-throw to allow UI to handle specific errors
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut();
      // Auth state change will be handled by onAuthStateChange listener
      // which will clear user data and update loading state
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (firebaseUser) {
      await initializeUserData(firebaseUser);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Timeout to prevent infinite loading
    const initTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn("Firebase auth initialization timed out, proceeding without auth");
        startTransition(() => {
          setLoading(false);
          setAuthError("Firebase initialization timed out");
        });
      }
    }, 10000); // 10 second timeout

    let unsubscribe: (() => void) | null = null;

    const initializeAuth = async () => {
      try {
        console.log("🔥 Initializing Firebase auth...");

        unsubscribe = onAuthStateChange(async (firebaseUser) => {
          console.log("🔥 Auth state changed:", firebaseUser ? `User: ${firebaseUser.uid}` : "No user");
          if (!mounted) return;

          clearTimeout(initTimeout);

          startTransition(() => {
            setFirebaseUser(firebaseUser);
          });

          if (firebaseUser) {
            try {
              console.log("🔥 Initializing user data for:", firebaseUser.uid);
              await initializeUserData(firebaseUser);

              // Setup FCM after user is authenticated
              console.log("🔥 Setting up FCM for user:", firebaseUser.uid);
              await setupFCMForUser(firebaseUser.uid);
            } catch (error) {
              console.error("❌ User initialization error:", error);
              // Error state is handled by useUserInitialization hook
            }
          } else {
            console.log("🔥 Clearing user data");
            clearUser();
          }

          if (mounted) {
            console.log("🔥 Setting loading to false");
            startTransition(() => {
              setLoading(false);
            });
          }
        });
      } catch (error) {
        console.error("Firebase auth state change setup failed:", error);
        if (mounted) {
          startTransition(() => {
            setLoading(false);
            setAuthError(error instanceof Error ? error.message : "Auth setup failed");
          });
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      clearTimeout(initTimeout);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []); // Remove dependencies to prevent re-initialization

  // Auto-complete sign-in when user authentication and data initialization are complete
  useEffect(() => {
    if (user && !loading && isSigningIn) {
      // Use InteractionManager to complete sign-in after all animations/interactions finish
      const interaction = InteractionManager.runAfterInteractions(() => {
        setIsSigningIn(false);
        setSigningInMethod(null);
      });

      return () => interaction.cancel();
    }
  }, [user, loading, isSigningIn]);

  const value = {
    user,
    firebaseUser,
    loading,
    initError: authError || initError, // Combine auth errors and user init errors
    isSigningIn,
    signingInMethod,
    signIn,
    signOut: handleSignOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
