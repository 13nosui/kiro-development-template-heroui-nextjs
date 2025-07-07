# HeroUI全自動サービス開発テンプレート 🚀

**nidomi.io HeroUIテンプレート** - HeroUIトークンとコンポーネントで、UIからサーバーサイドまで全自動でサービス開発できる統合テンプレート

## 🎯 主な特徴

### ✨ 完全統合設計
- **HeroUI + カスタムデザイントークン**: 既存のnidomiデザインシステムとHeroUIの完璧な融合
- **フルスタック自動生成**: フロントエンド・バックエンド・API・型定義を一括作成
- **カスタマイズ対応**: HeroUIテーマを簡単にカスタマイズ可能な設計

### 🛠 技術スタック
- **フロントエンド**: Next.js 14 (App Router) + HeroUI v2.7
- **スタイリング**: Tailwind CSS + カスタムデザイントークン
- **バックエンド**: Next.js API Routes + TypeScript
- **開発ツール**: Storybook + Firebase + 自動化スクリプト

## 🚀 クイックスタート

### 1. 基本セットアップ
```bash
# 依存関係インストール (既に完了)
npm install

# 開発サーバー起動
npm run dev
```

### 2. 新しいサービスを30秒で作成
```bash
# AIチャットサービスを自動生成
npm run create-service ai-chat

# または
npm run heroui:create user-profile
```

### 3. 生成されるファイル構成
```
src/
├── app/
│   ├── ai-chat/
│   │   └── page.tsx          # サービスページ (UI)
│   └── api/
│       └── ai-chat/
│           └── route.ts       # API エンドポイント
├── components/
│   ├── ServiceDashboard.tsx   # 汎用サービス管理UI
│   └── HeroUIShowcase.tsx     # UIコンポーネント展示
```

## 📋 HeroUIとカスタムトークンの統合設計

### カラーシステム統合
```css
/* 既存のnidomiトークン */
--primary: #dedede;
--on-primary: #262626;
--secondary: #313131;

/* HeroUIテーマでオーバーライド */
primary: {
  DEFAULT: "var(--primary)",
  foreground: "var(--on-primary)",
}
```

### コンポーネント使用例
```tsx
import { Button, Card, Input } from "@heroui/react";

function MyService() {
  return (
    <Card className="bg-nidomi-surface border-nidomi-outline">
      <Button 
        color="primary"
        className="text-nidomi-primary-foreground"
      >
        カスタムスタイル適用
      </Button>
      <Input
        variant="bordered"
        classNames={{
          input: "text-nidomi-surface-foreground",
          inputWrapper: "border-nidomi-outline"
        }}
      />
    </Card>
  );
}
```

## 🎨 HeroUIカスタマイズ方法

### 1. テーマ設定編集 (tailwind.config.js)
```javascript
heroui({
  themes: {
    dark: {
      colors: {
        primary: {
          DEFAULT: "#your-brand-color",
          foreground: "#ffffff",
        },
        // カスタムカラー追加
        brand: {
          500: "#your-custom-color",
        }
      },
    },
  },
})
```

### 2. カスタムデザイントークン追加 (globals.css)
```css
:root {
  /* 新しいサービス専用トークン */
  --service-accent: #ff6b6b;
  --service-background: #f8f9fa;
}
```

### 3. コンポーネント拡張
```tsx
// カスタムButtonコンポーネント
import { Button as HeroButton } from "@heroui/react";

export function CustomButton({ variant = "service", ...props }) {
  return (
    <HeroButton
      className={`
        ${variant === "service" ? "bg-service-accent text-white" : ""}
        custom-shadow hover:scale-105 transition-transform
      `}
      {...props}
    />
  );
}
```

## 🔧 自動化コマンド一覧

### サービス作成
```bash
# 基本サービス作成
npm run create-service my-service

# HeroUI専用コマンド
npm run heroui:create ai-assistant
```

### 開発・ビルド
```bash
npm run dev          # 開発サーバー
npm run build        # プロダクションビルド
npm run storybook    # Storybook起動
```

