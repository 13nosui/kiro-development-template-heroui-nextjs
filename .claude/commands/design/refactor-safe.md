---
description: "HeroUIベース安全な段階的リファクタリング実行"
allowed-tools: ["FileSystem", "Bash"]
---

# HeroUIベース段階的安全リファクタリング

$ARGUMENTSコンポーネントを docs/REFACTORING_GUIDE.md の4段階手順でHeroUIベースに安全にリファクタリングします。

## 事前確認
```bash
# 現在のファイル状況確認
find src -name "*${ARGUMENTS}*" -type f

# Git状態確認
git status
git stash push -m "refactor-${ARGUMENTS}-backup-$(date +%Y%m%d-%H%M%S)"
```

## Phase 1: HeroUIコンポーネント構造変更（見た目保持）
**実行前スクリーンショット保存**
```bash
# Storybookでスクリーンショット取得
npm run storybook:screenshot ${ARGUMENTS}
```

**変更内容：**
- 既存HTML構造 → HeroUIコンポーネント移行
- classNameの整理（HeroUIプロパティへ変換）
- コンポーネント分割/統合

**変更禁止：**
- 色の変更
- サイズの変更
- 余白の変更
- 動作の変更

**完了確認：**
```bash
# 実装後スクリーンショット比較
npm run storybook:screenshot ${ARGUMENTS} -- --compare
```

## Phase 2: HeroUIカラーシステム更新
**対象トークン確認：**
```bash
# 現在使用中のカラー抽出
grep -r "text-\|bg-\|border-" src/components/${ARGUMENTS}/
```

**実行内容：**
- 旧カラートークン → HeroUIカラーシステムへ変更
- HeroUI定義済みカラーのみ使用
- カラーパレットのHeroUI準拠

**変更例：**
```diff
- className="text-blue-600 bg-blue-50 border-blue-200"
+ <Button color="primary" variant="light" />
```

**確認項目：**
- [ ] 色のみが変更されている
- [ ] レイアウトに影響なし
- [ ] HeroUIカラーシステムとの統一確認

## Phase 3: HeroUIスペーシングシステム最適化
**現在のスペーシング確認：**
```bash
# スペーシング系クラス抽出
grep -r "p-\|m-\|gap-\|space-" src/components/${ARGUMENTS}/
```

**実行内容：**
- padding/margin値の最適化
- HeroUIスペーシングトークンへの統一
- HeroUIレイアウトシステムとの整合性確保

**変更例：**
```diff
- className="px-4 py-2 gap-2"
+ <Button size="md" /> {/* HeroUIの標準サイズ使用 */
```

## Phase 4: 最終統合確認
**包括的品質チェック：**
```bash
# TypeScript型チェック
npx tsc --noEmit

# ESLint/Prettier
npm run lint:fix

# ビルドテスト
npm run build

# Storybookビルドテスト
npm run build-storybook
```

**完了条件チェック：**
- [ ] Figmaデザインと1px単位で一致
- [ ] HeroUIデザインシステム完全準拠
- [ ] 他コンポーネントとの整合性確認
- [ ] アクセシビリティ問題なし
- [ ] パフォーマンス劣化なし

**最終報告：**
1. 変更サマリー
2. 使用HeroUIコンポーネント一覧
3. 改善されたポイント
4. 今後の改善提案
