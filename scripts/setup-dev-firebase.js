#!/usr/bin/env node

/**
 * Setup Firebase configuration for local emulator development
 * Creates google-services.json with dummy values for Firebase emulator testing
 * 
 * IMPORTANT: This configuration is for EMULATOR USE ONLY.
 * The values are dummy/fake except for the package name which must match your app.
 * When using emulators, the actual connection is configured via useEmulator() calls.
 */

const fs = require("fs");
const path = require("path");

console.log("🔧 Setting up Firebase configuration for local emulator development...");

const mobileDir = path.join(__dirname, "..", "apps", "mobile");

// Dummy Firebase configuration for emulator development
// These are fake values that satisfy the google-services.json format requirements
// Only the package_name needs to match your actual app's package name
const googleServicesJson = {
  project_info: {
    project_number: "123456789012",
    project_id: "ichizen-emulator-dev",
    firebase_url: "https://ichizen-emulator-dev.firebaseio.com",
    storage_bucket: "ichizen-emulator-dev.appspot.com"
  },
  client: [
    {
      client_info: {
        mobilesdk_app_id: "1:123456789012:android:abcdef1234567890abcdef",
        android_client_info: {
          package_name: "dev.yoshiori.ichizen"  // This MUST match your app's actual package name
        }
      },
      oauth_client: [],
      api_key: [
        {
          current_key: "AIzaSyA_DummyApiKey_ForEmulatorOnly"
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

// Check if files already exist
const androidAppDir = path.join(mobileDir, "android", "app");
const googleServicesPath = path.join(androidAppDir, "google-services.json");

if (fs.existsSync(googleServicesPath)) {
  console.log("⚠️  google-services.json already exists");
  console.log("   If you want to regenerate it, please delete the existing file first.");
  console.log("   Location:", googleServicesPath);
  return;
}

// Ensure directories exist
if (!fs.existsSync(androidAppDir)) {
  fs.mkdirSync(androidAppDir, { recursive: true });
}

// Write google-services.json for Android
fs.writeFileSync(googleServicesPath, JSON.stringify(googleServicesJson, null, 2));
console.log("✅ Created google-services.json for Android development");

console.log(`📂 File location: ${googleServicesPath}`);
console.log("");
console.log("ℹ️  Note: This file contains DUMMY Firebase configuration for emulator use only.");
console.log("   The actual emulator connection is configured via useEmulator() calls");
console.log("   in the app code (connecting to 10.0.2.2 for Android emulator).");
console.log("");
console.log("⚠️  IMPORTANT: This configuration is NOT for production use!");
console.log("   For production builds, use the real google-services.json from Firebase Console.");
console.log("");
console.log("✨ Firebase emulator development setup completed!");
console.log("🚀 You can now run: npm run dev:android");