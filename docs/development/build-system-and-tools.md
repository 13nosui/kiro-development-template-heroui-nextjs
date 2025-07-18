# ビルドシステムと開発ツール

## 概要

このプロジェクトは、Next.js をベースとした現代的なフロントエンド開発環境を提供します。TypeScript、Tailwind CSS、ESLint、Storybook などの最新ツールを統合し、効率的で品質の高い開発体験を実現しています。

## 技術スタック

### コアフレームワーク

- **Next.js 15.3.5**: React ベースのフルスタックフレームワーク
- **React 19.1.0**: UI ライブラリ
- **TypeScript 5.1.6**: 型安全な JavaScript

### UI・スタイリング

- **HeroUI 2.8.1**: モダンな React コンポーネントライブラリ
- **Tailwind CSS 3.4.1**: ユーティリティファーストの CSS フレームワーク
- **Framer Motion 12.23.3**: アニメーションライブラリ
- **Lucide React 0.525.0**: アイコンライブラリ

### 開発ツール

- **ESLint 8.57.1**: コード品質チェック
- **Storybook 8.6.14**: コンポーネント開発・ドキュメント
- **PostCSS 8.5.6**: CSS 処理
- **Autoprefixer 10.4.21**: CSS ベンダープレフィックス自動付与

## NPM スクリプト

### 開発・ビルド関連

#### `npm run dev`

開発サーバーを起動します。

```bash
npm run dev
```

- ポート: 3000（デフォルト）
- ホットリロード有効
- TypeScript 型チェック有効

#### `npm run build`

本番用ビルドを実行します。

```bash
npm run build
```

- 静的最適化
- コード分割
- 画像最適化
- TypeScript 型チェック

#### `npm run start`

本番ビルドされたアプリケーションを起動します。

```bash
npm run start
```

### コード品質・型チェック

#### `npm run lint`

ESLint を実行してコードを自動修正します。

```bash
npm run lint
```

- 対象: `src/**/*.{ts,tsx,js,jsx}` および `*.{ts,tsx,js,jsx}`
- 自動修正: 有効（`--fix` オプション）

#### `npm run lint:check`

ESLint を実行してコードをチェックします（修正なし）。

```bash
npm run lint:check
```

#### `npm run type-check`

TypeScript の型チェックを実行します。

```bash
npm run type-check
```

- コンパイルなし（`--noEmit` オプション）

### Storybook

#### `npm run storybook`

Storybook 開発サーバーを起動します。

```bash
npm run storybook
```

- ポート: 6006
- コンポーネントの開発・テスト環境

#### `npm run build-storybook`

Storybook の静的ビルドを作成します。

```bash
npm run build-storybook
```

- 出力: `storybook-static/`
- 静的ホスティング用

### セキュリティ関連

#### `npm run security:audit`

依存関係の脆弱性をチェックします（中レベル以上）。

```bash
npm run security:audit
```

#### `npm run security:audit:strict`

依存関係の脆弱性をチェックします（高レベル以上）。

```bash
npm run security:audit:strict
```

#### `npm run security:fix`

依存関係の脆弱性を自動修正します。

```bash
npm run security:fix
```

#### `npm run security:check`

包括的なセキュリティチェックを実行します。

```bash
npm run security:check
```

#### `npm run security:scan`

カスタムセキュリティスキャンを実行します。

```bash
npm run security:scan
```

#### `npm run security:full`

すべてのセキュリティチェックを実行します。

```bash
npm run security:full
```

### 環境変数関連

#### `npm run env:check`

基本的な環境変数の存在をチェックします。

```bash
npm run env:check
```

#### `npm run env:validate`

環境変数の詳細な検証を実行します。

```bash
npm run env:validate
```

### ドキュメント生成

#### `npm run docs:generate`

プロジェクトドキュメントを生成します（詳細ログ付き）。

```bash
npm run docs:generate
```

#### `npm run docs:generate:quiet`

プロジェクトドキュメントを生成します（簡潔ログ）。

```bash
npm run docs:generate:quiet
```

#### `npm run docs:clean`

