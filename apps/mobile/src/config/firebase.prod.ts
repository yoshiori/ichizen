/**
 * Firebase Production Environment Configuration (React Native)
 * React Native Firebase doesn't need manual initialization
 */

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

console.log('🚀 Connected to Firebase production environment (React Native)');

export const db = firestore();
export { auth };