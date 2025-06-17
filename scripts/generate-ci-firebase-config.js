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
  firebaseConfig: {
    apiKey: "dummy-api-key-for-ci", // pragma: allowlist secret
    authDomain: "dummy-project.firebaseapp.com",
    projectId: "dummy-project",
    storageBucket: "dummy-project.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456",
  }
};

// google-services.json for Android
const googleServicesJson = {
  project_info: {
    project_number: "123456789012",
    project_id: "dummy-project",
    storage_bucket: "dummy-project.appspot.com"
  },
  client: [
    {
      client_info: {
        mobilesdk_app_id: "1:123456789012:android:abcdef123456",
        android_client_info: {
          package_name: "dev.yoshiori.ichizen"
        }
      },
      oauth_client: [],
      api_key: [
        {
          current_key: "dummy-api-key-for-ci" // pragma: allowlist secret
        }
      ],
      services: {
        appinvite_service: {
          other_platform_oauth_client: []
        }
      }
    }
  ],
  configuration_version: "1"
};

// GoogleService-Info.plist for iOS
const googleServicePlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CLIENT_ID</key>
    <string>123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com</string>
    <key>REVERSED_CLIENT_ID</key>
    <string>com.googleusercontent.apps.123456789012-abcdefghijklmnopqrstuvwxyz123456</string>
    <key>API_KEY</key>
    <string>dummy-api-key-for-ci</string> <!-- pragma: allowlist secret -->
    <key>GCM_SENDER_ID</key>
    <string>123456789012</string>
    <key>PLIST_VERSION</key>
    <string>1</string>
    <key>BUNDLE_ID</key>
    <string>dev.yoshiori.ichizen</string>
    <key>PROJECT_ID</key>
    <string>dummy-project</string>
    <key>STORAGE_BUCKET</key>
    <string>dummy-project.appspot.com</string>
    <key>IS_ADS_ENABLED</key>
    <false/>
    <key>IS_ANALYTICS_ENABLED</key>
    <false/>
    <key>IS_APPINVITE_ENABLED</key>
    <true/>
    <key>IS_GCM_ENABLED</key>
    <true/>
    <key>IS_SIGNIN_ENABLED</key>
    <true/>
    <key>GOOGLE_APP_ID</key>
    <string>1:123456789012:ios:abcdef123456</string>
</dict>
</plist>`;

// Write google-services.json (both in root and android/app/ directory)
fs.writeFileSync(
  path.join(mobileDir, "google-services.json"),
  JSON.stringify(googleServicesJson, null, 2)
);
console.log("✅ Created google-services.json in mobile root");

const androidDir = path.join(mobileDir, "android", "app");
if (!fs.existsSync(androidDir)) {
  fs.mkdirSync(androidDir, { recursive: true });
}
fs.writeFileSync(
  path.join(androidDir, "google-services.json"),
  JSON.stringify(googleServicesJson, null, 2)
);
console.log("✅ Created google-services.json for Android");

// Write GoogleService-Info.plist (both in root and ios/ directory)
fs.writeFileSync(
  path.join(mobileDir, "GoogleService-Info.plist"),
  googleServicePlist
);
console.log("✅ Created GoogleService-Info.plist in mobile root");

const iosDir = path.join(mobileDir, "ios");
if (!fs.existsSync(iosDir)) {
  fs.mkdirSync(iosDir, { recursive: true });
}
fs.writeFileSync(
  path.join(iosDir, "GoogleService-Info.plist"),
  googleServicePlist
);
console.log("✅ Created GoogleService-Info.plist for iOS");

// Write .env file with dummy values
const envContent = `# CI Dummy Environment Variables
ENVIRONMENT=test
FIREBASE_API_KEY=dummy-api-key-for-ci # pragma: allowlist secret
FIREBASE_AUTH_DOMAIN=dummy-project.firebaseapp.com
FIREBASE_PROJECT_ID=dummy-project
FIREBASE_STORAGE_BUCKET=dummy-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:abcdef123456
FIREBASE_ENV=production
`;

fs.writeFileSync(path.join(mobileDir, ".env"), envContent);
console.log("✅ Created .env file with dummy values");

console.log("✨ Firebase CI configuration generated successfully!");