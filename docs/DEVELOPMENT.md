# Development Guide

## 🚀 Getting Started

### Prerequisites

- **Node.js 20+** and **npm 10+**
- **Android Studio** (for Android development)
- **Xcode** (for iOS development)
- **Firebase CLI** (`npm install -g firebase-tools`)

### Environment Setup

```bash
# Clone repository
git clone https://github.com/yoshiori/ichizen.git
cd ichizen

# Install all dependencies
npm install

# Setup Firebase emulators
npx firebase emulators:start

# Setup initial development data
node scripts/setup-initial-data.js
```

## 🛠 Development Commands

### Turborepo Commands

All commands leverage Turborepo's intelligent caching and parallel execution:

```bash
# Development
npm run functions:dev       # Cloud Functions development only

# ⚠️ モバイルアプリ: Metro/Expo開発サーバーは使用不可
# npm run mobile:dev  ← Firebase SDK使用のため動作しません
# 代わりにネイティブビルドを使用してください

# Building
npm run build               # Build all packages (parallel)
npm run mobile:build        # Mobile build only
npm run functions:build     # Functions build only

# Testing
npm run test                # Run all tests (148/151 passing)
npm run mobile:test         # Mobile tests only
npm run functions:test      # Functions tests only

# Quality Assurance
npm run lint                # Lint all packages
npm run typecheck          # TypeScript validation all packages
npm run format              # Format code with Prettier

# Mobile Platform Development
npm run android             # Android: prebuild → expo run:android
npm run ios                 # iOS: prebuild → expo run:ios

# Backend
npm run functions:deploy    # Deploy functions (96ms with cache)
```

### Performance Notes

- **Turborepo Cache**: Commands complete in ~96ms when cached
- **Parallel Execution**: Multiple packages build simultaneously
- **Smart Dependencies**: Only rebuild changed packages

## 📱 Mobile Development

### ⚠️ 重要: Firebase React Native SDK使用時の制約

このプロジェクトは **React Native Firebase SDK** を使用しているため、以下の開発方法は**使用できません**:

❌ **制限事項:**

- **Expo Go**: ネイティブ依存関係のため動作不可
- **Metro サーバー**: `expo start` コマンドは機能しない
- **ブラウザ開発**: `expo start --web` は使用不可
- **ホットリロード**: コード変更は再ビルドが必要

### 正しい開発フロー

Firebase React Native SDKを使用するプロジェクトでは、**ネイティブビルド**が必須です:

```bash
# 1. ネイティブビルド作成
cd apps/mobile
npm run mobile:android:build    # Android APK作成

# 2. エミュレータにインストール
adb install android/app/build/outputs/apk/debug/app-debug.apk

# 3. アプリ起動
adb shell am start -n dev.yoshiori.ichizen/.MainActivity

# 4. コード変更時は再ビルドが必要
# (変更後は手順1-3を繰り返し)
```

### Platform Testing

```bash
# Android エミュレータ起動
emulator -avd Medium_Phone_API_36.0  # Android emulatorを起動

# Android APK ビルド & テスト
npm run mobile:android:build        # デバッグAPK作成
adb install android/app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n dev.yoshiori.ichizen/.MainActivity

# iOS (macOS のみ)
npm run mobile:ios:build            # iOS archive作成
# Xcode Simulatorで手動インストール
```

### Environment Configuration

Create `.env.local` in `apps/mobile/`:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## ☁️ Backend Development

### Firebase Functions

```bash
# Development
cd apps/functions
npm run dev                 # Watch mode compilation
npm run serve              # Emulator with hot reload

# Building
npm run build              # Compile TypeScript
npm run test               # Run Jest tests

# Deployment
npm run deploy             # Deploy to Firebase
```

### Firebase Emulators

```bash
# Start all emulators
npx firebase emulators:start

# Available services:
# - Authentication: http://localhost:9099
# - Firestore: http://localhost:8080
# - Functions: http://localhost:5001
```

### Database Management

```bash
# Setup development data
node scripts/setup-initial-data.js

# Test functions integration
node scripts/test-cloud-functions-integration.js

# Deploy rules and indexes
firebase deploy --only firestore:rules,firestore:indexes
```

## 🧪 Testing

### Test-Driven Development (TDD)

The project follows strict TDD principles:

1. **Write Test First** - Define expected behavior
2. **Red-Green-Refactor** - Make tests pass, then improve
3. **Maintain Coverage** - Keep tests passing at all times

### Running Tests

```bash
# All tests (Turborepo parallel)
npm run test

# Watch mode
npm run mobile:test -- --watch
npm run functions:test -- --watch

# Coverage
npm run test -- --coverage
```

### Test Structure

- **Mobile**: `apps/mobile/__tests__/` - 148 tests across 16 suites
- **Functions**: `apps/functions/src/__tests__/` - 11 comprehensive tests

