---
description: "HeroUIベース包括的コードレビューと品質保証"
allowed-tools: ["FileSystem", "Bash"]
---

# HeroUIベース包括的コードレビュー

$ARGUMENTSのHeroUIベース包括的な品質チェックを実行します。

## Phase 1: 静的解析
```bash
# TypeScript型チェック
npx tsc --noEmit --strict

# ESLint詳細チェック
npx eslint $ARGUMENTS --ext .ts,.tsx --max-warnings 0

# Prettier フォーマット確認
npx prettier --check $ARGUMENTS

# Bundle analyzer（パフォーマンス影響確認）
npx @next/bundle-analyzer
```

## Phase 2: HeroUIデザインシステムチェック
**HeroUI準拠確認：**
- [ ] HeroUIコンポーネント使用確認：`grep -r "from.*@heroui" $ARGUMENTS`
- [ ] カスタムCSS使用チェック：`grep -r "className.*\[" $ARGUMENTS` （発見時は確認）
- [ ] HeroUIテーマシステム確認：テーマカスタマイゼーションの適切性
- [ ] 任意の値使用チェック：`grep -r "\[\d" $ARGUMENTS` （発見時は即座に修正）

**AI_IMPLEMENTATION_RULES.md準拠確認：**
- [ ] 禁止事項遵守確認
- [ ] HeroUIベース実装フロー確認
- [ ] チェックリスト完全実行

## Phase 3: セキュリティ監査
**フロントエンドセキュリティ：**
```bash
# 依存関係脆弱性チェック
npm audit --audit-level high

# セキュリティパターンチェック
grep -r "innerHTML\|dangerouslySetInnerHTML" $ARGUMENTS
grep -r "eval\|Function" $ARGUMENTS
```

**Firebase設定確認：**
- [ ] セキュリティルールのレビュー
- [ ] API Key設定の確認
- [ ] CORS設定の確認
- [ ] 認証フロー検証

## Phase 4: パフォーマンス分析
**Core Web Vitals チェック：**
```bash
# Lighthouse CI実行
npx lhci autorun

# Bundle size確認
npx webpack-bundle-analyzer .next/static/chunks/
```

**レンダリングパフォーマンス：**
- [ ] 不要な再レンダリング確認
- [ ] memo/useMemo/useCallback適切な使用
- [ ] 画像最適化確認
- [ ] Code splitting適用確認

## Phase 5: アクセシビリティ監査
**自動チェック：**
```bash
# axe-core による自動テスト
npx @axe-core/cli $ARGUMENTS

# Storybook addon-a11y確認
npm run storybook:a11y
```

**手動チェック項目：**
- [ ] キーボード操作確認
- [ ] スクリーンリーダー対応確認
- [ ] カラーコントラスト確認（4.5:1以上）
- [ ] フォーカス管理確認
- [ ] ARIA属性適切な使用確認

## Phase 6: レスポンシブ・ブラウザ対応
**レスポンシブテスト：**
```javascript
// Puppeteer自動テスト
const devices = ['iPhone 12', 'iPad', 'Desktop'];
for (const device of devices) {
  await page.emulate(puppeteer.devices[device]);
  // スクリーンショット比較
}
```

**ブラウザ互換性：**
- [ ] Chrome最新版
- [ ] Firefox最新版  
- [ ] Safari最新版
- [ ] Edge最新版
- [ ] モバイルブラウザ確認

## Phase 7: テストカバレッジ確認
```bash
# ユニットテスト実行
npm run test:coverage

# E2Eテスト実行
npm run cypress:run

# カバレッジレポート確認
open coverage/lcov-report/index.html
```

**目標カバレッジ：**
- [ ] 関数カバレッジ: 80%以上
- [ ] 分岐カバレッジ: 75%以上
- [ ] 行カバレッジ: 85%以上

## Phase 8: 統合テスト
**Storybook確認：**
```bash
# 全ストーリー正常表示確認
npm run storybook:test

# ビジュアルリグレッションテスト
npm run storybook:chromatic
```

**本番環境テスト：**
```bash
# プロダクションビルド
npm run build && npm run start

# 本番相当環境での動作確認
npm run test:e2e:prod
```

## 品質レポート生成
レビュー完了後、以下の品質レポートを作成：

### コード品質スコア
- **設計原則準拠**: ✅/❌
- **セキュリティ**: ✅/❌  
- **パフォーマンス**: スコア/100
- **アクセシビリティ**: スコア/100
- **テストカバレッジ**: %

### 発見された問題
1. **Critical**: 即座に修正が必要
2. **High**: リリース前に修正
3. **Medium**: 次回スプリントで修正
4. **Low**: 改善提案

### 改善提案
- パフォーマンス最適化案
- セキュリティ強化案
- 保守性向上案
- ユーザビリティ改善案

### 次回レビューでの重点項目
- 前回指摘事項の修正確認
- 新機能のリスク評価
- アーキテクチャ進化の検討
