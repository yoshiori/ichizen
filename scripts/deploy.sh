#!/bin/bash

# 「今日の小さな善行」アプリ デプロイスクリプト
# Usage: ./scripts/deploy.sh [functions|rules|all]

set -e

# カラー出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ログ関数
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 引数の解析
DEPLOY_TARGET=${1:-all}

log_info "🚀 「今日の小さな善行」アプリのデプロイを開始します"
log_info "デプロイ対象: $DEPLOY_TARGET"

# プロジェクトルートに移動
cd "$(dirname "$0")/.."

# Firebase CLIの確認
if ! command -v firebase &> /dev/null; then
    log_error "Firebase CLI がインストールされていません"
    log_info "インストール方法: npm install -g firebase-tools"
    exit 1
fi

# Firebaseプロジェクトの確認
PROJECT_ID=$(firebase use 2>/dev/null || echo "")
if [ -z "$PROJECT_ID" ]; then
    log_error "Firebaseプロジェクトが設定されていません"
    log_info "設定方法: firebase use ichizen-daily-good-deeds"
    exit 1
fi

log_info "Firebase プロジェクト: $PROJECT_ID"

# Functions のビルドとテスト
if [ "$DEPLOY_TARGET" = "functions" ] || [ "$DEPLOY_TARGET" = "all" ]; then
    log_info "📦 Cloud Functions をビルドしています..."
    
    cd functions
    
    # 依存関係のインストール
    if [ ! -d "node_modules" ]; then
        log_info "依存関係をインストールしています..."
        npm install
    fi
    
    # Lint チェック
    log_info "🔍 コード品質をチェックしています..."
    npm run lint
    
    # TypeScript ビルド
    log_info "🔨 TypeScript をビルドしています..."
    npm run build
    
    # テスト実行（あれば）
    if npm run test --if-present 2>/dev/null; then
        log_success "テストが完了しました"
    fi
    
    cd ..
    log_success "Cloud Functions のビルドが完了しました"
fi

# デプロイ実行
log_info "🚀 Firebase へデプロイしています..."

case $DEPLOY_TARGET in
    functions)
        firebase deploy --only functions
        ;;
    rules)
        firebase deploy --only firestore:rules,firestore:indexes
        ;;
    all)
        firebase deploy --only functions,firestore:rules,firestore:indexes
        ;;
    *)
        log_error "無効なデプロイ対象: $DEPLOY_TARGET"
        log_info "使用可能な対象: functions, rules, all"
        exit 1
        ;;
esac

# デプロイ完了
log_success "🎉 デプロイが完了しました！"
log_info "📊 Firebase Console: https://console.firebase.google.com/project/$PROJECT_ID"
log_info "⚡ Functions URL: https://asia-northeast1-$PROJECT_ID.cloudfunctions.net"

# デプロイ後のテストを提案
log_warning "📋 デプロイ後の確認事項:"
echo "   1. Cloud Functions の動作確認"
echo "   2. Firestore ルールの動作確認"
echo "   3. モバイルアプリからの接続テスト"
echo ""
log_info "🧪 テスト実行方法:"
echo "   cd apps/mobile && npm test"
echo ""