### Current Test Status

- **Overall**: 148/151 tests passing (98% success rate)
- **Mobile**: 16/16 test suites passing
- **Functions**: 2/2 test suites passing

## 🔧 Debugging

### Mobile App Debugging

**Firebase React Native SDK使用時のデバッグ方法:**

```bash
# Android ログ確認
adb logcat | grep ichizen        # アプリ固有のログ
adb logcat *:E                   # エラーログのみ

# iOS ログ確認 (macOS)
xcrun simctl spawn booted log stream --predicate 'process CONTAINS "ichizen"'

# ⚠️ 注意: Expo DevToolsは使用不可
# npx expo start --dev-client  ← Firebase SDKのため動作しません
```

### Firebase Debugging

```bash
# Functions logs
firebase functions:log

# Emulator debugging
firebase emulators:start --inspect-functions
```

### Common Issues

**Firebase React Native SDK環境での一般的な問題:**

1. **ビルドエラー**: `npm run mobile:android:build` の失敗

   ```bash
   cd apps/mobile
   npx expo prebuild --platform android --clean
   npm run mobile:android:build
   ```

2. **依存関係の問題**: `rm -rf node_modules && npm install`

3. **APKインストール失敗**:

   ```bash
   adb uninstall dev.yoshiori.ichizen  # 既存アプリ削除
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

4. **Firebase接続エラー**: google-services.json設定確認

⚠️ **Metro/Expo関連の解決方法は使用不可:**

- `npx expo start --clear` ← 動作しません
- `npx expo install --fix` ← 不要です

## 📦 Dependencies

### Managing Dependencies

```bash
# Root level dependencies
npm install package-name

# Mobile-specific dependencies
cd apps/mobile
npm install react-native-package

# Functions-specific dependencies
cd apps/functions
npm install functions-package
```

### Major Dependencies

- **React Native Firebase SDK** - Native performance
- **Turborepo** - Monorepo build system
- **TypeScript** - Type safety
- **Jest** - Testing framework
- **ESLint** - Code quality

## 🚀 Build & Deployment

### Local Build

```bash
# Full build (parallel with Turborepo)
npm run build

# Platform-specific builds
npm run mobile:prebuild        # Generate native code
npm run mobile:android:build   # Android APK
npm run mobile:ios:build       # iOS archive
```

### CI/CD Pipeline

GitHub Actions automatically:

1. **Tests all packages** on PR/push
2. **Builds mobile apps** for iOS/Android
3. **Deploys functions** on main branch
4. **Caches dependencies** with Turborepo

### Manual Deployment

```bash
# Deploy functions
npm run functions:deploy

# Deploy database rules
firebase deploy --only firestore:rules

# Full Firebase deployment
firebase deploy
```

## 🎯 Performance Optimization

### Turborepo Optimization

- **Intelligent Caching**: Builds complete in 96ms when cached
- **Parallel Execution**: Multiple packages build simultaneously
- **Dependency Tracking**: Only rebuild what changed

### Mobile Optimization

- **Bundle Splitting**: Lazy load screens
- **Image Optimization**: Use WebP format
- **Native Performance**: React Native Firebase SDK

### Backend Optimization

- **Function Cold Starts**: Keep functions warm
- **Firestore Indexing**: Optimize query performance
- **CDN Caching**: Cache static assets

## 📋 Code Standards

### TypeScript

- **Strict mode enabled** - Maximum type safety
- **Interface definitions** - Clear data contracts
- **Generic types** - Reusable type definitions

### Testing Standards

- **100% function coverage** - Test all public functions
- **Integration tests** - Test component interactions
- **Mocking strategy** - Mock external dependencies

### Code Style

- **ESLint configuration** - Enforce code standards
- **Prettier formatting** - Consistent code style
- **Import organization** - Logical import grouping

### Commit Standards

- **Semantic commits** - Clear commit messages
- **English language** - All commit messages in English
- **Why, not what** - Explain the reason for changes

## 🔍 Troubleshooting

### Common Development Issues

1. **Firebase connection errors**: Check emulator status
2. **React Native build failures**: Clear Metro cache
3. **TypeScript errors**: Update type definitions
4. **Test failures**: Check mock configurations

### Performance Issues

1. **Slow builds**: Check Turborepo cache status
2. **App startup slow**: Profile bundle size
3. **Database queries slow**: Check Firestore indexes

### Debug Resources

- **React Native Debugger** - Component inspection
- **Firebase Console** - Database and functions monitoring
- **Chrome DevTools** - JavaScript debugging
- **Expo DevTools** - React Native development tools

For architecture details, see [`ARCHITECTURE.md`](ARCHITECTURE.md).
For deployment procedures, see [`DEPLOYMENT.md`](DEPLOYMENT.md).