生成されたドキュメントを削除します。

```bash
npm run docs:clean
```

## 設定ファイル

### Next.js 設定 (`next.config.js`)

```javascript
const nextConfig = {
  // 画像最適化設定
  images: {
    domains: ["firebasestorage.googleapis.com"],
  },

  // セキュリティヘッダー
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        // その他のセキュリティヘッダー
      ],
    },
  ],

  // Webpack カスタマイズ
  webpack(config) {
    // SVG ローダー設定
    // パスエイリアス設定
    return config;
  },
};
```

### TypeScript 設定 (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### ESLint 設定 (`eslint.config.mjs`)

```javascript
export default [
  // TypeScript ファイル用設定
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptParser,
    },
    plugins: {
      "@typescript-eslint": typescript,
      react: react,
      "react-hooks": reactHooks,
      "@next/next": next,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];
```

### Tailwind CSS 設定 (`tailwind.config.js`)

```javascript
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,mjs}",
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui()],
};
```

### PostCSS 設定 (`postcss.config.js`)

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

## Storybook 設定

### メイン設定 (`.storybook/main.ts`)

```typescript
const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
  ],
  framework: {
    name: "@storybook/nextjs",
  },
  docs: {
    autodocs: "tag",
  },
};
```

### プレビュー設定 (`.storybook/preview.tsx`)

```typescript
export const decorators = [
  (Story) => (
    <HeroUIProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Story />
      </div>
    </HeroUIProvider>
  ),
];
```

## 開発サーバー設定

### ホットリロード

- ファイル変更の自動検出
- ブラウザの自動リフレッシュ
- TypeScript 型エラーのリアルタイム表示

### 開発用プロキシ

- API エンドポイントのプロキシ設定
- CORS 問題の回避

### 環境変数

開発環境では以下の環境変数が利用可能：

- `NODE_ENV=development`
- `.env.local` ファイルの自動読み込み
- `NEXT_PUBLIC_*` プレフィックスでクライアント側変数

## ビルド最適化

### コード分割

- 自動的なページレベル分割
- 動的インポートによるコンポーネント分割
- 共通ライブラリの分離

### 静的最適化

- 静的ページの事前生成
- 画像の自動最適化
- CSS の最小化

### バンドル分析

```bash
# バンドルサイズ分析
npm run build
npx @next/bundle-analyzer
```

## 品質保証ツール

### 型チェック

- TypeScript による静的型チェック
- 厳密な型設定による品質向上

### リンティング

- ESLint による構文チェック
- React/Next.js 固有のルール
- アクセシビリティチェック

### セキュリティ

- 依存関係の脆弱性スキャン
- ソースコードのセキュリティチェック
- 環境変数の検証

## トラブルシューティング

### よくある問題

#### ビルドエラー

```bash
# 型エラーの確認
npm run type-check

# リンティングエラーの修正
npm run lint
```

#### 依存関係の問題

```bash
# node_modules の再インストール
rm -rf node_modules package-lock.json
npm install
```

#### キャッシュの問題

```bash
# Next.js キャッシュのクリア
rm -rf .next
npm run build
```

### パフォーマンス最適化

#### バンドルサイズの削減

- 不要な依存関係の削除
- 動的インポートの活用
- Tree shaking の最適化

#### ビルド時間の短縮

- TypeScript の増分コンパイル
- ESLint のキャッシュ活用
- 並列処理の最適化

## 継続的インテグレーション

### GitHub Actions

- 自動ビルド・テスト
- セキュリティスキャン
- 依存関係の更新チェック

### 品質ゲート

- TypeScript 型チェック必須
- ESLint エラーゼロ必須
- セキュリティ脆弱性チェック

## 開発ワークフロー

### 推奨開発手順

1. `npm run dev` で開発サーバー起動
2. コード変更
3. `npm run lint` でコード品質チェック
4. `npm run type-check` で型チェック
5. `npm run build` でビルド確認
6. コミット・プッシュ

### コード品質維持

- 定期的な依存関係更新
- セキュリティスキャンの実行
- パフォーマンス監視
