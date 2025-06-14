// React Native Firebase v22 - Modular API with Zero Configuration
// Firebase automatically initializes from google-services.json
// No manual initialization needed - that's the modern way!

import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

console.log("🚀 React Native Firebase v22 - Zero Config Auto-Initialization");

// Export individual services (modular API is preferred for Functions)
export {auth, firestore};

// Legacy compatibility for existing code
export const db = firestore();

console.log("✅ Firebase v22 Ready - Fully Automatic!");
