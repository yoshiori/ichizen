// React Native Firebase configuration
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// React Native Firebase doesn't need manual initialization like Web Firebase
// It uses google-services.json for configuration

console.log('🚀 Connected to Firebase (React Native Firebase)');

export { auth };
export const db = firestore();