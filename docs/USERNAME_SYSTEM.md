# ユーザー名システム仕様書

## 概要

現在、ProfileScreenでFirebase UIDが表示されているが、これはセキュリティ上の懸念があるため、一意なユーザー名システムを導入する。

### 目的

1. **セキュリティ向上**: Firebase UIDを隠すことでプライバシー保護
2. **URL対応**: 将来の招待機能やプロフィール共有でユーザーフレンドリーなURL実現
3. **ユーザビリティ**: 覚えやすい識別子の提供

### 設計方針

- 初回ログイン時にランダムなユーザー名を自動生成
- サインイン時に余計な手順を挟まない（UXを優先）
- 後からユーザー名変更可能
- 変更履歴を保持、変更頻度制限は設けない

## データ構造

### User型の更新

```typescript
interface User {
  id: string; // Firebase UID (内部用のみ)
  username: string; // 現在のユーザー名（一意、公開）
  language: "en" | "ja";
  usernameHistory: UsernameHistoryEntry[]; // 変更履歴
  createdAt: Date;
  lastActiveAt: Date;
  fcmToken?: string;
}
```

### ユーザー名履歴

```typescript
interface UsernameHistoryEntry {
  username: string; // 使用していたユーザー名
  usedFrom: Date; // 使用開始日時
  usedUntil?: Date; // 使用終了日時（現在使用中なら未設定）
}
```

### usernames Collection（一意性保証用）

```typescript
// Collection: "usernames"
// Document ID: ユーザー名（例: "user_abc123"）
interface UsernameDoc {
  userId: string; // このユーザー名を使用しているユーザーのFirebase UID
  createdAt: Date; // 作成日時
  isGenerated: boolean; // 自動生成（true）かユーザー設定（false）か
}
```

## 技術仕様

### ランダムユーザー名生成

**パターン**: `{prefix}_{random}`

- **prefix**: `user`, `guest`, `ichizen` 等
- **random**: 6-8桁の英数字ランダム文字列
- **例**: `user_abc123`, `guest_xy789z`, `ichizen_48d3f2`

**生成アルゴリズム**:

```typescript
const generateRandomUsername = async (): Promise<string> => {
  const prefixes = ["user", "guest", "ichizen"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

  for (let attempt = 0; attempt < 10; attempt++) {
    const randomSuffix = generateRandomString(6); // a-z, 0-9
    const username = `${prefix}_${randomSuffix}`;

    if (await isUsernameAvailable(username)) {
      return username;
    }
  }

  throw new Error("Failed to generate unique username");
};
```

### 一意性保証

Firestoreの特性上、`users` collectionでの `where` クエリでは競合状態が発生する可能性があるため、専用の `usernames` collectionを使用：

```typescript
// ✅ 正しい方法: ドキュメントIDとして使用
await firestore().collection("usernames").doc(username).set({
  userId: uid,
  createdAt: new Date(),
  isGenerated: true,
});
// 失敗した場合 = 既に存在する = 一意性保証
```

### ユーザー名変更処理

**バッチ処理**で原子性を保証：

```typescript
const changeUsername = async (userId: string, newUsername: string): Promise<void> => {
  const batch = firestore().batch();

  // 1. 新しいユーザー名の利用可能性チェック
  const newUsernameRef = firestore().collection("usernames").doc(newUsername);
  const newUsernameDoc = await newUsernameRef.get();

  if (newUsernameDoc.exists) {
    throw new Error("Username already taken");
  }

  // 2. 現在のユーザー情報取得
  const userRef = firestore().collection("users").doc(userId);
  const userDoc = await userRef.get();
  const userData = userDoc.data() as User;
  const oldUsername = userData.username;

  // 3. 履歴の更新
  const updatedHistory = userData.usernameHistory.map((entry) => ({
    ...entry,
    usedUntil: entry.usedUntil || new Date(), // 現在使用中のものに終了日を設定
  }));

  updatedHistory.push({
    username: newUsername,
    usedFrom: new Date(),
  });

  // 4. バッチ処理
  // 新しいusernameドキュメント作成
  batch.set(newUsernameRef, {
    userId: userId,
    createdAt: new Date(),
    isGenerated: false,
  });

  // ユーザードキュメント更新
  batch.update(userRef, {
    username: newUsername,
    usernameHistory: updatedHistory,
  });

  // 古いusernameドキュメント削除
  if (oldUsername) {
    const oldUsernameRef = firestore().collection("usernames").doc(oldUsername);
    batch.delete(oldUsernameRef);
  }

  // 5. 一括実行
  await batch.commit();
};
```

## UI/UX設計

### ProfileScreen更新

**変更前**:

```
┌─────────────────────────┐
│ ユーザーID              │
│ AbCdEf123GhIjKl...     │ ← Firebase UID（セキュリティリスク）
└─────────────────────────┘
```

**変更後**:

