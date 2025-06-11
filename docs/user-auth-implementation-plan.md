# ユーザー認証機能実装計画

## 概要
ユーザーストーリー1「ユーザー登録・ログイン」の実装計画書

### ユーザーストーリー
**As a** 新規ユーザー  
**I want to** アカウントを作成してログインしたい  
**So that** 自分専用のTodoリストを管理できる

## 1. API設計

### エンドポイント

#### 1.1 ユーザー登録
```
POST /api/auth/register
```

**リクエスト:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "太郎",
  "lastName": "山田",
  "phoneNumber": "+81901234567" // optional
}
```

**レスポンス (成功):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "firstName": "太郎",
      "lastName": "山田",
      "phoneNumber": "+81901234567",
      "createdAt": "2025-01-06T10:00:00Z"
    },
    "token": "jwt_token_here"
  }
}
```

**レスポンス (エラー):**
```json
{
  "success": false,
  "error": {
    "code": "USER_ALREADY_EXISTS",
    "message": "このメールアドレスは既に登録されています"
  }
}
```

#### 1.2 ログイン
```
POST /api/auth/login
```

**リクエスト:**
```json
{
  "username": "user@example.com", // メールアドレスをusernameとして使用
  "password": "securePassword123"
}
```

**レスポンス (成功):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "firstName": "太郎",
      "lastName": "山田",
      "lastLoginAt": "2025-01-06T10:00:00Z"
    },
    "token": "jwt_token_here"
  }
}
```

#### 1.3 ログアウト
```
POST /api/auth/logout
```

**リクエスト:**
```
Authorization: Bearer {token}
```

**レスポンス:**
```json
{
  "success": true,
  "message": "ログアウトしました"
}
```

#### 1.4 トークンリフレッシュ
```
POST /api/auth/refresh
```

**リクエスト:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token_here",
    "refreshToken": "new_refresh_token_here"
  }
}
```

#### 1.5 パスワードリセット要求
```
POST /api/auth/forgot-password
```

**リクエスト:**
```json
{
  "email": "user@example.com"
}
```

**レスポンス:**
```json
{
  "success": true,
  "message": "パスワードリセットのメールを送信しました"
}
```

## 2. データベーステーブル設計

### 2.1 usersテーブル
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone_number TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

### 2.2 sessionsテーブル
```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT UNIQUE NOT NULL,
  refresh_token_hash TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_agent TEXT,
  ip_address TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

### 2.3 password_reset_tokensテーブル
```sql
CREATE TABLE password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
```

## 3. フロントエンド画面設計

### 3.1 ログイン画面 (`/login`)
- **URL**: `/login`
- **コンポーネント**: `LoginPage.tsx`
- **フィールド**:
  - Username (Email)
  - Password
- **アクション**:
  - Sign In ボタン
  - Forgot Password リンク
  - Create Account リンク

### 3.2 ユーザー登録画面 (`/register`)
- **URL**: `/register`
- **コンポーネント**: `RegisterPage.tsx`
- **フィールド**:
  - First Name
  - Last Name (Surname)
  - Email
  - Mobile Phone (optional)
  - Password
- **アクション**:
  - Create Account ボタン
  - 利用規約への同意表示

### 3.3 パスワードリセット画面 (`/forgot-password`)
- **URL**: `/forgot-password`
- **コンポーネント**: `ForgotPasswordPage.tsx`
- **フィールド**:
  - Email
- **アクション**:
  - Send Reset Link ボタン

## 4. 認証フロー設計

### 4.1 認証方式
- **JWT (JSON Web Token)** を使用
- Access Token: 15分間有効
- Refresh Token: 7日間有効

### 4.2 認証フロー
1. **ログイン時**:
   - ユーザーがメールアドレスとパスワードを入力
   - サーバーで認証情報を検証
   - 成功時、JWTトークンとリフレッシュトークンを発行
   - トークンをlocalStorageまたはsecure cookieに保存

2. **API呼び出し時**:
   - Authorizationヘッダーにトークンを含める
   - トークンの有効性を検証
   - 期限切れの場合、リフレッシュトークンで更新

3. **ログアウト時**:
   - サーバー側でセッションを無効化
   - クライアント側でトークンを削除

### 4.3 セキュリティ対策
- パスワードは**bcrypt**でハッシュ化（cost factor: 12）
- HTTPS通信の強制
- CSRF対策の実装
- Rate limiting（ログイン試行: 5回/分）
- セッションの定期的な検証

## 5. テストケース設計

### 5.1 ユニットテスト
- **認証サービス**:
  - パスワードハッシュ化のテスト
  - トークン生成・検証のテスト
  - セッション管理のテスト

### 5.2 統合テスト
- **ユーザー登録フロー**:
  - 正常な登録
  - 重複メールアドレスの拒否
  - 無効な入力値の検証

- **ログインフロー**:
  - 正常なログイン
  - 無効な認証情報の拒否
  - アカウントロック機能

### 5.3 E2Eテスト
- ユーザー登録からログインまでの完全なフロー
- パスワードリセットフロー
- セッションタイムアウトの動作確認

## 6. TDD実装順序

### Phase 1: RED（テスト作成）
1. データベーススキーマのマイグレーションテスト
2. 認証サービスのユニットテスト
3. APIエンドポイントの統合テスト
4. Reactコンポーネントのテスト

### Phase 2: GREEN（バックエンド実装）
1. データベーススキーマの作成
2. 認証サービスの実装
   - パスワードハッシュ化
   - JWT生成・検証
   - セッション管理
3. APIエンドポイントの実装
   - ユーザー登録
   - ログイン/ログアウト
   - トークンリフレッシュ

### Phase 3: GREEN（フロントエンド実装）
1. 認証関連のhooksの実装
   - useAuth
   - useSession
2. ページコンポーネントの実装
   - LoginPage
   - RegisterPage
   - ForgotPasswordPage
3. 認証ガードの実装
   - ProtectedRoute
   - AuthProvider

### Phase 4: GREEN（統合テスト）
1. フロントエンドとバックエンドの結合テスト
2. E2Eテストの実装と実行

### Phase 5: REFACTOR
1. コードの重複除去
2. パフォーマンス最適化
3. エラーハンドリングの改善
4. ドキュメントの更新

## 7. 実装に必要な依存関係

### バックエンド
```json
{
  "bcrypt": "^5.1.1",
  "jsonwebtoken": "^9.0.2",
  "@types/bcrypt": "^5.0.2",
  "@types/jsonwebtoken": "^9.0.5"
}
```

### フロントエンド
```json
{
  "react-hook-form": "^7.48.2",
  "zod": "^3.22.4"
}
```

## 8. セキュリティチェックリスト
- [ ] HTTPS通信の強制
- [ ] パスワードの適切なハッシュ化
- [ ] SQLインジェクション対策
- [ ] XSS対策
- [ ] CSRF対策
- [ ] Rate limiting実装
- [ ] セキュアなトークン保存
- [ ] セッションの適切な管理
- [ ] エラーメッセージの適切な制御

## 9. 実装スケジュール（推定）
- Phase 1 (RED): 1日
- Phase 2 (GREEN - Backend): 2日
- Phase 3 (GREEN - Frontend): 2日
- Phase 4 (GREEN - Integration): 1日
- Phase 5 (REFACTOR): 1日

**合計: 7日間**