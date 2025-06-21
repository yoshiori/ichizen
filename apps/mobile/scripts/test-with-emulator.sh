#!/bin/bash

# Firebase Emulator Test Script
# This script ensures Firebase emulators are running and executes tests against them.
# Tests REQUIRE emulators to be running - they will fail if emulators are not available.

set -e

echo "🚀 Firebase Emulator Test Environment"
echo "Tests require Firebase emulators to be running for reliable testing."

# Check if Firebase CLI is available
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo "🧹 Cleaning up Firebase emulators..."
    if [ ! -z "$EMULATOR_PID" ]; then
        kill $EMULATOR_PID 2>/dev/null || true
        wait $EMULATOR_PID 2>/dev/null || true
    fi
    echo "✅ Cleanup complete"
}

# Set trap to cleanup on script exit
trap cleanup EXIT

# Start Firebase emulators in background
echo "🔥 Starting Firebase emulators..."
firebase emulators:start --only firestore --project demo-ichizen-test &
EMULATOR_PID=$!

# Wait for emulators to be ready
echo "⏳ Waiting for emulators to start..."

# Wait with retries for emulator to start
MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:8080 > /dev/null 2>&1; then
        echo "✅ Firestore emulator is responding on port 8080"
        break
    fi
    echo "⏳ Waiting for Firestore emulator... (attempt $((RETRY_COUNT + 1))/$MAX_RETRIES)"
    sleep 2
    RETRY_COUNT=$((RETRY_COUNT + 1))
done

# Final check
echo "🧪 Verifying emulator status..."
if ! curl -s http://localhost:8080 > /dev/null 2>&1; then
    echo "❌ Firestore emulator failed to start on port 8080 after $MAX_RETRIES attempts"
    exit 1
fi

echo "✅ Firebase emulators are running and ready"

# Set environment variables for tests
export FIRESTORE_EMULATOR_HOST=localhost:8080
export NODE_ENV=test

echo "🧪 Running all tests with Firebase emulators..."
echo "Includes: emulator tests + isolated logic tests"

# Run all tests with appropriate options
if [ "$1" = "--watch" ]; then
    echo "🔍 Watch mode enabled"
    jest --watch
else
    echo "🧪 Running all tests"
    jest
fi

echo "✅ All tests completed successfully"