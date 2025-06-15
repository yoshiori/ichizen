// iOS-specific configuration for React Native Firebase
module.exports = {
  // Enable modular headers globally for Firebase compatibility
  modular_headers_for_pods: [
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
  ],
};
