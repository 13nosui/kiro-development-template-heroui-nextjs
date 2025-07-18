# 開発者ガイド - オンボーディング & コントリビューション

## 概要

このガイドは、AI Development Template プロジェクトに参加する開発者のためのオンボーディングとコントリビューションガイドです。初回セットアップから日常的な開発ワークフロー、コーディング規約、トラブルシューティングまで、開発に必要なすべての情報を提供します。

## 🚀 クイックスタート

### 前提条件

以下のツールがインストールされていることを確認してください：

- **Node.js**: 20.x 以上
- **npm**: 10.x 以上（または pnpm 8.x 以上）
- **Git**: 2.40 以上
- **VS Code**: 推奨エディタ（拡張機能含む）

### 1. プロジェクトのセットアップ

#### リポジトリのクローン

```bash
# HTTPSでクローン
git clone https://github.com/13nosui/kiro-development-template-heroui-nextjs.git
cd kiro-development-template-heroui-nextjs

# SSHでクローン（推奨）
git clone git@github.com:13nosui/kiro-development-template-heroui-nextjs.git
cd kiro-development-template-heroui-nextjs
```

#### 依存関係のインストール

```bash
# npm を使用
npm install

# または pnpm を使用（推奨）
pnpm install
```

#### 環境変数の設定

```bash
# 環境変数テンプレートをコピー
cp .env.example .env.local

# 環境変数を編集
code .env.local
```

**重要**: 以下の環境変数は必ず設定してください：

```env
# Firebase設定（必須）
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890abcdef

# セキュリティ設定（必須）
ENCRYPTION_KEY=32文字以上のランダム文字列
JWT_SECRET=16文字以上のランダム文字列
CSRF_SECRET=16文字以上のランダム文字列

# 外部サービス（オプション）
FIGMA_ACCESS_TOKEN=figd_your-figma-access-token
SEMGREP_APP_TOKEN=your-semgrep-token
```

#### 環境変数の検証

```bash
# 基本チェック
npm run env:check

# 詳細検証
npm run env:validate
```

### 2. 開発サーバーの起動

```bash
# Next.js 開発サーバー
npm run dev

# Storybook（コンポーネント開発）
npm run storybook
```

ブラウザで以下の URL にアクセス：

- **アプリケーション**: http://localhost:3000
- **Storybook**: http://localhost:6006

### 3. 初回セットアップの確認

```bash
# TypeScript 型チェック
npm run type-check

# ESLint チェック
npm run lint:check

# ビルドテスト
npm run build
```

すべてのコマンドがエラーなく実行されれば、セットアップ完了です！

## 🛠 開発環境の設定

### VS Code 推奨拡張機能

以下の拡張機能をインストールしてください：

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json",
    "yzhang.markdown-all-in-one",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

### VS Code 設定

