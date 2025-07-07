# 🎨 DESIGN_GUIDELINE.md

このドキュメントは、`Project Template` のデザイン実装における命名規則とルールのガイドラインです。 主に Tailwind CSS、Figma トークン、Storybook および開発中の共通スタイルに基づいています。

---

## 🎯 目的

- コンポーネントやスタイルの一貫性を保つ
- Figma → コード変換時のルール明示
- リファクタや共同開発を円滑に進める
- **AI実装時のデザイン精度向上**

---

## 🚫 AI実装時の絶対禁止事項

### デザイン変更の禁止
- **Figmaデザインにない要素の追加は絶対禁止**
- **既存デザインの色、サイズ、余白の変更は事前確認必須**
- **コンポーネントの見た目を勝手に調整することを禁止**

### 実装制限
- **任意の値（arbitrary values）の使用制限**
  - ❌ `w-[200px]` `text-[#ff0000]`
  - ✅ `w-[var(--space-200)]` `text-[var(--error)]`
- **カスタムCSS追加の禁止**
  - スタイルは必ずTailwindクラス + 定義済み変数で記述

---

## 📋 AI実装時のチェックリスト

### 実装前の確認事項
- [ ] 参照するFigmaデザインのリンクとノード番号を確認
- [ ] 使用するコンポーネントが既存のものか新規作成か確認
- [ ] 必要な色・サイズ・余白が既存トークンに定義されているか確認
- [ ] レスポンシブ対応の必要性を確認

### 実装中の確認事項
- [ ] すべてのカラーが`--color-name`形式で定義されているか
- [ ] すべてのスペーシングが`--space-*`形式で定義されているか
- [ ] タイポグラフィが定義済みユーティリティを使用しているか
- [ ] 任意の値を使用していないか

### 実装後の確認事項
- [ ] Figmaデザインと1px単位で一致しているか
- [ ] レスポンシブ表示が正しく動作するか
- [ ] 既存コンポーネントとの整合性が取れているか

---

## 🎨 カラー

- カラートークンは `globals.css` の `--color-name` を参照（例：`--on-surface`）
- Tailwind では次のように使用：

```tsx
text-[var(--on-surface)]
bg-[var(--surface)]
border-[var(--outline)]
```

- 特別に使用頻度の高いカラー（例：project-template-blue）は `tailwind.config.js` に拡張し、次のように記述：

```tsx
text-project-template-blue-70
```

### 使用可能カラートークン一覧
```css
/* 基本カラー */
--surface
--on-surface
--outline
--surface-tint
--error
--on-error

/* プロジェクト専用カラー */
--project-template-blue-70
--project-template-blue-50
```

---

## 📏 スペーシング / レイアウト

- スペーシングはすべて `globals.css` にある `--space-*` トークンを使用
- クラス例：

```tsx
gap-[var(--space-16)]
px-[var(--space-24)]
py-[var(--space-12)]
```

### 使用可能スペーシングトークン一覧
```css
--space-4    /* 4px */
--space-8    /* 8px */
--space-12   /* 12px */
--space-16   /* 16px */
--space-24   /* 24px */
--space-32   /* 32px */
--space-48   /* 48px */
--space-64   /* 64px */
```

- ブレークポイントは `tailwind.config.js` の `screens` に合わせて `xs`（480px）をベースに構成

---

## 🅰️ タイポグラフィ

- タイポグラフィトークンは `globals.css` に定義された以下の変数を使用：

```css
--font-size-large
--line-height-large
--font-size-medium
--line-height-medium
--font-size-small
--line-height-small
```

- これらを活かしたカスタムユーティリティを `@layer utilities` で定義（例）：

```css
@layer utilities {
  .text-large {
    font-size: var(--font-size-large);
    line-height: var(--line-height-large);
  }
  .text-medium {
    font-size: var(--font-size-medium);
    line-height: var(--line-height-medium);
  }
  .text-small {
    font-size: var(--font-size-small);
    line-height: var(--line-height-small);
  }
}
```

### 使用例
```tsx
// ✅ 正しい使用例
<h1 className="text-large text-[var(--on-surface)]">見出し</h1>

// ❌ 間違った使用例
<h1 className="text-2xl text-black">見出し</h1>
```

---

## 🔧 実装手順

### 1. 実装前準備
1. Figmaデザインの詳細を確認
2. 必要なトークンが定義されているか確認
3. 使用するコンポーネントを特定

### 2. マークアップ実装
1. 構造のみを先に実装（スタイリングなし）
2. 既存コンポーネントの活用を優先
3. 新規コンポーネントは最小限に

