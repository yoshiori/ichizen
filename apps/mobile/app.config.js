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
            extraPods: [
              {
                name: "FirebaseCore",
                configurations: ["Debug", "Release"],
                modular_headers: true,
              },
            ],
          },
          android: {
            minSdkVersion: 23,
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            buildToolsVersion: "34.0.0",
          },
        },
      ],
    ],
  },
};
