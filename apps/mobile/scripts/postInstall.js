#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// This script runs after npm install to prepare the project for builds
console.log("Running post-install script...");

// Create a Podfile patch for iOS
const podfilePatch = `
# React Native Firebase iOS configuration
# This must be added at the top of the Podfile

# Enable modular headers globally
use_modular_headers!

# Firebase pods that need modular headers
pod 'Firebase', :modular_headers => true
pod 'FirebaseCore', :modular_headers => true
pod 'GoogleUtilities', :modular_headers => true
`;

const patchFilePath = path.join(__dirname, "..", "ios-podfile-patch.txt");
fs.writeFileSync(patchFilePath, podfilePatch.trim());

console.log("Created iOS Podfile patch file");
console.log("Post-install script completed.");