### 生成されるAPIエンドポイント
各サービスには自動的にRESTful APIが生成されます：

```bash
GET  /api/my-service     # サービス情報取得
POST /api/my-service     # サービス操作実行
```

## 📁 プロジェクト構造詳細

```
nidomi-io/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # HeroUIProvider設定済み
│   │   ├── page.tsx           # メイン展示ページ  
│   │   ├── globals.css        # カスタムデザイントークン
│   │   └── [service]/         # 自動生成サービス
│   ├── components/
│   │   ├── HeroUIShowcase.tsx # UIコンポーネントデモ
│   │   ├── ServiceDashboard.tsx # サービス管理UI
│   │   └── [existing-components] # 既存カスタムコンポーネント
│   └── lib/
├── scripts/
│   └── create-service.js      # 自動サービス生成スクリプト
├── tailwind.config.js         # HeroUI + カスタムテーマ統合
└── package.json               # 自動化コマンド設定済み
```

## 🎯 使用シナリオ

### シナリオ1: AIチャットサービス開発
```bash
# 1. サービス生成
npm run create-service ai-chat

# 2. カスタマイズ
# src/app/ai-chat/page.tsx を編集
# src/app/api/ai-chat/route.ts にAIロジック追加

# 3. 即座にアクセス可能
# http://localhost:3000/ai-chat
```

### シナリオ2: ユーザープロファイルページ
```bash
# 1. 生成
npm run heroui:create user-profile

# 2. HeroUIコンポーネント活用
# Avatar, Card, Badge, Modal等を組み合わせ

# 3. 既存デザイントークンでスタイリング
# nidomi-primary, nidomi-surface 等を使用
```

### シナリオ3: ダッシュボードアプリ
```bash
# 複数サービス連携
npm run create-service analytics
npm run create-service user-management  
npm run create-service content-management

# 各サービスが自動的にAPI連携可能
```

## 🎨 デザインガイドライン

### カラーパレット使用方針
- **HeroUI標準色**: `color="primary"`, `color="secondary"` 等
- **nidomiカスタム色**: `text-nidomi-primary`, `bg-nidomi-surface` 等
- **ハイブリッド使用**: 両方を組み合わせて独自デザイン作成

### レスポンシブ対応
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <Card className="p-4">HeroUI Card</Card>
  <div className="p-4 bg-nidomi-surface">Custom Card</div>
</div>
```

### アクセシビリティ
- HeroUIの組み込みアクセシビリティ機能を活用
- カスタムコンポーネントでもaria属性を適切に設定

## 🔧 トラブルシューティング

### よくある問題

#### 1. HeroUIコンポーネントが表示されない
```bash
# HeroUIProviderが正しく設定されているか確認
# src/app/layout.tsx をチェック
```

#### 2. カスタムトークンが適用されない
```bash
# Tailwind CSS設定確認
npm run tw

# safelist設定を確認
# tailwind.config.js の safelist をチェック
```

#### 3. 自動生成されたAPIが動作しない
```bash
# Next.js開発サーバー再起動
npm run dev

# APIルートファイル確認
# src/app/api/[service]/route.ts
```

## 📚 参考リンク

- [HeroUI公式ドキュメント](https://heroui.com/docs)
- [HeroUI + Next.js設定](https://heroui.com/docs/frameworks/nextjs)  
- [Tailwind CSS v3.4](https://tailwindcss.com/docs)
- [Next.js 14 App Router](https://nextjs.org/docs)

## 🚀 さらなる拡張

### 追加予定機能
- [ ] データベース連携テンプレート
- [ ] 認証システム統合
- [ ] リアルタイム機能（WebSocket）
- [ ] PWA対応
- [ ] Docker化テンプレート

### カスタマイズ支援
- [ ] GUI設定ツール
- [ ] テーマビルダー
- [ ] コンポーネントジェネレーター

---

**🎉 これで完全なHeroUI全自動サービス開発環境が整いました！**

新しいサービスアイデアがあれば、`npm run create-service [name]` だけで即座に開発開始できます。
