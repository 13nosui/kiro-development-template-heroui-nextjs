# 📘 開発用 README（Project Template）

このドキュメントは、`Project Template` 開発環境における HeroUI + Next.js 構成・セットアップ・注意点をまとめたものです。

---

## 🔧 開発環境

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI Library**: [HeroUI](https://www.heroui.com/) - モダンなReact UIコンポーネントライブラリ
- **Styling**: HeroUI + Tailwind CSS
- **Component Dev**: Storybook v8.6.14 (webpack5 使用) - HeroUIコンポーネントのカスタマイズ・テスト
- **Icons/SVG**: @svgr/webpack による SVG 読み込み対応済み
- **Hosting**: Vercel
- **Backend**: Firebase（Auth / Firestore / Storage）
- **バージョン管理**: mise（Node.js, pnpm のバージョン管理）

### ✅ mise の設定

プロジェクトルートの `.mise.toml` にて以下のツールのバージョンを管理しています：

```toml
[tools]
node = "20.11.1"
pnpm = "8.15.4"
```

コマンドの一覧と実行をするには以下を実行してください：

```bash
mise run
```

新規で開発環境をセットアップする場合は以下のコマンドを実行してください：

```bash
# miseのインストール（macOS）
brew install mise

# プロジェクトの依存関係をインストール
mise install
pnpm install
```

---

## 📁 ディレクトリ構成（抜粋）

```
src/
├── app/                 # App Router ベースの画面構成
│   ├── layout.tsx      # ルートレイアウト（HeroUIProvider設定）
│   ├── page.tsx        # ホームページ
│   └── providers.tsx   # HeroUIプロバイダー設定
├── components/         # 再利用コンポーネント（HeroUIベース）
├── lib/               # ユーティリティ・設定
│   └── firebase.ts    # Firebase 初期化設定
├── stories/           # Storybook 専用の.stories ファイル
└── types/             # TypeScript型定義

.storybook/
├── main.ts            # Storybook の設定（webpack5 ベース）
└── preview.tsx        # Storybook 共通スタイル（HeroUIテーマ設定）
```

---

## 🎨 HeroUI 設定

### パッケージ構成

```json
{
  "@heroui/react": "^2.7.11",
  "@heroui/theme": "^2.4.17"
}
```

### Tailwind CSS 統合設定

`tailwind.config.js` にてHeroUIプラグインを統合：

```js
const { heroui } = require("@heroui/react");

module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui()],
};
```

### Provider設定

`src/app/providers.tsx` にてHeroUIプロバイダーを設定：

```tsx
import { HeroUIProvider } from "@heroui/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      {children}
    </HeroUIProvider>
  );
}
```

---

## 📦 Storybook 構成（v8.6.14）

### ✅ 使用バージョン

```json
{
  "@storybook/react": "8.6.14",
  "@storybook/nextjs": "8.6.14",
  "@storybook/addon-essentials": "8.6.14",
  "@storybook/addon-docs": "8.6.14",
  "@storybook/addon-a11y": "8.6.14"
}
```

### ✅ HeroUI対応設定

- `webpack5` ビルダーを使用（Vite 非対応）
- HeroUIコンポーネントのテーマ・カスタマイズをStorybookで確認可能
- `.storybook/preview.tsx` にてHeroUIProvider設定済み

### HeroUIコンポーネントのStorybook開発

```tsx
// Button.stories.tsx 例
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@heroui/react';

const meta: Meta<typeof Button> = {
  title: 'HeroUI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    color: 'primary',
    children: 'Button',
  },
};

export const Secondary: Story = {
  args: {
    color: 'secondary',
    variant: 'bordered',
    children: 'Button',
  },
};
```

### ✅ 注意点

- `vite`, `vitest` 関連パッケージは削除済み（誤導入注意）
- `.storybook/assets/`, `src/stories/assets/` など **デモファイルは削除済み**
- `.storybook/` 配下を参照していた `storybook-stories.js` エラー対策として、`main.ts` の `webpackFinal` にて `.storybook/` を除外設定済み

```ts
// .storybook/main.ts 抜粋
config.entry = config.entry?.filter?.((entry: string) => {
  return !entry.includes(".storybook");
});
```

---

## 🖼 SVG の扱い方

HeroUIのアイコンシステムと併用してSVGを活用：

```tsx
// HeroUIのアイコンプロパティとして使用
import { Button } from "@heroui/react";
import CustomIcon from "@/assets/custom-icon.svg";

<Button
  startContent={<CustomIcon className="w-4 h-4" />}
  color="primary"
>
  カスタムアイコン付きボタン
</Button>
```

`.storybook/main.ts` にて `@svgr/webpack` ローダーを適用済み。

---

## 🔐 Firebase 構成

`.env.local` にて以下を設定（本番用は Vercel の環境変数に設定済み）

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

- `src/lib/firebase.ts` にて `initializeApp()` 済み
- `FirebaseConfig` の更新時は `.env.local` と `firebase.ts` 両方更新すること

---

## 🚀 Vercel デプロイ

- 自動デプロイ対応済み（main ブランチ）
- `vercel logs` や `Clear cache & redeploy` を使ってデバッグ可能
- Firebase 環境変数も Vercel 側に登録済み
- HeroUIのCSS最適化により高速なページロード

---

## 🧪 テスト・CI など

- `Vitest` 系は導入せず、**必要な場合は `Jest` + `Testing Library` を別途構成予定**
- `experimental-addon-test` もアンインストール済み（Vite 依存）
- HeroUIコンポーネントのアクセシビリティテストはStorybook addon-a11yで対応

---

## 🧼 トラブルシューティング

### Storybook関連

- `storybook-stories.js` エラー対策済み
- Storybook が突然ビルド失敗した場合は、以下を試す：

```bash
rm -rf node_modules/.cache storybook-static
pnpm storybook
```

### HeroUI関連

- テーマ変更が反映されない場合：
```bash
# Next.jsキャッシュクリア
rm -rf .next
pnpm dev
```

- HeroUIコンポーネントのスタイルが適用されない場合：
  - `tailwind.config.js` の HeroUI content設定を確認
  - `src/app/providers.tsx` の HeroUIProvider設定を確認

---

## 👥 開発メモ

### HeroUIベースの開発方針

- `.stories.tsx` は HeroUI コンポーネントのカスタマイズ・テスト用に作成
- 独自コンポーネントは最小限に留め、HeroUIコンポーネントの組み合わせを優先
- テーマカスタマイズは `src/app/providers.tsx` で集中管理

### 推奨開発フロー

1. **HeroUIコンポーネント選定**: 要件に適したコンポーネントを確認
2. **Storybookでプロトタイプ**: カスタマイズやバリアント検証
3. **実装**: HeroUIのpropsとTailwindクラスで実現
4. **テーマ調整**: 必要に応じてテーマシステムで微調整

---

## 🔥 Firebase Firestore ドキュメント構成

### 🔸 コレクション: `posts`

各ユーザーの投稿（ZINE やアートブック）を保存します。

| フィールド名 | 型          | 説明                                    |
| ------------ | ----------- | --------------------------------------- |
| `id`         | `string`    | Firestore のドキュメント ID（自動生成） |
| `title`      | `string`    | 投稿タイトル                            |
| `comment`    | `string?`   | 任意のひとことコメント                  |
| `tags`       | `string[]?` | タグの配列（例: ["ZINE", "写真集"]）    |
| `imageUrls`  | `string[]`  | Firebase Storage の画像 URL 配列        |
| `createdAt`  | `Timestamp` | 投稿日時（`serverTimestamp()`）         |
| `userId`     | `string`    | 投稿者の Firebase UID                   |

Firestore のセキュリティルールやクエリ設計に合わせて `userId` をインデックス化すると効率的です。

---

## 📘 Firebase Storage

- `posts/{uid}/{postId}/{filename}.jpg` のような構造で保存
- `imageUrls[]` にはこのパスから取得したダウンロード URL を格納

---

## 🧩 型定義ルール（TypeScript）

### 🔸 投稿データ型 `BookPost`

`src/types/bookPost.ts` に定義：

```ts
export interface BookPost {
  id: string;
  title: string;
  comment?: string;
  tags?: string[];
  imageUrls: string[];
  createdAt: any; // Firestore の Timestamp 型
  userId: string;
}
```

- `comment` や `tags` は省略可能なフィールドとして定義
- `createdAt` は `Timestamp` 型だが、画面表示用には `.toDate()` や `format()` で変換して使用
- 投稿取得時には下記のように `doc.id` を手動で付与：

```ts
const fetchedPosts: BookPost[] = querySnapshot.docs.map((doc) => {
  const data = doc.data();
  return {
    id: doc.id,
    ...(data as BookPost),
  };
});
```

---

## 📁 型ファイルの配置ポリシー

- 汎用型は `src/types/` に配置
- 型とロジックが 1:1 で対応する場合（例: Firebase helper 関数用）には隣接ファイルとすることも可

---
