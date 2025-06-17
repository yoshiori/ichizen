#!/bin/bash
set -e

echo "🚀 Starting Ichizen Android Development Environment"
echo "=================================================="

# プロジェクトルートに移動
cd "$(dirname "$0")/.."

# クリーンアップ関数
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

# Ctrl+C時のクリーンアップ設定
trap cleanup INT TERM EXIT

# 1. Firebaseエミュレータをバックグラウンドで起動
echo "🔥 Starting Firebase emulators..."
npx firebase emulators:start --only firestore,auth,functions > firebase-emulator.log 2>&1 &
FIREBASE_PID=$!
echo "  - Firebase emulators starting (PID: $FIREBASE_PID)"
echo "  - Logs: firebase-emulator.log"

# 2. Firebaseエミュレータの起動を待機
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

# 3. 利用可能なAndroidエミュレータを確認
echo "📱 Checking available Android emulators..."
EMULATORS=$(emulator -list-avds 2>/dev/null | head -5)
if [ -z "$EMULATORS" ]; then
    echo "❌ No Android emulators found. Please create one using Android Studio."
    exit 1
fi

echo "Available emulators:"
echo "$EMULATORS" | sed 's/^/  - /'

# 最初のエミュレータを選択
EMULATOR_NAME=$(echo "$EMULATORS" | head -1)
echo "🎯 Using emulator: $EMULATOR_NAME"

# 4. Androidエミュレータ起動
echo "📱 Starting Android emulator..."
emulator -avd "$EMULATOR_NAME" > emulator.log 2>&1 &
EMULATOR_PID=$!
echo "  - Android emulator starting (PID: $EMULATOR_PID)"
echo "  - Logs: emulator.log"

# 5. エミュレータが起動するまで待機
echo "⏳ Waiting for Android emulator to boot..."
adb wait-for-device
echo "✅ Android emulator ready!"

# 6. Expo Goを無効化（干渉防止）
echo "🔧 Disabling Expo Go to prevent interference..."
adb shell pm disable-user host.exp.exponent 2>/dev/null || echo "  - Expo Go not found (OK)"

# 7. アプリビルド・インストール・起動
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

# バックグラウンドプロセスの監視
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