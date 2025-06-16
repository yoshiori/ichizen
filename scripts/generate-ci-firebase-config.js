#!/usr/bin/env node

/**
 * Generate dummy Firebase configuration files for CI/CD environments
 * Uses fake values since CI only needs to test compilation, not actual Firebase connectivity
 */

const fs = require("fs");
const path = require("path");

console.log("🔧 Generating dummy Firebase configuration for CI...");

const mobileDir = path.join(__dirname, "..", "apps", "mobile");

// Dummy Firebase configuration for CI
const dummyConfig = {
  apiKey: "AIzaSyDUMMY-CI-KEY-NOT-REAL-FOR-TESTING-ONLY",
  projectId: "dummy-ci-project",
  storageBucket: "dummy-ci-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:android:dummy-ci-app-id",
  authDomain: "dummy-ci-project.firebaseapp.com",
};

// Generate google-services.json for Android
const androidConfig = {
  project_info: {
    project_number: dummyConfig.messagingSenderId,
    project_id: dummyConfig.projectId,
    storage_bucket: dummyConfig.storageBucket,
  },
  client: [
    {
      client_info: {
        mobilesdk_app_id: dummyConfig.appId,
        android_client_info: {
          package_name: "dev.yoshiori.ichizen",
        },
      },
      oauth_client: [],
      api_key: [
        {
          current_key: dummyConfig.apiKey,
        },
      ],
      services: {
        appinvite_service: {
          other_platform_oauth_client: [],
        },
      },
    },
  ],
  configuration_version: "1",
};

// Generate GoogleService-Info.plist for iOS
const iosConfig = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>API_KEY</key>
	<string>${dummyConfig.apiKey}</string>
	<key>GCM_SENDER_ID</key>
	<string>${dummyConfig.messagingSenderId}</string>
	<key>PLIST_VERSION</key>
	<string>1</string>
	<key>BUNDLE_ID</key>
	<string>dev.yoshiori.ichizen</string>
	<key>PROJECT_ID</key>
	<string>${dummyConfig.projectId}</string>
	<key>STORAGE_BUCKET</key>
	<string>${dummyConfig.storageBucket}</string>
	<key>IS_ADS_ENABLED</key>
	<false></false>
	<key>IS_ANALYTICS_ENABLED</key>
	<false></false>
	<key>IS_APPINVITE_ENABLED</key>
	<true></true>
	<key>IS_GCM_ENABLED</key>
	<true></true>
	<key>IS_SIGNIN_ENABLED</key>
	<true></true>
	<key>GOOGLE_APP_ID</key>
	<string>1:123456789012:ios:dummy-ci-app-id</string>
</dict>
</plist>`;

// Write configuration files
try {
  // Android configuration
  const androidPath = path.join(mobileDir, "google-services.json");
  fs.writeFileSync(androidPath, JSON.stringify(androidConfig, null, 2));
  console.log("✅ Generated dummy google-services.json");

  // iOS configuration
  const iosPath = path.join(mobileDir, "GoogleService-Info.plist");
  fs.writeFileSync(iosPath, iosConfig);
  console.log("✅ Generated dummy GoogleService-Info.plist");

  console.log("🔥 Dummy Firebase configuration files generated for CI");
  console.log("⚠️  These are FAKE values for CI testing only - do not use in production!");
} catch (error) {
  console.error("❌ Failed to generate dummy Firebase configuration:", error.message);
  process.exit(1);
}