```
┌─────────────────────────┐
│ ユーザー名              │
│ user_abc123  [編集]     │ ← 親しみやすいユーザー名
│                         │
│ 言語設定                │
│ [日本語] [English]      │
│                         │
│ [サインアウト]          │
└─────────────────────────┘
```

### ユーザー名編集UI

**モーダルまたは新画面**:

```
┌─────────────────────────┐
│ ユーザー名を変更        │
│                         │
│ [user_new_name____]     │
│ ✓ 利用可能です          │
│                         │
│ 注意：                  │
│ • 英数字とアンダース    │
│   コアのみ使用可能      │
│ • 変更後、古いユーザー  │
│   名は他の人が使用可能  │
│   になります            │
│                         │
│ [キャンセル] [保存]     │
└─────────────────────────┘
```

## 実装ステータス（全て完了 ✅）

#### 1. 型定義とスキーマ更新

- ✅ `User` interfaceに `username`, `usernameHistory` フィールド追加
- ✅ `UsernameHistoryEntry` interface作成
- ✅ `UsernameDoc` interface作成

#### 2. ユーティリティ関数実装

- ✅ `generateRandomUsername()` 関数
- ✅ `isUsernameAvailable(username)` 関数
- ✅ `changeUsername(userId, newUsername)` 関数
- ✅ `getUserByUsername(username)` 関数（新規追加）
- ✅ `getUserIdByUsername(username)` 関数（新規追加）

#### 3. 既存ユーザーへの移行処理

- ✅ 初回起動時の自動ユーザー名割り当て
- ✅ 履歴の初期化処理

#### 4. ProfileScreen更新

- ✅ UserID表示をusername表示に変更
- ✅ 編集ボタン追加
- ✅ ユーザー名編集モーダル/画面作成（`UsernameEditModal`）

#### 5. FollowScreen更新（新規追加）

- ✅ Firebase UID表示をusername表示に変更
- ✅ ユーザーID入力をusername入力に変更
- ✅ username→UID変換処理追加
- ✅ フォロー中リストでのusername表示

#### 6. バリデーション実装

- ✅ ユーザー名の文字制限チェック（3-20文字、英数字\_のみ）
- ✅ 重複チェック
- ✅ 予約語チェック（admin, system等）

#### 7. 多言語対応

- ✅ ユーザー名関連の文言追加（日本語・英語）
- ✅ エラーメッセージの翻訳

#### 8. エラーハンドリング

- ✅ ネットワークエラー
- ✅ ユーザー名重複エラー
- ✅ バリデーションエラー

#### 9. テスト実装

- ✅ `getUserByUsername` / `getUserIdByUsername` のユニットテスト
- ✅ `FollowScreen` のusername機能テスト
- ✅ 既存テストの更新（100%通過）

## 注意事項

### セキュリティ

- Firebase UIDは内部処理のみで使用
- usernameは公開情報として扱う
- Firestore Security Rulesでusername-basedクエリを適切に制限

### パフォーマンス

- ユーザー名→UID変換は高速（ドキュメントIDでの検索）
- 大量のユーザーでもスケール可能

### 将来の拡張

- **プロフィール共有**: `https://ichizen.app/profile/username`
- **招待機能**: `https://ichizen.app/invite/username`
- **フォロー機能**: ユーザー名での検索・フォロー

## 開発者向けメモ

### 変更履歴の活用

- 管理・サポート目的での追跡
- 不適切利用の調査
- 将来的なUI表示（「以前 @oldname として知られていた」等）

### 制限しないもの

- 変更頻度制限は設けない（ユーザーフレンドリー優先）
- 特殊文字は禁止（URL安全性のため）

---

## 新機能：Follow機能でのUsername利用

### 2025年7月2日追加実装

#### 機能概要

Communicationタブ（FollowScreen）で、Firebase UIDの代わりにusernameを使用して、よりユーザーフレンドリーなフォロー機能を実現。

#### 実装内容

1. **自分のusername表示**

   - Firebase UIDの代わりにusernameを表示
   - 共有用のヒントメッセージもusernameベースに変更

2. **username入力でのフォロー**

   - プレースホルダー：「ユーザーIDを入力」→「ユーザー名を入力」
   - 入力されたusernameを内部的にFirebase UIDに変換
   - 自分のusernameでのフォロー防止機能

3. **フォロー中リストでのusername表示**

   - 各フォロー対象ユーザーをusernameで表示
   - Firebase UIDは内部処理でのみ使用

4. **後方互換性**
   - 内部的なフォローシステムはFirebase UIDベースを維持
   - 既存のフォロー関係に影響なし

#### 技術実装

- **新関数**: `getUserByUsername()`, `getUserIdByUsername()`
- **更新画面**: `FollowScreen.tsx`
- **多言語対応**: 日本語・英語の翻訳追加
- **テスト**: 包括的なユニット・統合テスト

---

**作成日**: 2024年6月21日  
**最終更新**: 2025年7月2日  
**ステータス**: **実装完了、Follow機能統合完了**  
**優先度**: 完了
