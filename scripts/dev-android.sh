#!/bin/bash
set -e

echo "🚀 Starting Ichizen Android Development Environment"
echo "=================================================="

# Navigate to project root
cd "$(dirname "$0")/.."

# Cleanup function
cleanup() {
    echo ""
    echo "🧹 Cleaning up..."
    if [ ! -z "$FIREBASE_PID" ]; then
        echo "  - Stopping Firebase emulators..."
        kill $FIREBASE_PID 2>/dev/null || true
    fi
    if [ ! -z "$EMULATOR_PID" ]; then
        echo "  - Stopping Android emulator..."
        kill $EMULATOR_PID 2>/dev/null || true
    fi
    echo "✅ Cleanup completed"
    exit 0
}

# Setup cleanup handler for Ctrl+C
trap cleanup INT TERM EXIT

# 1. Check if Firebase emulators are already running
echo "🔥 Checking Firebase emulators..."
if curl -s http://localhost:8080 > /dev/null 2>&1; then
    echo "⚠️  Firebase emulators are already running!"
    echo "  - Please stop them first with: npx firebase emulators:stop"
    echo "  - Or kill the process using port 8080"
    exit 1
fi

# Start Firebase emulators in background
echo "🔥 Starting Firebase emulators..."
npx firebase emulators:start --only firestore,auth,functions > firebase-emulator.log 2>&1 &
FIREBASE_PID=$!
echo "  - Firebase emulators starting (PID: $FIREBASE_PID)"
echo "  - Logs: firebase-emulator.log"

# 2. Wait for Firebase emulators to start
echo "⏳ Waiting for Firebase emulators..."
for i in {1..30}; do
    if curl -s http://localhost:8080 > /dev/null 2>&1; then
        echo "✅ Firebase emulators ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Firebase emulators failed to start"
        exit 1
    fi
    sleep 2
    echo "  - Attempt $i/30..."
done

# 3. Check available Android emulators
echo "📱 Checking available Android emulators..."
EMULATORS=$(emulator -list-avds 2>/dev/null | head -5)
if [ -z "$EMULATORS" ]; then
    echo "❌ No Android emulators found. Please create one using Android Studio."
    exit 1
fi

echo "Available emulators:"
echo "$EMULATORS" | sed 's/^/  - /'

# Select the first emulator
EMULATOR_NAME=$(echo "$EMULATORS" | head -1)
echo "🎯 Using emulator: $EMULATOR_NAME"

# 4. Start Android emulator
echo "📱 Starting Android emulator..."
emulator -avd "$EMULATOR_NAME" > emulator.log 2>&1 &
EMULATOR_PID=$!
echo "  - Android emulator starting (PID: $EMULATOR_PID)"
echo "  - Logs: emulator.log"

# 5. Wait for emulator to boot
echo "⏳ Waiting for Android emulator to boot..."
adb wait-for-device
echo "✅ Android emulator ready!"

# 6. Disable Expo Go to prevent interference
echo "🔧 Disabling Expo Go to prevent interference..."
adb shell pm disable-user host.exp.exponent 2>/dev/null || echo "  - Expo Go not found (OK)"

# 7. Build, install and launch app
echo "🔨 Building and installing Ichizen app..."
cd apps/mobile
if [ -f "./scripts/build-android-local.sh" ]; then
    ./scripts/build-android-local.sh
else
    echo "❌ Build script not found: ./scripts/build-android-local.sh"
    exit 1
fi

echo ""
echo "🎉 Development environment ready!"
echo "================================="
echo "📱 Android emulator: $EMULATOR_NAME"
echo "🔥 Firebase UI: http://127.0.0.1:4002/"
echo "📊 Firestore: http://localhost:8080"
echo "🔐 Auth: http://localhost:9098"
echo "⚙️  Functions: http://localhost:5001"
echo ""
echo "📝 Logs:"
echo "  - Firebase: firebase-emulator.log"
echo "  - Emulator: emulator.log"
echo ""
echo "Press Ctrl+C to stop all services"
echo "================================="

# Monitor background processes
while true; do
    # Firebaseエミュレータが生きているかチェック
    if ! kill -0 $FIREBASE_PID 2>/dev/null; then
        echo "❌ Firebase emulators stopped unexpectedly"
        exit 1
    fi
    
    # Androidエミュレータが生きているかチェック
    if ! kill -0 $EMULATOR_PID 2>/dev/null; then
        echo "❌ Android emulator stopped unexpectedly"
        exit 1
    fi
    
    sleep 5
done