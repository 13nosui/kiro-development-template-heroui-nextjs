# AI Development Template - HeroUI & Next.js

このリポジトリは、**HeroUI** コンポーネントライブラリと **Next.js 15** を活用した AI 駆動サービス開発のためのモダンなテンプレートです。美しく一貫性のある UI と優れた開発体験を提供し、AI アプリケーションの迅速な構築を支援します。

⚠️ 現在、環境変数バリデーションでエラーが出ますが、テンプレート開発段階のため無視しています。
本番運用や実際のサービス開発時は、必ずご自身の環境に合わせて適切な値に置き換えてください。
本番運用時や実際のサービス開発時には、必ずエラーを解消してください。
本番運用の際は.gitignore で.env を適切に除外してください。

## ✨ 主な特徴

- 🎨 **HeroUI**: 美しいデザインシステムとアクセシブルなコンポーネント
- ⚡ **Next.js 15**: App Router による最新の React 開発環境
- 🎯 **TypeScript**: 型安全な開発体験で信頼性の高い AI アプリ構築
- 🎨 **Tailwind CSS**: ユーティリティファースト CSS フレームワーク
- 📚 **Storybook**: コンポーネント開発・ドキュメント環境
- 🔥 **Firebase**: 認証・データベース・ストレージの統合バックエンド
- 🤖 **AI Ready**: AI サービス統合に最適化された構成

## 🚀 クイックスタート

### 1. 環境セットアップ

```bash
# miseによるNode.js・pnpmのバージョン管理
brew install mise
mise install

# 依存関係のインストール
pnpm install
```

### 2. 環境変数設定

⚠️ **重要**: このプロジェクトにはダミー値が設定された `.env` と `.env.example` ファイルが含まれています。  
**本番環境にデプロイする前に、必ずすべてのダミー値を実際の認証情報に置き換えてください。**

#### 開発環境のセットアップ

```bash
# .env.example を .env.local にコピー
cp .env.example .env.local

# または、既存の .env ファイルを使用
cp .env .env.local
```

#### 必要な環境変数の設定

```env
# Firebase設定（必須）
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890abcdef

# セキュリティ設定（必須）
ENCRYPTION_KEY=12345678901234567890123456789012
JWT_SECRET=jwt-secret-key-1234567890123456
CSRF_SECRET=csrf-secret-key-1234567890123456
SEMGREP_APP_TOKEN=your_actual_token_here

# 外部サービス（オプション）
FIGMA_ACCESS_TOKEN=figd_your-figma-access-token
OPENAI_API_KEY=sk-your-openai-api-key-1234567890123456789012345678
SENTRY_DSN=https://your-sentry-dsn@sentry.io/1234567
```

#### 環境変数の検証

```bash
# 環境変数の設定を確認
npm run env:check

# 詳細な検証を実行
node scripts/validate-env.js
```

### 3. 開発サーバー起動

```bash
# Next.js 開発サーバー
pnpm dev

# Storybook (コンポーネント開発)
pnpm storybook
```

## 🎨 HeroUI 活用ガイド

### 基本的なコンポーネント使用例

```tsx
import { Button, Input, Card, CardBody } from "@heroui/react";

export default function ExampleForm() {
  return (
    <Card className="max-w-md">
      <CardBody className="space-y-4">
        <Input
          type="email"
          label="メールアドレス"
          placeholder="you@example.com"
          variant="bordered"
        />
        <Input type="password" label="パスワード" variant="bordered" />
        <Button color="primary" fullWidth>
          ログイン
        </Button>
      </CardBody>
    </Card>
  );
}
```

### テーマカスタマイズ

HeroUI のテーマシステムでプロジェクト固有のデザインを実現：

```tsx
// src/app/providers.tsx
import { HeroUIProvider } from "@heroui/react";

const customTheme = {
  extend: "dark",
  colors: {
    primary: {
      DEFAULT: "#3b82f6",
      foreground: "#ffffff",
    },
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  return <HeroUIProvider theme={customTheme}>{children}</HeroUIProvider>;
}
```

## 📁 プロジェクト構成

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # ルートレイアウト (HeroUIProvider設定)
│   ├── page.tsx        # ホームページ
│   └── providers.tsx   # HeroUIプロバイダー設定
├── components/         # 再利用可能コンポーネント
├── lib/               # ユーティリティ・設定
│   └── firebase.ts    # Firebase初期化
└── stories/           # Storybookファイル
```

## 🛠 開発ツール

### Storybook でのコンポーネント開発

```bash
pnpm storybook
```

HeroUI コンポーネントの組み合わせやカスタマイズを Storybook で確認・テストできます。

### 型安全性とコード品質の確保

```bash
# TypeScript型チェック
pnpm type-check

# ESLint によるコード品質チェック
pnpm lint

# ビルドテスト（本番環境での動作確認）
pnpm build
```

## 🎯 開発ガイドライン

詳細な開発ガイドラインは以下を参照：

- **[DESIGN_GUIDELINE.md](./DESIGN_GUIDELINE.md)**: HeroUI ベースのデザイン実装ガイド
- **[README.dev.md](./README.dev.md)**: 詳細な開発環境・技術仕様

### 推奨ワークフロー

1. **コンポーネント設計**: HeroUI の既存コンポーネントで要件を満たせるか確認
2. **Storybook 開発**: 独立した環境でコンポーネントを開発・テスト
3. **型安全実装**: TypeScript の型システムを活用
4. **アクセシビリティ**: HeroUI の組み込み機能を活用

## 🔐 セキュリティ設定

### Semgrep セキュリティスキャン

このプロジェクトは Semgrep を使用した自動セキュリティスキャンを実装しています。

#### 設定手順

1. [Semgrep AppSec Platform](https://semgrep.dev/app) にアカウントを作成
2. **Settings > Tokens** に移動
3. **Create new token** をクリック
4. **Agent (CI)** スコープを選択
5. 生成されたトークンをコピー
6. GitHub リポジトリの **Settings > Secrets and variables > Actions** に移動
7. **New repository secret** をクリック
8. 名前: `SEMGREP_APP_TOKEN`
9. 値: コピーしたトークンを貼り付け
10. **Add secret** をクリック

#### ローカル開発での使用

```bash
# .env.local に追加
SEMGREP_APP_TOKEN=your_actual_token_here

# ローカルでスキャンを実行
npx semgrep --config=auto src/
```

## 🚀 デプロイ

### Vercel への自動デプロイ

1. GitHub リポジトリを Vercel に接続
2. 環境変数を Vercel ダッシュボードで設定
3. `main` ブランチへのプッシュで自動デプロイ

```bash
# プロダクションビルドの確認
pnpm build
pnpm start
```

## 📚 リソース

### 公式ドキュメント

- [HeroUI Documentation](https://www.heroui.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/docs)

### コミュニティ

- [HeroUI Discord](https://discord.gg/heroui)
- [Next.js Discord](https://nextjs.org/discord)

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成: `git checkout -b feature/amazing-feature`
3. 変更をコミット: `git commit -m 'Add amazing feature'`
4. ブランチにプッシュ: `git push origin feature/amazing-feature`
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

---

**HeroUI + Next.js で美しく機能的な Web アプリケーションを構築しましょう！** ✨
