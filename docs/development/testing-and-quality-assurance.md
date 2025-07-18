# テストと品質保証

## 概要

このプロジェクトでは、コードの品質と信頼性を確保するために、包括的なテスト戦略と品質保証プロセスを実装しています。TypeScript による静的型チェック、ESLint によるコード品質チェック、Storybook によるコンポーネントテスト、そして Semgrep による静的セキュリティ分析を組み合わせた多層的なアプローチを採用しています。

## テスト戦略

### 1. 静的型チェック（TypeScript）

#### 設定概要

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true
  }
}
```

#### 実行方法

```bash
# 型チェックのみ実行
npm run type-check

# 開発サーバーでリアルタイム型チェック
npm run dev
```

#### 品質基準

- **厳密モード**: すべての TypeScript 厳密オプションを有効化
- **null/undefined チェック**: 配列アクセスでの undefined チェック必須
- **型の完全性**: オプショナルプロパティの厳密な型チェック
- **関数の戻り値**: すべてのコードパスで戻り値必須

### 2. コード品質チェック（ESLint）

#### 設定概要

```javascript
// eslint.config.mjs
export default [
  {
    files: ["**/*.ts", "**/*.tsx"],
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

#### 実行方法

```bash
# リンティング + 自動修正
npm run lint

# チェックのみ（修正なし）
npm run lint:check
```

#### チェック項目

- **TypeScript ルール**: 未使用変数、型安全性
- **React ルール**: Hooks の正しい使用法
- **Next.js ルール**: フレームワーク固有のベストプラクティス
- **アクセシビリティ**: 基本的な a11y ルール

### 3. コンポーネントテスト（Storybook）

#### 設定概要

```typescript
// .storybook/main.ts
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

#### Story 作成パターン

```typescript
// Example.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Component> = {
  title: "Category/ComponentName",
  component: Component,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    prop: {
      control: "text",
      description: "Prop description",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    prop: "default value",
  },
};

export const Variant: Story = {
  args: {
    prop: "variant value",
  },
};
```

#### 実行方法

```bash
# Storybook 開発サーバー起動
npm run storybook

# Storybook 静的ビルド
npm run build-storybook
```

#### テスト観点

- **視覚的回帰テスト**: コンポーネントの見た目の変化
- **インタラクションテスト**: ユーザー操作のシミュレーション
- **アクセシビリティテスト**: a11y addon による自動チェック
- **レスポンシブテスト**: 異なる画面サイズでの表示確認

### 4. セキュリティテスト（Semgrep）

#### 設定概要

```yaml
# .semgrep.yml
rules:
  - id: no-console-error-in-production
    pattern: console.error(...)
    message: console.error() should not be used in production code
    severity: WARNING

  - id: api-token-in-client-code
    pattern: process.env.FIGMA_ACCESS_TOKEN
    message: API tokens should only be used in server-side code
    severity: ERROR
```

#### 実行方法

```bash
# セキュリティスキャン実行
npm run security:scan

# 包括的セキュリティチェック
npm run security:full
```

#### チェック項目

- **機密情報の漏洩**: API キー、トークンのクライアント側露出
- **セキュリティ脆弱性**: XSS、インジェクション攻撃の可能性
- **データ保存**: localStorage/sessionStorage の不適切な使用
- **環境変数**: 適切な検証とエラーハンドリング

## 品質保証フレームワーク

### 1. 継続的インテグレーション（CI/CD）

#### GitHub Actions ワークフロー

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    steps:
      - name: Run TypeScript type checking
        run: npm run type-check

      - name: Run ESLint (check only)
        run: npm run lint:check

      - name: Build application
        run: npm run build

      - name: Run Storybook build
        run: npm run build-storybook

  security:
    steps:
      - name: Run comprehensive security checks
        run: npm run security:scan

      - name: Run security audit (strict)
        run: npm audit --audit-level high

  semgrep:
    steps:
      - name: Run Semgrep SAST scan
        run: semgrep ci --config p/security-audit
```

#### 品質ゲート

- **TypeScript 型チェック**: エラーゼロ必須
- **ESLint チェック**: エラーゼロ必須
- **ビルド成功**: 本番ビルドの成功必須
- **セキュリティ監査**: 高レベル脆弱性ゼロ必須

### 2. 依存関係管理（Dependabot）

#### 自動更新設定

```yaml
# .github/dependabot.yml
updates:
  - package-ecosystem: "npm"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    allow:
      - dependency-type: "direct"
      - dependency-type: "indirect"
```

#### セキュリティ監視

- **脆弱性スキャン**: 週次自動チェック
- **依存関係更新**: セキュリティパッチの自動適用
- **ライセンス確認**: 許可されたライセンスのみ使用

## テストガイドライン

### 1. コンポーネントテスト

#### Story 作成基準

```typescript
// 必須 Story パターン
export const Default: Story = {
  args: {
    // デフォルト状態
  },
};

export const Loading: Story = {
  args: {
    // ローディング状態
  },
};

export const Error: Story = {
  args: {
    // エラー状態
  },
};

export const Empty: Story = {
  args: {
    // 空状態
  },
};
```

#### テスト観点

- **状態バリエーション**: デフォルト、ローディング、エラー、空状態
- **プロパティバリエーション**: 必須・オプションプロパティの組み合わせ
- **インタラクション**: クリック、フォーカス、キーボード操作
- **レスポンシブ**: モバイル、タブレット、デスクトップ

### 2. API テスト

#### エンドポイントテスト

```typescript
// API ルートのテストパターン
describe("API Endpoint", () => {
  test("正常なリクエスト", async () => {
    // 正常系のテスト
  });

  test("不正なパラメータ", async () => {
    // バリデーションエラーのテスト
  });

  test("認証エラー", async () => {
    // 認証失敗のテスト
  });

  test("レート制限", async () => {
    // レート制限のテスト
  });
});
```

#### テスト観点

- **正常系**: 期待される入力での正常動作
- **異常系**: 不正入力でのエラーハンドリング
- **境界値**: 最小・最大値での動作
- **セキュリティ**: 認証・認可・入力検証

### 3. セキュリティテスト

#### 手動チェックリスト

- [ ] 機密情報のハードコーディングなし
- [ ] 環境変数の適切な検証
- [ ] XSS 対策の実装
- [ ] CSRF 対策の実装
- [ ] 入力値の適切なサニタイゼーション
- [ ] API エンドポイントの認証・認可
- [ ] セキュリティヘッダーの設定
- [ ] HTTPS の強制

## コードレビューチェックリスト

### 1. 機能性

- [ ] 要件を満たしている
- [ ] エッジケースが考慮されている
- [ ] エラーハンドリングが適切
- [ ] パフォーマンスが考慮されている

### 2. コード品質

- [ ] TypeScript の型が適切に定義されている
- [ ] ESLint ルールに準拠している
- [ ] 命名規則が一貫している
- [ ] コメントが適切に記述されている

### 3. テスト

- [ ] 適切なテストが追加されている
- [ ] Storybook Story が作成されている
- [ ] テストカバレッジが十分
- [ ] テストが意味のあるケースをカバーしている

### 4. セキュリティ

- [ ] 機密情報が適切に保護されている
- [ ] 入力値の検証が実装されている
- [ ] 認証・認可が適切に実装されている
- [ ] セキュリティベストプラクティスに準拠している

### 5. ドキュメント

- [ ] README が更新されている
- [ ] API ドキュメントが更新されている
- [ ] コンポーネントドキュメントが作成されている
- [ ] 変更内容が適切に説明されている

## 品質メトリクス

### 1. コード品質指標

- **TypeScript カバレッジ**: 100%（型定義の完全性）
- **ESLint エラー**: 0 件
- **ESLint 警告**: 最小限に抑制
- **ビルド成功率**: 100%

### 2. セキュリティ指標

- **高レベル脆弱性**: 0 件
- **中レベル脆弱性**: 最小限に抑制
- **Semgrep エラー**: 0 件
- **依存関係の最新性**: 90%以上

### 3. テスト指標

- **Storybook カバレッジ**: 主要コンポーネント 100%
- **ビジュアル回帰テスト**: 自動化
- **アクセシビリティスコア**: 95%以上
- **パフォーマンススコア**: 90%以上

## トラブルシューティング

### 1. TypeScript エラー

#### よくあるエラー

```typescript
// ❌ 型エラー例
const value = data.property; // data が undefined の可能性

// ✅ 修正例
const value = data?.property ?? defaultValue;
```

#### 解決方法

- オプショナルチェーニング（`?.`）の使用
- Null 合体演算子（`??`）の使用
- 型ガードの実装
- 適切な型定義の追加

### 2. ESLint エラー

#### よくあるエラー

```typescript
// ❌ ESLint エラー例
const [data, setData] = useState(); // 依存関係の警告

// ✅ 修正例
const [data, setData] = useState<DataType | null>(null);
```

#### 解決方法

- 依存関係配列の適切な設定
- 未使用変数の削除または `_` プレフィックス
- React Hooks ルールの遵守
- 型注釈の追加

### 3. Storybook エラー

#### よくあるエラー

```typescript
// ❌ Story エラー例
export const Example = {
  args: {
    invalidProp: "value", // 存在しないプロパティ
  },
};

// ✅ 修正例
export const Example: Story = {
  args: {
    validProp: "value",
  },
};
```

#### 解決方法

- Story の型定義の確認
- コンポーネントプロパティの確認
- Storybook 設定の見直し
- アドオンの設定確認

### 4. セキュリティエラー

#### よくあるエラー

```typescript
// ❌ セキュリティエラー例
const apiKey = process.env.FIGMA_ACCESS_TOKEN; // クライアント側で使用

// ✅ 修正例
// サーバーサイドでのみ使用
export async function getServerSideProps() {
  const apiKey = process.env.FIGMA_ACCESS_TOKEN;
  // ...
}
```

#### 解決方法

- 機密情報のサーバーサイド限定使用
- 環境変数の適切な検証
- 入力値のサニタイゼーション
- セキュリティヘッダーの設定

## ベストプラクティス

### 1. テスト駆動開発

1. **Red**: 失敗するテストを書く
2. **Green**: テストを通すコードを書く
3. **Refactor**: コードをリファクタリング

### 2. 継続的品質改善

- 定期的なコードレビュー
- 品質メトリクスの監視
- 技術的負債の管理
- セキュリティ脆弱性の迅速な対応

### 3. 自動化の推進

- CI/CD パイプラインの活用
- 自動テストの拡充
- 品質チェックの自動化
- セキュリティスキャンの定期実行

### 4. ドキュメント文化

- コードの自己文書化
- Storybook による視覚的ドキュメント
- API ドキュメントの維持
- 変更履歴の記録

## 今後の改善計画

### 1. テスト拡充

- [ ] ユニットテストフレームワークの導入
- [ ] インテグレーションテストの追加
- [ ] E2E テストの実装
- [ ] パフォーマンステストの導入

### 2. 品質向上

- [ ] コードカバレッジの測定
- [ ] 複雑度メトリクスの監視
- [ ] 技術的負債の可視化
- [ ] 品質ダッシュボードの構築

### 3. セキュリティ強化

- [ ] 動的セキュリティテストの導入
- [ ] 脆弱性管理プロセスの確立
- [ ] セキュリティ教育の実施
- [ ] インシデント対応手順の策定
