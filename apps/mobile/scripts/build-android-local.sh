#!/bin/bash
set -e

echo "🚀 Building Android App for Local Development with Firebase Emulator"

# 1. Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist android/app/src/main/assets/index.android.bundle

# 2. Build development bundle
echo "📦 Building development bundle..."
EXPO_PUBLIC_FIREBASE_ENV=emulator NODE_ENV=development npx expo export --platform android --dev

# 3. Copy bundle to Android assets
echo "📋 Copying bundle to Android assets..."
mkdir -p android/app/src/main/assets
BUNDLE_FILE=$(ls dist/_expo/static/js/android/index-*.js | head -1)
cp "$BUNDLE_FILE" android/app/src/main/assets/index.android.bundle

# 4. Build debug APK
echo "🔨 Building debug APK..."
cd android && ./gradlew assembleDebug --no-configuration-cache

# 5. Install on emulator
echo "📱 Installing on emulator..."
cd ..
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# 6. Launch app
echo "🚀 Launching app..."
adb shell am start -n dev.yoshiori.ichizen/.MainActivity

echo "✅ Done! App should be running on your emulator."