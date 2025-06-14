import { registerRootComponent } from 'expo';

// Firebase初期化（React Native Firebaseの場合）
import '@react-native-firebase/app';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);