# Android開発環境クイックスタート

Rubyの`foreman`のように、一つのコマンドでAndroid開発環境を起動できます。

## 🚀 クイックスタート

```bash
# プロジェクトルートで実行
npm run dev:android
```

このコマンドで以下が自動実行されます：

1. ✅ **Firebaseエミュレータ起動** (Firestore, Auth, Functions)
2. ✅ **Androidエミュレータ起動** (利用可能な最初のAVD)
3. ✅ **アプリビルド・インストール・起動**
4. ✅ **開発環境完了通知**

## 📱 起動後のアクセス先

| サービス        | URL                    |
| --------------- | ---------------------- |
| **Firebase UI** | http://127.0.0.1:4002/ |
| **Firestore**   | http://localhost:8080  |
| **Auth**        | http://localhost:9098  |
| **Functions**   | http://localhost:5001  |

## 🛑 停止方法

```bash
# Ctrl+C で全サービス停止
^C
```

自動的に以下がクリーンアップされます：

- Firebaseエミュレータ
- Androidエミュレータ
- ログファイル

## 📝 ログ確認

開発中に問題が発生した場合：

```bash
# Firebaseエミュレータのログ
tail -f firebase-emulator.log

# Androidエミュレータのログ
tail -f emulator.log

# アプリのログ（リアルタイム）
adb logcat | grep -E "(ichizen|🔥|✅|❌)"
```

## 🔧 トラブルシューティング

### エミュレータが見つからない場合

```bash
# Android Studioで新しいAVDを作成
# Tools → AVD Manager → Create Virtual Device
```

### ポートが使用中の場合

```bash
# プロセス確認・停止
lsof -ti:8080 | xargs kill -9  # Firestore
lsof -ti:9098 | xargs kill -9  # Auth
lsof -ti:5001 | xargs kill -9  # Functions
```

### アプリが正常にインストールされない場合

```bash
# 手動でアンインストール後再実行
adb uninstall dev.yoshiori.ichizen
npm run dev:android
```

## ⚡ 高速再起動

開発中にアプリのみ再ビルドしたい場合：

```bash
# エミュレータは起動したまま、アプリのみ再ビルド
cd apps/mobile
./scripts/build-android-local.sh
```

## 📊 パフォーマンス

初回起動時間：

- Firebaseエミュレータ: ~10秒
- Androidエミュレータ: ~30秒
- アプリビルド: ~45秒
- **合計: ~90秒**

2回目以降（エミュレータ再利用）：

- アプリビルドのみ: ~45秒
