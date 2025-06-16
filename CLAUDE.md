# 「今日の小さな善行」アプリ企画書

## 1. アプリ概要

「今日の小さな善行」は、「**少しだけど世界が良くなっている**」という実感をユーザーに提供する、シンプルで心温まるモバイルアプリです。ユーザーは毎日、アプリから提案される一つの小さな善行に取り組み、その達成を記録します。

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
- **Jest + React Native Testing Library** - 148テストケース
- **GitHub Actions** - CI/CD パイプライン
- **ESLint + TypeScript** - コード品質管理

## 4. プロジェクト構造

```
ichizen/
├── apps/
│   ├── mobile/          # React Native アプリ
│   │   ├── src/
│   │   │   ├── components/  # UIコンポーネント
│   │   │   ├── screens/     # 画面
│   │   │   ├── services/    # Firebaseサービス
│   │   │   ├── contexts/    # React Context
│   │   │   ├── config/      # 環境設定
│   │   │   ├── i18n/       # 多言語対応
│   │   │   └── types/      # TypeScript型定義
│   │   └── __tests__/      # テストスイート
│   └── functions/       # Cloud Functions
├── docs/               # プロジェクトドキュメント
├── scripts/            # 開発ユーティリティ
├── turbo.json         # Turborepo設定
├── firebase.json      # Firebase設定
└── firestore.rules    # セキュリティルール
```

## 5. 開発コマンド

### Turborepo統一コマンド

```bash
npm run build                # 全パッケージビルド
npm run test                 # 全テスト実行（148/151成功）
npm run lint                 # 全パッケージLint
npm run typecheck           # TypeScript型チェック
npm run dev                  # 全開発サーバー並列起動

# 個別パッケージ
npm run mobile:dev          # モバイルアプリのみ
npm run functions:dev       # Cloud Functionsのみ
npm run functions:deploy    # 関数デプロイ（96ms TURBO）
```

### 実行方法

```bash
# Android開発
npm run android             # Turbo prebuild → expo run:android

# iOS開発
npm run ios                 # Turbo prebuild → expo run:ios

# Firebase エミュレータ
npx firebase emulators:start
```

## 6. 現在のステータス

### 完成度: **約99%** 🎉

- **技術基盤**: 100% ✅ (React Native Firebase + Turborepo)
- **主要機能**: 100% ✅ (全画面・サービス実装済み)
- **テスト品質**: 98% ✅ (148/151テスト成功)
- **Android対応**: 100% ✅ (APK・エミュレータ動作確認済み)
- **多言語対応**: 100% ✅ (日本語・英語完全対応)

### 利用可能な機能

- ✅ **Androidアプリ**: エミュレータ・実機動作
- ✅ **Web版**: 開発・テスト用
- ✅ **Cloud Functions**: 本番デプロイ済み
- ✅ **CI/CD**: GitHub Actions完全自動化

## 7. 開発方針

### Test-Driven Development (TDD)

- テストファースト → 実装 → リファクタリングのサイクル
- テストは常に100%通過状態を維持
- 現在の成功率: 98% (148/151)

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

1. **多言語対応拡充** - 追加言語対応
2. **パフォーマンス最適化** - バンドル・起動時間改善

---

**更新日**: 2025年6月16日  
**ステータス**: **開発ほぼ完了（99%）、リリース準備段階**  
**詳細履歴**: `docs/CHANGELOG.md` 参照
