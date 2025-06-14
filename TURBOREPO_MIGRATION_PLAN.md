# Turborepo モノレポ移行計画

## 🎯 目標

現在のモノレポ構造（React Native + Cloud Functions）をTurborepoで管理し、ビルド効率とCI/CDパフォーマンスを向上させる。

## 📊 現在の構造

```
ichizen/
├── apps/mobile/        # React Native アプリ
├── functions/          # Cloud Functions
├── CLAUDE.md          # プロジェクト仕様書
└── package.json       # ルートパッケージ
```

## 🎯 移行後の目標構造

```
ichizen/
├── apps/
│   ├── mobile/        # React Native アプリ
│   └── functions/     # Cloud Functions
├── packages/          # 共有パッケージ（将来拡張用）
├── turbo.json         # Turborepo設定
├── package.json       # ルートpackage.json（workspaces設定）
└── .github/workflows/ # CI/CD設定
```

## 📋 移行ステップ

### フェーズ1: セットアップ（高優先度）

1. **作業ブランチ作成**

   - `feature/turborepo-migration` ブランチを作成

2. **Turborepo導入**

   - `turbo` パッケージインストール
   - ルートpackage.json にworkspaces設定追加

3. **プロジェクト構造調整**

   - `functions/` を `apps/functions/` に移動
   - `packages/` ディレクトリ作成（将来用）

4. **turbo.json設定**
   - ビルドタスク設定
   - テストタスク設定
   - リントタスク設定
   - 依存関係とキャッシュ設定

### フェーズ2: CI/CD更新（高優先度）

5. **GitHub Actions更新**
   - `.github/workflows/` 作成
   - Turborepoを使ったCI設定
   - 並列実行とキャッシュ活用

### フェーズ3: ドキュメント更新（中優先度）

6. **README更新**

   - Turborepoコマンドの説明
   - 開発フロー更新

7. **CLAUDE.md更新**
   - 新しい開発環境情報反映

## 🔧 想定されるTurborepo設定

### turbo.json

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### package.json scripts

```json
{
  "scripts": {
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "dev": "turbo run dev --parallel",
    "mobile:dev": "turbo run dev --filter=mobile",
    "functions:dev": "turbo run dev --filter=functions"
  }
}
```

## ⏱ 見積もり時間

| フェーズ | 作業内容         | 予想時間 |
| -------- | ---------------- | -------- |
| 1        | セットアップ     | 2-3時間  |
| 2        | CI/CD更新        | 1-2時間  |
| 3        | ドキュメント更新 | 1時間    |

**合計**: 約4-6時間

## 🎯 期待される効果

1. **ビルド効率向上**

   - 変更されたパッケージのみビルド
   - インクリメンタルビルド

2. **CI/CD高速化**

   - 並列実行
   - インテリジェントキャッシュ

3. **開発体験向上**

   - 統一されたコマンド体系
   - 依存関係の明確化

4. **スケーラビリティ**
   - 新しいアプリ・パッケージの追加が容易
   - 共有ライブラリの管理

## 🚧 注意点

1. **既存機能保持**

   - React Native Firebase機能
   - テストスイート（148/151成功）
   - Android/iOS対応

2. **段階的移行**

   - 各ステップでテスト実行
   - 動作確認後コミット

3. **後方互換性**
   - 既存のnpmスクリプトも残す
   - 段階的にTurborepo移行

---

**作成日**: 2025年6月14日  
**ステータス**: 計画策定完了、実装開始準備  
**次のステップ**: 作業ブランチ作成 → Turborepoセットアップ
