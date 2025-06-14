import {registerRootComponent} from "expo";

// React Native Firebaseの初期化は自動で行われるため、ここでは何もしない
// google-services.jsonから自動的に設定が読み込まれる

import App from "./App";

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
