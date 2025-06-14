import {registerRootComponent} from "expo";

// Initialize Firebase - this is the truly modern way
import "@react-native-firebase/app";

import App from "./App";

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
