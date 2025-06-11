# テスト戦略改善提案 - PR #4

## 現状の問題点

現在のテストには以下の問題があります：

1. **過度なモック使用**: 実装の詳細に依存しすぎており、リファクタリング時に壊れやすい
2. **実際の動作検証不足**: モックの呼び出し回数や引数を確認するだけで、実際の機能を検証していない
3. **テストの重複**: 同じような内容を異なる角度から繰り返しテストしている

## 改善提案

### 1. 統合テスト中心のアプローチ

**Before (モック過多)**:
```typescript
// ❌ 実装の詳細に依存したテスト
it("should call hashPassword with correct parameters", async () => {
  const mockHashPassword = vi.fn().mockResolvedValue("hashed");
  const authService = new AuthService(mockDb);
  
  await authService.register(userData);
  
  expect(mockHashPassword).toHaveBeenCalledWith("password123", expect.any(String));
  expect(mockHashPassword).toHaveBeenCalledTimes(1);
});
```

**After (実際の動作を検証)**:
```typescript
// ✅ 実際の動作を検証する統合テスト
it("should register user and allow login with same credentials", async () => {
  const authService = new AuthService(realDb); // 実際のDBまたはインメモリDB
  
  // 登録
  const user = await authService.register({
    email: "test@example.com",
    password: "password123",
    firstName: "Test",
    lastName: "User"
  });
  
  // 同じ認証情報でログイン可能
  const { accessToken } = await authService.login({
    username: "test@example.com",
    password: "password123"
  });
  
  expect(user.email).toBe("test@example.com");
  expect(accessToken).toBeDefined();
});
```

### 2. 削減すべきテストケース

以下のテストは削除または統合を推奨：

#### 削除推奨
- `hashPassword`の内部実装をテストするケース（Web Crypto APIの動作確認は不要）
- JWT生成・検証の詳細なテスト（ライブラリの責務）
- モックの呼び出し回数を確認するだけのテスト

#### 統合推奨
- 各APIエンドポイントの個別テスト → ユーザーフロー全体をテスト
- 各バリデーションエラーの個別テスト → 代表的なケースのみ

### 3. 効果的なテストに絞る

**必須テスト (約15-20ケース)**:

```typescript
// 1. 認証フロー統合テスト
describe("Authentication Flow", () => {
  it("完全な認証フロー: 登録→ログイン→トークンリフレッシュ→ログアウト", async () => {
    // 実際のフローを通しでテスト
  });
  
  it("無効な認証情報でのログイン失敗", async () => {
    // セキュリティの観点で重要
  });
  
  it("トークン有効期限切れ時の適切な処理", async () => {
    // 実際の時間経過をシミュレート
  });
});

// 2. React Hooks統合テスト
describe("useAuth Hook", () => {
  it("ログイン後の状態管理とlocalStorage同期", () => {
    // 実際のブラウザ環境をシミュレート
  });
  
  it("複数タブでのセッション同期", () => {
    // storage eventのシミュレーション
  });
});

// 3. セキュリティテスト
describe("Security", () => {
  it("SQLインジェクション対策の確認", async () => {
    // 実際の攻撃パターンでテスト
  });
  
  it("同一ユーザーの重複登録防止", async () => {
    // 実際のDB制約の動作確認
  });
});

// 4. エラーハンドリング
describe("Error Handling", () => {
  it("ネットワークエラー時の適切なフォールバック", async () => {
    // 実際のネットワークエラーをシミュレート
  });
});
```

### 4. E2Eテストへの移行

UIコンポーネントのテストは、Playwrightを使用したE2Eテストに移行：

```typescript
// ❌ 削除: 細かいコンポーネントテスト
it("renders login form with email input", () => { ... });
it("shows error message on invalid email", () => { ... });
it("disables submit button while loading", () => { ... });

// ✅ 代替: E2Eテスト
test("ユーザー登録からログインまでの完全なフロー", async ({ page }) => {
  await page.goto("/register");
  
  // 登録フォーム入力
  await page.fill('[name="email"]', "test@example.com");
  await page.fill('[name="password"]', "SecurePass123!");
  await page.fill('[name="firstName"]', "Test");
  await page.fill('[name="lastName"]', "User");
  
  await page.click('button[type="submit"]');
  
  // ホームページへのリダイレクト確認
  await expect(page).toHaveURL("/");
  
  // ログアウトして再ログイン
  await page.click('button:has-text("ログアウト")');
  await page.goto("/login");
  
  await page.fill('[name="email"]', "test@example.com");
  await page.fill('[name="password"]', "SecurePass123!");
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL("/");
});
```

### 5. テスト環境の改善

```typescript
// test/setup.ts
import { beforeAll, afterAll, beforeEach } from 'vitest';
import Database from 'better-sqlite3';

let db: Database.Database;

beforeAll(() => {
  // インメモリDBを使用
  db = new Database(':memory:');
  // スキーマ適用
  db.exec(readFileSync('./database/schema.sql', 'utf-8'));
});

beforeEach(() => {
  // 各テスト前にDBをクリーンアップ
  db.exec('DELETE FROM users');
  db.exec('DELETE FROM sessions');
});

afterAll(() => {
  db.close();
});
```

## 期待される効果

1. **テスト実行時間の短縮**: 50件 → 15-20件で約60%削減
2. **保守性の向上**: 実装変更時のテスト修正が最小限
3. **信頼性の向上**: 実際の動作を検証
4. **開発速度の向上**: テスト作成・修正の負担軽減

## まとめ

現在のテストは「テストのためのテスト」になっており、実際の品質保証には寄与していない部分が多いです。統合テストとE2Eテストを中心とした戦略に切り替えることで、より少ないテストでより高い品質保証を実現できます。

**推奨アクション**:
1. 単体テストを統合テストに置き換える
2. UIテストをE2Eテストに移行
3. モックは最小限に留める（外部API、時間依存処理のみ）
4. 実際のユーザーシナリオに基づいたテストを優先