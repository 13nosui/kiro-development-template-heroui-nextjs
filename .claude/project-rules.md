# Project Template プロジェクトルール

## 開発原則

1. 既存のドキュメントルールに従う
2. TypeScript strict mode 準拠
3. HeroUI デザインシステムのみ使用
4. Material UI Icons を標準アイコンライブラリとして使用
5. アクセシビリティ(WCAG 2.1 AA)準拠
6. 段階的リファクタリング手順の遵守

## 禁止事項

- 任意の値（arbitrary values）の使用
- 標準 Tailwind クラス（text-gray-500 等）の使用
- HeroUI外のカスタムプロパティ使用
- HeroUIコンポーネント以外のUI実装
- Material UI Icons 以外のアイコンライブラリの使用
- 独自SVGアイコンの作成（Material UI Iconsで代替可能な場合）

## 必須チェック項目

- [ ] TypeScript 型エラーなし
- [ ] ESLint/Prettier 準拠
- [ ] テストカバレッジ 80%以上
- [ ] Lighthouse スコア 90 以上
- [ ] アクセシビリティ違反なし
- [ ] HeroUI デザインシステム準拠
- [ ] Material UI Icons の適切な使用
- [ ] アイコンに aria-label 設定済み（アイコンのみボタンの場合）

## Cursor Web 最適化

- タスクを必ず 3-5 ステップに分割
- 各ステップで動作確認を実施
- 1 ステップあたりの変更は 50 行以下
- Check running 対策として段階的実装を徹底
