export default {
  expo: {
    name: "ichizen",
    slug: "ichizen",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: false,
    scheme: "ichizen",
    experiments: {
      typedRoutes: false,
    },
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "dev.yoshiori.ichizen",
      googleServicesFile: "./GoogleService-Info.plist",
      infoPlist: {
        CFBundleURLTypes: [
          {
            CFBundleURLName: "google-signin",
            CFBundleURLSchemes: ["YOUR_REVERSED_CLIENT_ID"],
          },
        ],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      package: "dev.yoshiori.ichizen",
      googleServicesFile: "./google-services.json",
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro",
    },
    owner: "yoshiori",
    extra: {
      eas: {
        projectId: "8322179b-c60b-4f9c-973b-abd30524b1cc",
      },
    },
    plugins: [
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
            deploymentTarget: "15.1",
          },
          android: {
            minSdkVersion: 24,
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            buildToolsVersion: "35.0.0",
          },
        },
      ],
      ["@react-native-firebase/app"],
    ],
  },
};
