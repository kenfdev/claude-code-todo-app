# Todo アプリケーション

詳細は [Youtube](https://youtu.be/GFJp1Wa1zMo) で解説しています。

React Router v7 と Cloudflare Workers を使用した、モダンでフルスタックな Todo アプリケーションです。

## 🚀 機能

### 実装済み機能

- ✅ Todo の作成（タイトルとメモ付き）
- ✅ Todo の完了/未完了の切り替え
- ✅ 完了状態によるフィルタリング（未完了/完了タブ）
- ✅ Cloudflare D1 データベースによる永続化
- ✅ サーバーサイドレンダリング（SSR）
- ✅ TypeScript による型安全性
- ✅ 包括的なテストカバレッジ（単体テスト・E2E テスト）

### 未実装機能

- ❌ Todo の編集
- ❌ Todo の削除
- ❌ 期限日や優先度
- ❌ テキスト検索
- ❌ ユーザー認証

## 🛠️ 技術スタック

- **フロントエンド**: React Router v7, React 19, TypeScript
- **データベース**: Cloudflare D1 (SQLite) + Drizzle ORM
- **ランタイム**: Cloudflare Workers
- **スタイリング**: Tailwind CSS
- **テスト**: Vitest（単体テスト）, Playwright（E2E テスト）
- **ビルドツール**: Vite

## 📁 プロジェクト構造

```
todo-app/
├── app/
│   ├── routes/          # React Router v7のファイルベースルート
│   │   ├── home.tsx     # メインのTodoリスト画面
│   │   └── new.tsx      # Todo作成画面
│   ├── components/      # 再利用可能なReactコンポーネント
│   │   ├── TodoList.tsx
│   │   ├── TodoItem.tsx
│   │   ├── TodoCreateForm.tsx
│   │   └── AddTaskButton.tsx
│   ├── lib/            # ユーティリティと共有ロジック
│   └── db/             # データベースクエリとスキーマ
├── migrations/         # D1データベースマイグレーション
├── tests/
│   ├── unit/          # Vitestユニットテスト
│   └── e2e/           # Playwright E2Eテスト
├── public/            # 静的アセット
├── wrangler.toml      # Cloudflare Workers設定
├── vitest.config.ts   # Vitest設定
└── playwright.config.ts # Playwright設定
```

## 🚀 セットアップ

### 前提条件

- Node.js 18 以上
- npm または yarn
- Wrangler CLI（Cloudflare デプロイ用）

### インストール

```bash
# 依存関係のインストール
npm install

# データベースマイグレーションの実行
npm run db:migrate

# 開発サーバーの起動
npm run dev
```

アプリケーションは `http://localhost:5173` で利用可能になります。

## 📝 利用可能なコマンド

### 開発

```bash
npm run dev              # 開発サーバーの起動
npm run dev:local        # ローカルD1での開発サーバー
npm run typecheck        # TypeScriptの型チェック
npm run lint             # ESLintの実行
npm run format           # コードフォーマット
```

### データベース

```bash
npm run db:generate      # マイグレーションの生成
npm run db:migrate       # ローカルマイグレーションの実行
npm run db:migrate:production  # 本番マイグレーションの実行
```

### テスト

```bash
npm run test             # ユニットテストの実行
npm run test:watch       # ウォッチモードでテスト
npm run test:coverage    # カバレッジレポート付きテスト
npm run test:e2e         # E2Eテストの実行
npm run test:e2e:ui      # ヘッドモードでE2Eテスト
npm run test:all         # 全てのテストを実行
```

### ビルド＆デプロイ

```bash
npm run build            # プロダクションビルド
npm run preview          # ビルドのプレビュー
npm run deploy           # 本番環境へのデプロイ（マイグレーション含む）
npm run deploy:staging   # ステージング環境へのデプロイ
```

## 🗄️ データベーススキーマ

```sql
CREATE TABLE todos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  notes TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 デプロイメント

### Cloudflare D1 データベースの作成

```bash
# D1データベースの作成
npx wrangler d1 create todo-db

# wrangler.tomlファイルの更新が必要です
# database_name = "todo-db"
# database_id = "作成されたID"
```

### 本番環境へのデプロイ

```bash
# ワンコマンドデプロイ（ビルド、マイグレーション、デプロイを自動実行）
npm run deploy
```

## 🧪 テスト

このプロジェクトは包括的なテストスイートを含んでいます：

- **ユニットテスト**: コンポーネントとビジネスロジックのテスト
- **E2E テスト**: ユーザーフローの完全なテスト
  - ホームページの表示
  - Todo 作成フロー
  - 完了状態の切り替え
  - タブフィルタリング
  - リロード後の永続性

## 🔧 開発ワークフロー

### 必須の品質チェック

タスクを完了とみなす前に、以下のコマンドが全て成功することを確認してください：

1. `npm run typecheck` - TypeScript の型チェック
2. `npm run test` - 全てのユニットテストの合格
3. `npm run build` - プロダクションビルドの成功

## 📱 スクリーンショット

（TODO: アプリケーションのスクリーンショットを追加）

## 🤝 コントリビューション

プルリクエストを歓迎します。大きな変更の場合は、まず issue を開いて変更内容について議論してください。

## 📄 ライセンス

[MIT](https://choosealicense.com/licenses/mit/)

---

React Router v7 と Cloudflare Workers で構築 ❤️
