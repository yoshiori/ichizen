import {auth} from "../config/firebase";
import {createUser, getUser} from "./firestore";
import {User} from "../types/firebase";
import {FirebaseAuthTypes} from "@react-native-firebase/auth";

export const signInWithGoogle = async (): Promise<FirebaseAuthTypes.User> => {
  // TODO: Implement Google Sign-in for React Native
  throw new Error("Google Sign-in not implemented yet");
};

export const signInWithApple = async (): Promise<FirebaseAuthTypes.User> => {
  // TODO: Implement Apple Sign-in for React Native
  throw new Error("Apple Sign-in not implemented yet");
};

export const signInAnonymous = async (): Promise<FirebaseAuthTypes.User> => {
  try {
    console.log("🔄 Starting anonymous sign-in...");
    const result = await auth.signInAnonymously();
    console.log("✅ Anonymous sign-in successful:", result.user?.uid);
    return result.user;
  } catch (error) {
    console.error("❌ Anonymous sign-in failed:", error);
    throw error;
  }
};

export const getCurrentUser = (): FirebaseAuthTypes.User | null => {
  return auth.currentUser;
};

export const onAuthStateChange = (callback: (user: FirebaseAuthTypes.User | null) => void) => {
  return auth.onAuthStateChanged(callback);
};

export const signOut = async (): Promise<void> => {
  try {
    console.log("🔄 Starting sign out...");
    await auth.signOut();
    console.log("✅ Sign out successful");
  } catch (error) {
    console.error("❌ Sign out failed:", error);
    throw error;
  }
};

export const initializeUser = async (firebaseUser: FirebaseAuthTypes.User): Promise<User> => {
  console.log("🔥 Initializing user:", firebaseUser.uid);
  try {
    // Add timeout for Firestore operations
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Firestore operation timeout")), 5000);
    });

    const userPromise = (async () => {
      let user = await getUser(firebaseUser.uid);

      if (!user) {
        console.log("🔥 User doesn't exist, creating new user");
        const userData: Omit<User, "id"> = {
          language: "ja",
          createdAt: new Date(),
          lastActiveAt: new Date(),
        };

        await createUser(firebaseUser.uid, userData);
        user = {id: firebaseUser.uid, ...userData};
      } else {
        console.log("🔥 User already exists");
      }

      return user;
    })();

    const user = (await Promise.race([userPromise, timeoutPromise])) as User;
    console.log("✅ User initialization completed");
    return user;
  } catch (error) {
    console.error("❌ User initialization failed, falling back to mock:", error);
    // Fallback to mock user if Firestore fails
    const mockUser: User = {
      id: firebaseUser.uid,
      language: "ja",
      createdAt: new Date(),
      lastActiveAt: new Date(),
    };
    console.log("✅ User initialization completed (fallback)");
    return mockUser;
  }
};
