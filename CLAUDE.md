# 「今日の小さな善行」アプリ企画書

## 1. アプリ概要

「今日の小さな善行」は、日常の小さな行動を通じて**個人の幸福感と世界への貢献感を同時に育む**革新的なモバイルアプリです。毎日一つの善行を実践することで、「**私の行動が世界を少し良くしている**」という確かな実感と、穏やかな達成感を提供します。競争ではなく**共感と応援**を基盤とした、新しい形のソーシャル体験を創造します。

## 2. 主な機能

### 2.1. 毎日のお題提示

- **日替わりお題:** 毎日ランダムで「今日の小さな善行」を提示
- **お題の変更:** 1日1回に限り別のお題に変更可能
- **カテゴリ表示:** 環境、人間関係、自己ケアなどのアイコン表示

### 2.2. 善行の「DONE!」と達成フィードバック

- **ワンタップ完了:** 大きな「DONE!」ボタンで簡単記録
- **視覚的フィードバック:** キラキラアニメーションと効果音
- **世界全体カウンター:** 全ユーザーの「DONE!」累計をリアルタイム表示

### 2.3. フォロー機能

- **一方向フォロー:** ユニークIDでユーザーをフォロー
- **達成通知:** フォローユーザーの善行達成をプッシュ通知
- **ゆるやかな繋がり:** 競争ではなく応援の関係性

### 2.4. 善行履歴

- **個人履歴:** カレンダー形式で過去の達成日を表示
- **プライベート:** 自分の履歴のみ閲覧可能

## 3. 技術スタック

### フロントエンド

- **React Native + TypeScript + Expo Development Build**
- **react-i18next** - 多言語対応（日本語・英語）
- **React Native Firebase SDK** - ネイティブ性能

### バックエンド

- **Firebase Authentication** - 匿名認証
- **Cloud Firestore** - リアルタイムデータベース
- **Cloud Functions** - TypeScript サーバーレス関数
- **Firebase Cloud Messaging** - プッシュ通知

### 開発環境

- **Turborepo** - モノレポ管理・高速ビルド
- **Jest + React Native Testing Library** - 包括的テストスイート
- **GitHub Actions** - CI/CD パイプライン
- **ESLint + TypeScript** - コード品質管理

## 4. プロジェクト構造

```
ichizen/ (Turborepo root)
├── apps/
│   ├── mobile/              # React Native アプリ
│   │   ├── src/
│   │   │   ├── components/  # UIコンポーネント
│   │   │   ├── screens/     # 画面
│   │   │   ├── services/    # Firebaseサービス
│   │   │   ├── contexts/    # React Context
│   │   │   ├── hooks/       # カスタムReactフック
│   │   │   ├── config/      # 環境設定
│   │   │   ├── i18n/       # 多言語対応
│   │   │   ├── types/      # TypeScript型定義
│   │   │   ├── data/       # 静的データ
│   │   │   └── utils/      # ユーティリティ
│   │   └── __tests__/      # テストスイート
│   └── functions/          # Cloud Functions
├── docs/                   # プロジェクトドキュメント
│   ├── ARCHITECTURE.md     # システム設計
│   ├── DEVELOPMENT.md      # 開発ガイド
│   ├── DEPLOYMENT.md       # デプロイ手順
│   └── CHANGELOG.md        # 開発履歴
├── packages/               # 共有パッケージ（将来拡張用）
├── scripts/                # 開発ユーティリティ
├── turbo.json             # Turborepo設定
├── firebase.json          # Firebase設定
├── firestore.rules        # セキュリティルール
└── package.json           # ルートワークスペース設定
```

## 5. 開発コマンド

### ⚠️ 重要: Firebase React Native SDK使用時の開発制約

このプロジェクトは **React Native Firebase SDK** を使用しているため:

❌ **使用不可:**

- Expo Go での開発
- `expo start` / Metro サーバーでの開発
- ブラウザでの開発・テスト
- `npm run mobile:dev` コマンド

✅ **正しい開発フロー:**

1. ネイティブビルド (APK/IPA作成)
2. エミュレータ/実機へのインストール
3. ネイティブアプリでのテスト

### Turborepo統一コマンド

```bash
npm run build                # 全パッケージビルド
npm run test                 # 全テスト実行
npm run lint                 # 全パッケージLint
npm run typecheck           # TypeScript型チェック

# Cloud Functions開発
npm run functions:dev       # Cloud Functionsのみ
npm run functions:deploy    # 関数デプロイ
```

### エミュレータでの開発フロー

#### 🚀 **推奨: npm run dev:android コマンド**

エミュレータでの動作確認は、以下のコマンドを使用してください：

```bash
npm run dev:android
```

このコマンドは以下を自動的に実行します：

- Firebase エミュレータの起動（Firestore, Auth, Functions）
- Android エミュレータの起動
- アプリのビルド・インストール・起動
- 全てのプロセスの監視

**注意事項:**

