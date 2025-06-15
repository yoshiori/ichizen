const {withDangerousMod, withPlugins} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

function modifyPodfile(podfileContent) {
  // Add use_modular_headers! for Firebase pods
  const firebasePods = [
    "Firebase",
    "FirebaseCore",
    "FirebaseCoreInternal",
    "FirebaseFirestore",
    "FirebaseFirestoreInternal",
    "FirebaseFunctions",
    "FirebaseAuth",
    "FirebaseMessaging",
    "GoogleUtilities",
    "FirebaseCoreExtension",
    "FirebaseAppCheckInterop",
    "FirebaseAuthInterop",
    "FirebaseMessagingInterop",
  ];

  // Check if use_frameworks! is already set to static
  if (!podfileContent.includes("use_frameworks! :linkage => :static")) {
    // Replace use_frameworks! with static linkage
    podfileContent = podfileContent.replace(/use_frameworks!/g, "use_frameworks! :linkage => :static");
  }

  // Add modular headers for specific pods if not already present
  if (!podfileContent.includes("# Firebase modular headers")) {
    const modularHeadersSection = `
  # Firebase modular headers configuration
  pod 'Firebase', :modular_headers => true
  pod 'FirebaseCore', :modular_headers => true
  pod 'GoogleUtilities', :modular_headers => true
  pod 'FirebaseCoreInternal', :modular_headers => true
  pod 'FirebaseCoreExtension', :modular_headers => true
  pod 'FirebaseAppCheckInterop', :modular_headers => true
  pod 'FirebaseAuthInterop', :modular_headers => true
  pod 'FirebaseMessagingInterop', :modular_headers => true
`;

    // Find target 'ichizen' and add after it
    const targetRegex = /target\s+['"]ichizen['"]\s+do/;
    if (targetRegex.test(podfileContent)) {
      podfileContent = podfileContent.replace(targetRegex, `target 'ichizen' do${modularHeadersSection}`);
    }
  }

  return podfileContent;
}

const withFirebaseIOS = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, "Podfile");

      if (fs.existsSync(podfilePath)) {
        let podfileContent = fs.readFileSync(podfilePath, "utf8");
        podfileContent = modifyPodfile(podfileContent);
        fs.writeFileSync(podfilePath, podfileContent);
      }

      return config;
    },
  ]);
};

module.exports = withFirebaseIOS;
