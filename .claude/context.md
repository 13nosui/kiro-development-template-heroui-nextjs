# Project Template プロジェクト設定

## 技術スタック
- Framework: Next.js 14+ (App Router)
- Styling: Tailwind CSS + カスタムトークン
- UI Components: カスタムコンポーネント + shadcn/ui
- Storybook: v8.6.14
- Icons: @svgr/webpack
- Backend: Firebase (Auth/Firestore/Storage)
- Hosting: Vercel
- Language: TypeScript

## 設計原則
- docs/AI_IMPLEMENTATION_RULES.md に従う
- docs/DESIGN_GUIDELINE.md に準拠
- docs/REFACTORING_GUIDE.md の段階的手順を遵守

## ファイル構造
- components/: 再利用可能コンポーネント
- app/: Next.js App Router pages
- styles/: Tailwind設定とカスタムCSS
- stories/: Storybook ストーリー
- lib/: ユーティリティ関数