`.vscode/settings.json` を作成：

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["classnames\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

### Git 設定

```bash
# コミット署名の設定（推奨）
git config --global commit.gpgsign true
git config --global user.signingkey YOUR_GPG_KEY

# プルリクエスト用のブランチ設定
git config --global pull.rebase true
git config --global branch.autosetupmerge always
git config --global branch.autosetuprebase always
```

## 📋 開発ワークフロー

### 1. 新機能開発の流れ

#### ブランチ作成

```bash
# メインブランチから最新を取得
git checkout main
git pull origin main

# 新機能ブランチを作成
git checkout -b feature/your-feature-name

# または修正の場合
git checkout -b fix/issue-description
```

#### 開発作業

```bash
# 開発サーバー起動
npm run dev

# 別ターミナルでStorybook起動（UI開発時）
npm run storybook

# 型チェック（開発中に随時実行）
npm run type-check

# リンティング（コミット前に実行）
npm run lint
```

#### コミット前チェック

```bash
# 全体的な品質チェック
npm run lint
npm run type-check
npm run build

# セキュリティチェック
npm run security:scan
```

#### コミット

```bash
# ステージング
git add .

# コミット（Conventional Commits形式）
git commit -m "feat: add new authentication feature

- Implement OAuth2 integration
- Add user profile management
- Update security middleware
- Add comprehensive tests

Closes #123"
```

#### プッシュとプルリクエスト

```bash
# ブランチをプッシュ
git push origin feature/your-feature-name

# GitHub CLIを使用してPR作成（オプション）
gh pr create --title "feat: add new authentication feature" --body "Description of changes"
```

### 2. コードレビュープロセス

#### プルリクエスト作成時

- [ ] 明確なタイトルと説明
- [ ] 関連する Issue の参照
- [ ] スクリーンショット（UI 変更の場合）
- [ ] テスト結果の確認
- [ ] セキュリティチェックの通過

#### レビュー観点

- [ ] コードの品質と可読性
- [ ] TypeScript 型定義の適切性
- [ ] セキュリティ考慮事項
- [ ] パフォーマンスへの影響
- [ ] テストの網羅性
- [ ] ドキュメントの更新

### 3. リリースプロセス

#### バージョン管理

```bash
# パッチリリース（バグ修正）
npm version patch

# マイナーリリース（新機能）
npm version minor

# メジャーリリース（破壊的変更）
npm version major
```

#### デプロイメント

```bash
# プロダクションビルド
npm run build

# Vercelデプロイ
vercel --prod

# または自動デプロイ（mainブランチマージ時）
git checkout main
git merge feature/your-feature-name
git push origin main
```

## 📝 コーディング規約

### 1. TypeScript 規約

#### 型定義

```typescript
// ✅ 良い例
interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: Date;
  preferences: UserPreferences;
}

// ❌ 悪い例
interface UserProfile {
  id: any;
  email: string;
  displayName?: string;
  createdAt: string;
  preferences: any;
}
```

#### 関数定義

```typescript
// ✅ 良い例
export async function createUser(
  userData: CreateUserRequest
): Promise<ApiResponse<User>> {
  // 実装
}

// ❌ 悪い例
export async function createUser(userData: any): Promise<any> {
  // 実装
}
```

#### エラーハンドリング

```typescript
// ✅ 良い例
try {
  const result = await apiCall();
  return { success: true, data: result };
} catch (error) {
  const apiError = error as ApiError;
  return {
    success: false,
    error: apiError.message,
    code: apiError.code,
  };
}

// ❌ 悪い例
try {
  const result = await apiCall();
  return result;
} catch (error) {
  console.error(error);
  return null;
}
```

### 2. React コンポーネント規約

#### コンポーネント構造

```typescript
// ✅ 良い例
interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
}: ButtonProps) {
  return (
    <button
      className={cn(
        "font-medium rounded-lg transition-colors",
        {
          "bg-blue-600 text-white hover:bg-blue-700": variant === "primary",
          "bg-gray-200 text-gray-900 hover:bg-gray-300":
            variant === "secondary",
          "bg-red-600 text-white hover:bg-red-700": variant === "danger",
        },
        {
          "px-2 py-1 text-sm": size === "sm",
          "px-4 py-2": size === "md",
          "px-6 py-3 text-lg": size === "lg",
        }
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

#### Hooks の使用

```typescript
// ✅ 良い例
export function useUserProfile(userId: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const result = await getUserProfile(userId);
        setProfile(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [userId]);

  return { profile, loading, error };
}
```

### 3. CSS/Tailwind 規約

#### クラス名の順序

```typescript
// ✅ 良い例（レイアウト → 外観 → インタラクション）
<div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
```

#### レスポンシブデザイン

```typescript
// ✅ 良い例
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

#### カスタムスタイル

```typescript
// ✅ 良い例（cn関数を使用）
import { cn } from '@/lib/utils';

<button className={cn(
  'base-button-styles',
  {
    'active-styles': isActive,
    'disabled-styles': disabled,
  },
  className
)}>
```

### 4. ファイル・ディレクトリ構造

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # ルートグループ
│   ├── api/               # API Routes
│   ├── globals.css        # グローバルスタイル
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # ホームページ
├── components/            # 再利用可能コンポーネント
│   ├── ui/               # 基本UIコンポーネント
│   ├── forms/            # フォーム関連
│   └── layout/           # レイアウト関連
├── hooks/                # カスタムHooks
├── lib/                  # ユーティリティ・設定
│   ├── api-client.ts     # API通信
│   ├── auth-context.tsx  # 認証コンテキスト
│   ├── firebase.ts       # Firebase設定
│   ├── security.ts       # セキュリティ機能
│   ├── validation.ts     # バリデーション
│   └── utils.ts          # 汎用ユーティリティ
├── types/                # 型定義
└── stories/              # Storybook
```

### 5. 命名規則

#### ファイル名

- **コンポーネント**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase (`useUserProfile.ts`)
- **ユーティリティ**: kebab-case (`api-client.ts`)
- **型定義**: kebab-case (`user-types.ts`)

#### 変数・関数名

```typescript
// ✅ 良い例
const userName = "john_doe";
const isAuthenticated = true;
const userProfiles = [];

function getUserProfile() {}
function handleSubmit() {}
function validateEmail() {}

// ❌ 悪い例
const user_name = "john_doe";
const authenticated = true;
const profiles = [];

function getProfile() {}
function submit() {}
function validate() {}
```

## 🧪 テスト規約

### 1. テストファイル構造

```typescript
// UserProfile.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UserProfile } from "./UserProfile";

describe("UserProfile", () => {
  const mockUser = {
    id: "1",
    email: "test@example.com",
    displayName: "Test User",
  };

  beforeEach(() => {
    // セットアップ
  });

  afterEach(() => {
    // クリーンアップ
  });

  it("should render user information correctly", () => {
    render(<UserProfile user={mockUser} />);

    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("should handle edit button click", async () => {
    const onEdit = jest.fn();
    render(<UserProfile user={mockUser} onEdit={onEdit} />);

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));

    await waitFor(() => {
      expect(onEdit).toHaveBeenCalledWith(mockUser);
    });
  });
});
```

### 2. Storybook Stories

```typescript
// UserProfile.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { UserProfile } from "./UserProfile";

const meta: Meta<typeof UserProfile> = {
  title: "Components/UserProfile",
  component: UserProfile,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    onEdit: { action: "edited" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    user: {
      id: "1",
      email: "john@example.com",
      displayName: "John Doe",
    },
  },
};

export const WithoutDisplayName: Story = {
  args: {
    user: {
      id: "1",
      email: "john@example.com",
      displayName: null,
    },
  },
};
```

## 🔧 トラブルシューティング

### 1. よくある問題と解決方法

#### Node.js バージョン問題

```bash
# 問題: Node.js バージョンが古い
Error: Node.js version 18.x is required

# 解決方法
nvm install 20
nvm use 20
npm install
```

#### 依存関係の競合

```bash
# 問題: パッケージの競合
npm ERR! peer dep missing

# 解決方法
rm -rf node_modules package-lock.json
npm install

# または
npm install --legacy-peer-deps
```

#### TypeScript エラー

```bash
# 問題: 型エラー
Type 'string | undefined' is not assignable to type 'string'

# 解決方法: 適切な型ガードを使用
if (value !== undefined) {
  // value は string 型として扱われる
}

# または Null 合体演算子を使用
const safeValue = value ?? 'default';
```

#### ESLint エラー

```bash
# 問題: ESLint ルール違反
'React' must be in scope when using JSX

# 解決方法: Next.js 13+ では不要
// 以下の行を削除
import React from 'react';
```

#### ビルドエラー

```bash
# 問題: ビルド失敗
Module not found: Can't resolve '@/components/Button'

# 解決方法: パスエイリアスの確認
# tsconfig.json の paths 設定を確認
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### 2. 環境変数関連の問題

#### Firebase 設定エラー

```bash
# 問題: Firebase 初期化失敗
Firebase configuration is invalid

# 解決方法: 環境変数の確認
npm run env:validate

# 必要な環境変数をすべて設定
NEXT_PUBLIC_FIREBASE_API_KEY=your-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain
# ... 他の必要な変数
```

#### セキュリティキー生成

```bash
# 暗号化キーの生成
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# JWT シークレットの生成
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. パフォーマンス問題

#### 開発サーバーが遅い

```bash
# 問題: 開発サーバーの起動が遅い
# 解決方法: キャッシュのクリア
rm -rf .next
npm run dev

# または依存関係の再インストール
rm -rf node_modules .next
npm install
```

#### ビルドサイズが大きい

```bash
# バンドル分析
npm run build
npx @next/bundle-analyzer

# 不要なインポートを削除
# 動的インポートを使用
const Component = dynamic(() => import('./Component'));
```

### 4. Git 関連の問題

#### コミットフック失敗

```bash
# 問題: pre-commit フックでエラー
# 解決方法: 手動でリンティング実行
npm run lint
npm run type-check

# 修正後に再コミット
git add .
git commit -m "fix: resolve linting issues"
```

#### マージコンフリクト

```bash
# 問題: マージコンフリクト発生
# 解決方法: 手動解決
git status
# コンフリクトファイルを編集
git add .
git commit -m "resolve: merge conflicts"
```

### 5. デプロイメント問題

#### Vercel デプロイエラー

```bash
# 問題: ビルドエラーでデプロイ失敗
# 解決方法: ローカルでビルド確認
npm run build

# 環境変数の設定確認
# Vercel ダッシュボードで環境変数を設定
```

#### 環境変数が反映されない

```bash
# 問題: 本番環境で環境変数が読み込まれない
# 解決方法: プレフィックスの確認
# クライアント側で使用する場合は NEXT_PUBLIC_ プレフィックスが必要
NEXT_PUBLIC_API_URL=https://api.example.com
```

## 📚 参考リソース

### 公式ドキュメント

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [HeroUI Documentation](https://www.heroui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### 開発ツール

- [VS Code](https://code.visualstudio.com/)
- [GitHub CLI](https://cli.github.com/)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Firebase CLI](https://firebase.google.com/docs/cli)

### コミュニティ

- [Next.js Discord](https://nextjs.org/discord)
- [React Discord](https://discord.gg/react)
- [TypeScript Discord](https://discord.gg/typescript)

## 🤝 コントリビューション

### Issue 報告

バグ報告や機能要望は GitHub Issues で受け付けています：

1. **バグ報告**: [Bug Report Template](https://github.com/your-org/ai-development-template/issues/new?template=bug_report.md)
2. **機能要望**: [Feature Request Template](https://github.com/your-org/ai-development-template/issues/new?template=feature_request.md)
3. **質問**: [Discussion](https://github.com/your-org/ai-development-template/discussions)

### プルリクエスト

1. Issue を作成して議論
2. フォークしてブランチ作成
3. 変更を実装
4. テストとドキュメント更新
5. プルリクエスト作成

### コードレビュー

- 建設的なフィードバック
- セキュリティとパフォーマンスの観点
- コーディング規約の遵守
- テストの網羅性

### ドキュメント改善

- 誤字脱字の修正
- 説明の改善
- 新機能のドキュメント追加
- 翻訳（将来的に）

## 📞 サポート

### 質問・相談

- **GitHub Discussions**: 一般的な質問や議論
- **GitHub Issues**: バグ報告や機能要望
- **Discord**: リアルタイムな相談（将来的に）

### 緊急時の連絡

- **セキュリティ問題**: security@example.com
- **重要なバグ**: GitHub Issues で `urgent` ラベル

---

**Happy Coding! 🎉**

このガイドが AI Development Template での開発を始める助けになれば幸いです。質問や改善提案があれば、お気軽にお知らせください！