### 3. スタイリング実装
1. 定義済みトークンのみを使用
2. レスポンシブ対応を考慮
3. 任意の値は使用禁止

### 4. 動作確認
1. Figmaデザインとの照合
2. 複数画面サイズでの表示確認
3. 既存コンポーネントとの整合性確認

---

## 🧩 命名規則

### コンポーネント / ディレクトリ

- コンポーネント：`PascalCase`（例：`PostCard.tsx`, `UserProfile.tsx`）
- フックや関数系：`camelCase`（例：`useUploadImage.ts`, `formatDate.ts`）

### className

- Tailwind ユーティリティ + カスタム変数で構成：

```tsx
className="text-[var(--on-surface)] bg-[var(--surface)] px-[var(--space-16)]"
```

- カスタムユーティリティ使用時：

```tsx
className="text-medium text-project-template-blue-70"
```

---

## 🧩 トークンとコンポーネント対応

| トークン         | 使用箇所           | 対応コンポーネント例               |
| ---------------- | ------------------ | ---------------------------------- |
| `--space-16`     | padding 左右       | Button, TextField, TagDeleteButton |
| `--radius-full`  | 角丸               | Button, IconButton, FAB            |
| `--on-surface`   | テキスト色         | TextField, Button, FollowButton    |
| `--outline`      | フォーカスボーダー | TextField, Switch                  |
| `--surface-tint` | 背景               | FAB, IconButton (fab variant)      |

---

## 📱 画面構成方針（抜粋）

| パス                  | 目的                 | 主なコンポーネント                         |
| --------------------- | -------------------- | ------------------------------------------ |
| `/mypage/post`        | 投稿作成画面         | TextField, Button, TagDeleteButton         |
| `/mypage`             | 自分の投稿一覧・削除 | CountIconButton, IconButton, Checkbox      |
| `/home`               | 全ユーザーの投稿一覧 | CountIconButton, CollectionCountIconButton |
| `/settings`           | ユーザー設定画面     | Switch, TextField, Button                  |
| `/login`, `/register` | 認証画面             | TextField, Button                          |

---

## ❌ よくある間違い

### 間違った実装例
```tsx
// ❌ 任意の値を使用
<div className="w-[200px] text-[#333333] p-[10px]">

// ❌ 標準のTailwindクラスを使用
<div className="text-gray-800 p-4">

// ❌ デザインにない要素を追加
<div className="shadow-lg border-2">
```

### 正しい実装例
```tsx
// ✅ 定義済みトークンを使用
<div className="w-[var(--space-200)] text-[var(--on-surface)] p-[var(--space-16)]">

// ✅ カスタムユーティリティを使用
<div className="text-medium text-project-template-blue-70">

// ✅ Figmaデザインに忠実
<div className="bg-[var(--surface)] border-[var(--outline)]">
```

---

## 🚨 エラー時の対応

### AIが間違いを犯した場合
1. **すぐに実装を停止**
2. **間違いの具体的な指摘**
3. **正しい実装例を提示**
4. **再実装を依頼**

### 不明な点がある場合
1. **実装前に必ず確認**
2. **推測での実装は禁止**
3. **デザイナーに確認を依頼**

---

## ✅ 今後の方針

- 本ガイドラインは MVP フェーズ用に簡易版として運用
- 開発が安定したら Figma のスタイル名と連携した命名設計を本格導入予定
- **AI実装時の精度向上を継続的に改善**

---

## 🤖 AI実装時の追加ルール

### 基本方針
- **全ての実装・リファクタリング時は `docs/AI_IMPLEMENTATION_RULES.md` に従うこと**
- **リファクタリング時は `docs/REFACTORING_GUIDE.md` の段階的手順に従うこと**
- **実装指示は `docs/templates/` のテンプレートを活用すること**

### 簡潔な指示パターン
```bash
# 新規実装時
docs/AI_IMPLEMENTATION_RULES.mdに従って、[具体的な内容]を実装してください。

# リファクタリング時  
docs/REFACTORING_GUIDE.mdに従って、[具体的な内容]をリファクタリングしてください。

# テンプレート使用時
docs/templates/implementation-template.mdの形式で[具体的な内容]を実行してください。
```

### 効果測定指標
- AIが間違いを犯す頻度の減少
- 実装→確認→修正のサイクル時間短縮  
- Figmaデザインとの一致精度向上

---

以上が `Project Template` におけるデザイン実装の基本方針です。 運用しながら随時アップデートしていきます ✨