- このコマンドは終了時にエミュレータも停止します
- Firebase エミュレータが既に起動している場合はエラーになります
- 別プロセスで実行する場合は、先に既存のFirebaseエミュレータを停止してください

#### 手動での Standalone App 開発フロー

`npm run dev:android` を使用せず、手動でビルド・テストする場合：

```bash
# 1. クリーンな Bundle 生成（必須）
cd apps/mobile
rm -rf dist/ && npx expo export --clear --platform android

# 2. Bundle をアセットに配置
cp dist/_expo/static/js/android/*.hbc android/app/src/main/assets/index.android.bundle

# 3. APK ビルド
cd android && ./gradlew assembleDebug --no-configuration-cache

# 4. エミュレータにインストール・起動
adb install android/app/build/outputs/apk/debug/app-debug.apk
adb shell am force-stop dev.yoshiori.ichizen && adb shell pm clear dev.yoshiori.ichizen
adb shell am start -n dev.yoshiori.ichizen/.MainActivity
```

#### トラブルシューティング

**バンドルハッシュで変更確認:**

```bash
# 新しいハッシュが生成されているか確認
ls -la dist/_expo/static/js/android/
# 例: index-ed5cc6262b94c7ce7aaf7bde1bd576bd.hbc（ハッシュが変わっていればOK）
```

**完全リセット手順:**

```bash
# Metro・Expo・Gradle キャッシュを全削除
rm -rf dist/ node_modules/.cache android/build android/.gradle
npx expo install --fix
```

### iOS開発

```bash
# iOS開発 (macOS必須) - 未テスト
npm run mobile:ios:build                  # iOS archive作成
```

### Firebase エミュレータでの開発

```bash
# 推奨: 自動化されたコマンドを使用
npm run dev:android

# このコマンドが全て自動で実行します：
# - Firebase エミュレータの起動
# - Android エミュレータの起動
# - アプリのビルド・インストール・起動
```

**エミュレータUI:** http://127.0.0.1:4002/

## 6. 現在のステータス

### 完成度: **本番レディ** 🎉

- **技術基盤**: 100% ✅ (React Native Firebase + Turborepo)
- **主要機能**: 100% ✅ (全画面・サービス実装済み)
- **テスト品質**: 高品質 ✅ (包括的テストスイート)
- **Android対応**: 100% ✅ (APK・エミュレータ動作確認済み)
- **多言語対応**: 100% ✅ (日本語・英語完全対応)

### 利用可能な機能

- ✅ **Androidアプリ**: Standalone App として動作確認済み
- ❌ **Web版**: Firebase React Native SDK制約により使用不可
- ✅ **Cloud Functions**: 本番デプロイ済み
- ✅ **CI/CD**: GitHub Actions完全自動化

### 【最新更新】リポジトリ整理完了 ✅

**2025年7月1日**: 大規模なリポジトリ整理が完了し、技術的負債を大幅に削減

#### 実施内容:

1. **Phase 1**: 不要なレガシーファイル削除 - Web Firebase SDK関連ファイル除去
2. **Phase 2**: package.json スクリプト整理 - 使用不可能なExpoスクリプト削除
3. **Phase 3**: コードインポート修正 - expo-status-bar → React Native StatusBar
4. **Phase 4**: Firebase設定統一 - Web SDK remnants完全除去
5. **Phase 5**: ドキュメント更新 - 最新状態を反映

#### 成果:

- **削除されたコード**: 800+ 行の不要なコード
- **統一されたアーキテクチャ**: React Native Firebase SDK一本化
- **テスト成功率**: 100% (全174テスト通過)
- **開発体験向上**: `npm run dev:android` による統一された開発フロー

## 7. 開発方針

### Test-Driven Development (TDD)

- テストファースト → 実装 → リファクタリングのサイクル
- テストは常に100%通過状態を維持
- 現在の成功率: 高い成功率を維持

### コード規約

- コミットメッセージ、コード内コメントは英語
- コミットログには Why を記述
- 主要依存関係の更新は事前確認

### UI/UXテスト方針

- Playwright MCPを使用したブラウザ自動化テスト
- 実際のユーザー操作を再現
- 自動実行（効率重視）

## 8. 次のステップ

### 【高優先度】リリース準備

1. **iOS対応確認** - React Native Firebase環境でのiOSビルドテスト
2. **App Store・Google Play申請準備** - メタデータ・アイコン調整

### 【中優先度】機能拡張

1. **ユーザー名システム実装** - Firebase UIDの代わりに一意なユーザー名導入（詳細: `docs/USERNAME_SYSTEM.md`）
2. **多言語対応拡充** - 追加言語対応
3. **パフォーマンス最適化** - バンドル・起動時間改善

---

**更新日**: 2025年7月1日  
**ステータス**: **開発完了、リポジトリ整理完了、リリース準備段階**
**詳細履歴**: `docs/CHANGELOG.md` 参照
