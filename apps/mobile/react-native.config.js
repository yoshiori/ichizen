module.exports = {
  dependencies: {
    // Disable autolinking for packages that cause issues
    "@react-native-firebase/app": {
      platforms: {
        ios: {
          // Use specific Firebase iOS SDK version
          configurations: {
            debug: {
              OTHER_LDFLAGS: "$(inherited) -ObjC",
            },
            release: {
              OTHER_LDFLAGS: "$(inherited) -ObjC",
            },
          },
        },
      },
    },
  },
};