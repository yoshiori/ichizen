# Standalone App Development Guide

このガイドでは、Firebase React Native SDK を使用した Standalone App の開発フローについて詳しく説明します。

## 📋 目次

1. [概要](#概要)
2. [なぜ Standalone App なのか？](#なぜ-standalone-app-なのか)
3. [開発環境のセットアップ](#開発環境のセットアップ)
4. [開発フロー](#開発フロー)
5. [Firebase エミュレータでの開発](#firebase-エミュレータでの開発)
6. [トラブルシューティング](#トラブルシューティング)
7. [ベストプラクティス](#ベストプラクティス)

## 概要

このプロジェクトは **React Native Firebase SDK** を使用しているため、通常の Expo Go や Metro サーバーを使用した開発はできません。代わりに、**Standalone App** として開発する必要があります。

### Standalone App とは？

- Expo Development Client を使用しない、純粋なネイティブアプリ
- Firebase などのネイティブ依存関係を完全にサポート
- プロダクション環境と同じ動作を保証

## なぜ Standalone App なのか？

### ❌ 使用できない開発方法

| 方法               | 理由                                                        |
| ------------------ | ----------------------------------------------------------- |
| Expo Go            | Firebase SDK などのネイティブモジュールをサポートしていない |
| `expo start`       | Metro サーバーはネイティブ依存関係を処理できない            |
| Web ブラウザ開発   | React Native Firebase SDK は Web をサポートしていない       |
| Development Client | Firebase SDK との互換性問題がある                           |

### ✅ Standalone App の利点

- **完全なネイティブサポート**: すべての Firebase 機能が利用可能
- **プロダクション環境と同一**: 開発時と本番時で動作の差異がない
- **デバッグの信頼性**: 実際のアプリと同じ環境でテスト可能

## 開発環境のセットアップ

### 必要なツール

```bash
# Android 開発
- Android Studio
- Android SDK (API Level 24以上)
- Android エミュレータまたは実機
- ADB (Android Debug Bridge)

# iOS 開発 (macOS のみ)
- Xcode
- iOS シミュレータまたは実機
- CocoaPods

# 共通
- Node.js 20+
- npm 10+
- Firebase CLI
```

### 初期セットアップ

```bash
# リポジトリのクローン
git clone https://github.com/yoshiori/ichizen.git
cd ichizen

# 依存関係のインストール
npm install

# Firebase 設定ファイルの配置
# Android: apps/mobile/android/app/google-services.json
# iOS: apps/mobile/ios/GoogleService-Info.plist
```

## 開発フロー

### 🚀 推奨: 自動化された開発フロー

エミュレータでの開発には、以下の統合コマンドを使用することを推奨します：

```bash
# Firebase エミュレータ + Android エミュレータ + アプリを一括起動
npm run dev:android
```

このコマンドは全ての開発環境を自動的に設定・起動します。詳細は[Android開発環境クイックスタート](./ANDROID_DEVELOPMENT.md)を参照してください。

### 手動開発フロー

個別のステップを制御したい場合は、以下の手順に従ってください：

### 1. Bundle の生成

アプリの JavaScript コードを Bundle にコンパイルします：

```bash
cd apps/mobile

# プロダクション Bundle の生成
NODE_ENV=production npx expo export --platform android
```

### 2. ネイティブプロジェクトの準備

Expo の設定からネイティブプロジェクトを生成します：

```bash
# Android の場合
npx expo prebuild --platform android --clean

# iOS の場合 (macOS のみ)
npx expo prebuild --platform ios --clean
```

### 3. Bundle の配置

生成された Bundle を適切な場所にコピーします：

```bash
# Android
cp dist/_expo/static/js/android/index-*.hbc android/app/src/main/assets/index.android.bundle

# iOS
cp dist/_expo/static/js/ios/index-*.hbc ios/main.jsbundle
```

### 4. ネイティブアプリのビルド

#### Android

```bash
cd android
./gradlew assembleDebug --no-configuration-cache
```

#### iOS (macOS のみ)

```bash
cd ios
pod install
xcodebuild -workspace ichizen.xcworkspace -scheme ichizen -configuration Debug
```

### 5. アプリのインストールと起動

#### Android

```bash
# APK のインストール
adb install android/app/build/outputs/apk/debug/app-debug.apk

# アプリの起動
adb shell am start -n dev.yoshiori.ichizen/.MainActivity
```

#### iOS

```bash
# シミュレータへのインストール
xcrun simctl install booted ios/build/Build/Products/Debug-iphonesimulator/ichizen.app

# アプリの起動
xcrun simctl launch booted dev.yoshiori.ichizen
```

### 6. コード変更時の再ビルド

コードを変更した場合は、手順 1-5 を繰り返す必要があります。

**効率化のためのスクリプト例**:

```bash
#!/bin/bash
# rebuild-android.sh

set -e

echo "🔨 Building JavaScript bundle..."
NODE_ENV=production npx expo export --platform android

echo "📦 Copying bundle to Android assets..."
cp dist/_expo/static/js/android/index-*.hbc android/app/src/main/assets/index.android.bundle

echo "🏗️ Building Android APK..."
cd android && ./gradlew assembleDebug --no-configuration-cache

echo "📱 Installing APK..."
adb install -r app/build/outputs/apk/debug/app-debug.apk

echo "🚀 Launching app..."
adb shell am start -n dev.yoshiori.ichizen/.MainActivity

echo "✅ Done!"
```

## Firebase エミュレータでの開発

### 1. エミュレータの起動

```bash
# 別ターミナルで実行
npx firebase emulators:start --only firestore,auth,functions
```

### 2. 環境変数の設定

`apps/mobile/.env` ファイルを編集：

```bash
# エミュレータ用
EXPO_PUBLIC_FIREBASE_ENV=emulator

# 本番用
# EXPO_PUBLIC_FIREBASE_ENV=production
```

### 3. エミュレータ用 Bundle のビルドとインストール

通常の開発フローと同じ手順でビルドします。アプリは自動的にエミュレータに接続されます。

### エミュレータ UI

- **全体**: http://127.0.0.1:4002/
- **Auth**: http://127.0.0.1:4002/auth
- **Firestore**: http://127.0.0.1:4002/firestore
- **Functions**: http://127.0.0.1:4002/functions

## トラブルシューティング

### よくある問題と解決方法

#### 1. React Suspense エラー

**症状**: "A component suspended while responding to synchronous input"

**解決方法**:

- すべての状態更新を `startTransition` でラップ
- 非同期処理を適切に処理
- App レベルで `Suspense` コンポーネントを使用

#### 2. Bundle が見つからない

**症状**: "Unable to load script. Make sure you're either running Metro..."

**解決方法**:

```bash
# Bundle が正しい場所にあるか確認
ls -la android/app/src/main/assets/index.android.bundle

# Bundle を再生成してコピー
NODE_ENV=production npx expo export --platform android
cp dist/_expo/static/js/android/index-*.hbc android/app/src/main/assets/index.android.bundle
```

#### 3. Firebase 初期化エラー

**症状**: "No Firebase App '[DEFAULT]' has been created"

**解決方法**:

- `google-services.json` が正しい場所にあるか確認
- Firebase プラグインが `app.config.js` で設定されているか確認
- プロジェクトを clean rebuild

#### 4. パッケージ名の不一致

**症状**: アプリがインストールできない、または起動しない

**解決方法**:

```bash
# すべての場所で同じパッケージ名を使用
# - app.config.js
# - android/app/build.gradle
# - AndroidManifest.xml
```

### デバッグツール

#### Android ログの確認

```bash
# すべてのログ
adb logcat

# アプリのログのみ
adb logcat | grep ichizen

# エラーログのみ
adb logcat *:E

# Firebase 関連のログ
adb logcat | grep -i firebase
```

#### React Native デバッガー

Standalone App では Chrome DevTools は使用できませんが、以下の方法でデバッグできます：

1. **Flipper**: React Native 用の総合デバッグツール
2. **React Native Debugger**: スタンドアロンのデバッグアプリ
3. **console.log**: ADB logcat で確認

## ベストプラクティス

### 1. 開発効率の向上

- **自動化スクリプト**: ビルドプロセスをスクリプト化
- **ホットキー設定**: 頻繁に使うコマンドにエイリアスを設定
- **並列ターミナル**: エミュレータ、ログ、ビルドを別々のターミナルで実行

### 2. バージョン管理

- `google-services.json` は `.gitignore` に追加
- 環境変数は `.env.example` で管理
- ネイティブコードの変更は慎重に行う

### 3. テスト戦略

- **単体テスト**: Jest でロジックをテスト
- **統合テスト**: エミュレータでの動作確認
- **E2E テスト**: Detox などでの自動テスト

### 4. パフォーマンス最適化

- **Bundle サイズ**: 不要な依存関係を削除
- **起動時間**: 遅延読み込みを活用
- **メモリ使用量**: React Native の Performance Monitor を使用

### 5. CI/CD 統合

GitHub Actions での自動ビルド例：

```yaml
name: Build Android
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm ci

      - name: Build Bundle
        run: |
          cd apps/mobile
          NODE_ENV=production npx expo export --platform android

      - name: Prebuild Android
        run: |
          cd apps/mobile
          npx expo prebuild --platform android --clean

      - name: Copy Bundle
        run: |
          cd apps/mobile
          cp dist/_expo/static/js/android/index-*.hbc android/app/src/main/assets/index.android.bundle

      - name: Build APK
        run: |
          cd apps/mobile/android
          ./gradlew assembleDebug

      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: app-debug
          path: apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

## まとめ

Standalone App 開発は、初期設定に時間がかかりますが、以下の利点があります：

- ✅ すべてのネイティブ機能が利用可能
- ✅ プロダクション環境と同じ動作
- ✅ 信頼性の高いデバッグ環境

開発効率を上げるために、自動化スクリプトやツールを活用しましょう。

## 関連ドキュメント

- [DEVELOPMENT.md](./DEVELOPMENT.md) - 一般的な開発ガイド
- [ARCHITECTURE.md](./ARCHITECTURE.md) - システムアーキテクチャ
- [DEPLOYMENT.md](./DEPLOYMENT.md) - デプロイメント手順
