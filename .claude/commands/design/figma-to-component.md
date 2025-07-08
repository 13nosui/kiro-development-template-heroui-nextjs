---
description: "FigmaデザインからHeroUIベースのTypeScriptコンポーネントを完全生成"
allowed-tools: ["figma", "FileSystem", "Bash"]
---

# Figma → HeroUI React Component 完全変換

$ARGUMENTSコンポーネントを以下の完全な手順でHeroUIベースで実装してください：

## Phase 1: Figmaデザイン解析
1. **HeroUIデザイントークン対応**
   - カラー値 → HeroUIテーマカラーと照合
   - スペーシング → HeroUIスペーシングトークンと照合
   - タイポグラフィ → HeroUIタイポグラフィシステムと照合
   - ボーダーラジウス → HeroUIサイズトークンと照合

2. **HeroUIコンポーネント構造分析**
   - HeroUI既存コンポーネントの活用可能性判定
   - カスタマイゼーション方法の設計
   - Props設計（HeroUIコンポーネントのAPIに準拠）
   - State管理の必要性判定
   - イベントハンドラー設計

## Phase 2: TypeScript実装
```typescript
// 生成するファイル構造
src/components/${ComponentName}/
├── ${ComponentName}.tsx       # HeroUIベースメインコンポーネント
├── ${ComponentName}.types.ts  # 型定義
└── index.ts                   # エクスポート
```

**実装要件：**
- TypeScript strict mode準拠
- HeroUIコンポーネントAPIに準拠したProps型定義
- forwardRef対応（HTML要素の場合）
- アクセシビリティ属性の自動付与
- レスポンシブ対応

## Phase 3: HeroUI実装
```tsx
// HeroUI実装パターン
import { Button, Input, Card } from "@heroui/react";

// 基本的なHeroUIコンポーネント活用
const baseComponent = (
  <Button
    variant="solid"
    color="primary"
    size="md"
    radius="md"
  >
    {children}
  </Button>
);

// カスタマイゼーション（HeroUIのテーマシステム使用）
const customTheme = {
  extend: {
    colors: {
      primary: {
        50: "#fef7ff",
        500: "#a855f7",
        900: "#581c87"
      }
    }
  }
};
```

**HeroUI使用ガイドライン：**
- HeroUI標準コンポーネントを優先使用
- カスタマイゼーションはHeroUIテーマシステムで実装
- 任意の値（arbitrary values）の使用禁止
- HeroUIのvariant, color, sizeプロパティを活用

## Phase 4: Storybook統合
```typescript
// ${ComponentName}.stories.tsx の自動生成
import { ${ComponentName} } from "./${ComponentName}";

export default {
  title: 'Components/${ComponentName}',
  component: ${ComponentName},
  parameters: {
    docs: { description: { component: 'HeroUIベースコンポーネントの説明' } }
  },
  argTypes: { /* HeroUIプロパティ対応 */ }
}

// 必須ストーリー
export const Default = {}
export const AllVariants = { 
  render: () => (
    <>
      <${ComponentName} variant="solid" />
      <${ComponentName} variant="bordered" />
      <${ComponentName} variant="light" />
    </>
  )
}
export const Responsive = { parameters: { viewport: { viewports: INITIAL_VIEWPORTS } } }
export const Accessibility = { /* a11y addon対応 */ }
```

## Phase 5: 品質保証チェック
- [ ] TypeScript型エラーなし
- [ ] ESLint/Prettier準拠
- [ ] WCAG 2.1 AA準拠
- [ ] レスポンシブ対応確認
- [ ] Figmaデザインとの1px単位一致
- [ ] HeroUIデザインシステム準拠
- [ ] docs/AI_IMPLEMENTATION_RULES.md準拠

## 実行完了後の報告
実装完了後、以下を報告してください：
1. 生成されたファイル一覧
2. 使用したHeroUIコンポーネント一覧
3. Props仕様書（HeroUIベース）
4. 使用例コード
5. 発見された課題と改善提案
