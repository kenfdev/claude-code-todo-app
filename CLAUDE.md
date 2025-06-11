# Claude Code プロジェクト設定

## プロジェクト概要

TypeScript + React Router v7 + SQLite を使用したシンプルなToDo Webアプリケーションプロジェクト。Cloudflareにデプロイします。

## 技術スタック

- **言語**: TypeScript (厳格な型安全性を保持)
- **フレームワーク**: React Router v7
- **テストフレームワーク**: Vitest
- **e2eテストフレームワーク**: Playwright
- **データベース**: SQLite (development/production両対応)。productionではD1を使用。
- **ORM**: Drizzle ORM
- **デプロイ**: Cloudflare Pages/Workers
- **パッケージマネージャー**: npm

## コーディング規約

### TypeScript
- 厳格な型定義を使用（`strict: true`）
- `any`型の使用を避ける
- インターフェースとタイプエイリアスを適切に使い分ける
- ファイル名はkebab-case（例: `user-profile.ts`）

### React
- 関数コンポーネントを優先
- PropTypesの代わりにTypeScriptの型定義を使用
- カスタムフックは`use`プレフィックスを使用
- コンポーネント名はPascalCase

### データベース
- SQLiteスキーマは`migrations/`フォルダで管理
- クエリはTypeScriptで型安全に記述
- データベース接続のプールを適切に管理

## フォルダ構造

```
src/
├── components/         # 再利用可能なUIコンポーネント
├── pages/             # ページコンポーネント
├── hooks/             # カスタムフック
├── utils/             # ユーティリティ関数
├── types/             # TypeScript型定義
├── services/          # API/データベースサービス
└── migrations/        # データベースマイグレーション
```

## ビルドコマンド

- `npm run dev`: 開発サーバー起動
- `npm run build`: プロダクションビルド
- `npm run typecheck`: TypeScript型チェック
- `npm run preview`: ビルド後のプレビュー
- `npm run deploy`: Cloudflareデプロイ

## テストコマンド

- `npm test`: 全てのテストを実行
- `npm run test:watch`: ウォッチモードでテスト実行
- `npm run test:coverage`: カバレッジレポート生成
- `npm run test:unit`: ユニットテストのみ実行
- `npm run test:e2e`: E2Eテストのみ実行

## 品質保証

### 必須チェック項目
- TypeScript型エラーがないこと
- ESLintルールに準拠していること
- Prettierでフォーマット済みであること
- 全てのテストがパスしていること
- SQLiteクエリが最適化されていること

### テスト戦略

#### 基本方針
- **統合テスト優先**: 実際のユーザー動作をシミュレートする統合テストを中心に
- **モック最小化**: 外部API、時間依存処理など、制御できない要素のみモック化
- **振る舞い重視**: 実装の詳細ではなく、実際の機能動作を検証
- **テスト数より質**: 少数の効果的なテストで高いカバレッジを実現

#### テストの種類と優先順位
1. **統合テスト（最優先）**
   - 実際のデータベースを使用（インメモリSQLite推奨）
   - APIエンドポイントの実際の動作確認
   - 複数コンポーネント間の連携動作
   
2. **E2Eテスト（重要）**
   - Playwrightによる主要ユーザーフローの検証
   - 登録→ログイン→操作→ログアウトなどの一連の流れ
   
3. **単体テスト（限定的）**
   - 純粋関数のユーティリティのみ
   - 複雑なビジネスロジックのみ

#### アンチパターン（避けるべきテスト）
- モックの呼び出し回数を確認するテスト
- 実装の詳細（内部メソッドの引数など）を検証するテスト
- ライブラリの動作を確認するテスト
- 同じ内容を異なる角度から繰り返すテスト

#### 推奨テスト例
```typescript
// ❌ 悪い例：実装の詳細をテスト
it("should call hashPassword with salt", () => {
  expect(mockHashPassword).toHaveBeenCalledWith(password, salt);
});

// ✅ 良い例：実際の振る舞いをテスト
it("登録したユーザーが同じ認証情報でログインできる", async () => {
  await authService.register(userData);
  const result = await authService.login(credentials);
  expect(result.accessToken).toBeDefined();
});
```

## Cloudflareデプロイ設定

### 環境設定
- `wrangler.toml`でWorker設定を管理
- 環境変数は`CLOUDFLARE_`プレフィックスを使用
- SQLiteデータベースはCloudflare D1を使用

### デプロイ前チェックリスト
1. TypeScript型チェック（`npm run typecheck`）
2. 全テストパス（`npm test`）
3. プロダクションビルド成功（`npm run build`）
4. パフォーマンス最適化確認
5. SQLiteマイグレーション適用確認

## AIアシスタント指示

### 実装アプローチ
- **"think"キーワード使用**: 複雑な実装前に詳細な検討が必要な場合
- **段階的実装**: 大きな機能は小さな単位に分割
- **テスト駆動開発**: 新機能実装前にテストを先に書く
  - 必ずテストが失敗することを先に確認し、その後実装すること
  - **重要**: モックは最小限に留め、実際の振る舞いをテストする
  - 実装の詳細（メソッドの呼び出し回数、引数など）ではなく、ユーザーから見た機能の動作を検証
  - テスト対象自体をモック化することは絶対に避ける

### コード生成時の注意点
- 必ずTypeScript型定義を含める
- エラーハンドリングを適切に実装
- SQLiteクエリは準備済みステートメントを使用
- React Router v7の最新APIを使用
- パフォーマンス最適化を考慮（memo, useMemo, useCallback）

### 禁止事項
- `any`型の多用
- インラインスタイルの使用
- 直接的なDOM操作
- 未処理のPromise
- SQLインジェクション脆弱性のあるクエリ

## プロジェクト固有の要件

### パフォーマンス
- バンドルサイズ最適化
- Cloudflare Workers環境での高速実行
- SQLiteクエリの最適化
- React Router v7のloaderとactionを活用

### セキュリティ
- SQLiteクエリでの準備済みステートメント使用
- 入力値の適切なバリデーション
- Cloudflare環境でのセキュリティヘッダー設定

### 開発体験
- 型安全性の確保
- 開発時の高速なHMR
- 明確なエラーメッセージ
- 包括的な開発ドキュメント

## 効果的なテスト作成のガイドライン

### テスト作成時の判断基準
1. **このテストはリファクタリング時に壊れるか？**
   - Yes → 実装の詳細に依存している可能性大。見直しが必要
   - No → 良いテスト

2. **このテストは実際のユーザー価値を検証しているか？**
   - Yes → 良いテスト
   - No → 削除候補

3. **このテストのためだけにモックを作成しているか？**
   - Yes → テスト方法の見直しが必要
   - No → 適切

### 推奨されるテスト構成比率
- 統合テスト: 70%
- E2Eテスト: 20%
- 単体テスト: 10%

## メモリ

- ドキュメントの出力は必ず日本語で行うこと
- コミットメッセージはConventional Commitの形式で行うこと

---

**重要**: このファイルはプロジェクトの進行に応じて更新してください。新しい要件や制約が生じた場合は、速やかに反映させてください。