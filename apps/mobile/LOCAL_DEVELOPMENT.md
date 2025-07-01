# ローカル開発環境のセットアップ

## ⚠️ 重要: Firebase React Native SDK使用時の制約

このプロジェクトは **React Native Firebase SDK** を使用しているため、通常のExpo開発フローは使用できません。

❌ **使用不可:**

- Expo Go アプリでの開発
- `expo start` / Metro サーバー
- ブラウザでの開発・テスト
- ホットリロード機能

## 正しい開発セットアップ

### 1. 前提条件

- **Node.js 20+** および **npm 10+**
- **Android Studio** (Android開発用)
- **Xcode** (iOS開発用、macOS必須)
- **Firebase CLI**: `npm install -g firebase-tools`

### 2. Firebase設定ファイルの準備

#### 方法1: Firebaseコンソールからダウンロード（推奨）

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. `ichizen-daily-good-deeds` プロジェクトを選択
3. プロジェクト設定 → 全般 → アプリを選択
4. Android アプリの `google-services.json` をダウンロード
5. `apps/mobile/android/app/google-services.json` に配置

#### 方法2: テンプレートファイルを編集

1. `google-services.example.json` をコピー:

   ```bash
   cp google-services.example.json android/app/google-services.json
   ```

2. Firebase コンソールから以下の値を取得して置換:
   - `YOUR_PROJECT_NUMBER` → プロジェクト番号
   - `YOUR_PROJECT_ID` → プロジェクトID
   - `YOUR_ANDROID_APP_ID` → Android アプリID
   - `YOUR_API_KEY` → API キー

### 3. 正しい開発フロー

**Firebase React Native SDKを使用するため、以下の手順が必須:**

#### 🚀 推奨: 自動化された開発フロー

```bash
# プロジェクトルートで実行
# Firebaseエミュレータ + Androidエミュレータ + アプリを一括起動
npm run dev:android
```

#### 手動セットアップ

```bash
# 1. Firebase エミュレータ起動（必要に応じて）
npx firebase emulators:start

# 2. Android APK ビルド
npm run mobile:android:build

# 3. エミュレータにインストール
adb install android/app/build/outputs/apk/debug/app-debug.apk

# 4. アプリ起動
adb shell am start -n dev.yoshiori.ichizen/.MainActivity

# 5. コード変更時は手順2-4を繰り返し
```

### 4. 利用可能なFirebaseサービス

エミュレータ起動時:

- **Authentication**: http://localhost:9099
- **Firestore**: http://localhost:8080
- **Functions**: http://localhost:5001
- **Emulator UI**: http://localhost:4000

## 利用可能なスクリプト

```bash
# ビルド関連
npm run mobile:android:build    # Android APK作成
npm run mobile:ios:build        # iOS archive作成

# 本番Firebase接続
npm run android:production      # 本番Firebase + Android
npm run ios:production          # 本番Firebase + iOS

# ⚠️ 以下は動作しません (Firebase SDK使用のため)
# npm run mobile:dev            ← 使用不可
# npm run android               ← 使用不可
```

## デバッグ方法

### Android

```bash
# アプリログ確認
adb logcat | grep ichizen

# エラーログのみ
adb logcat *:E
```

### iOS (macOS)

```bash
# Simulatorログ
xcrun simctl spawn booted log stream --predicate 'process CONTAINS "ichizen"'
```

## よくある問題と解決方法

### 1. ビルドエラー

```bash
cd apps/mobile
npx expo prebuild --platform android --clean
npm run mobile:android:build
```

### 2. APKインストール失敗

```bash
# 既存アプリを削除してから再インストール
adb uninstall dev.yoshiori.ichizen
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### 3. Firebase接続エラー

- `google-services.json`が正しく配置されているか確認
- Firebase エミュレータが起動しているか確認
- プロジェクト設定が正しいか確認

### 4. 依存関係の問題

```bash
rm -rf node_modules
npm install
```

## 重要な注意事項

- **コード変更のたびに再ビルドが必要** (ホットリロード不可)
- **Metro/Expo Goは使用不可** (Firebase SDKのネイティブ依存関係のため)
- **開発効率**: ネイティブビルドのため、変更確認に時間がかかります
- `google-services.json` は `.gitignore` に含まれているため、コミットされません
- EAS Build では自動的に設定されるため、ローカル開発でのみ必要です
