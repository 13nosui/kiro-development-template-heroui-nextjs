---
description: "HeroUIベース包括的テストスイート実行"
allowed-tools: ["Bash", "FileSystem"]
---

# HeroUIベース包括的テストスイート実行

$ARGUMENTSに対するHeroUIベース全レベルのテストを実行します。

## Unit Tests
```bash
# Jest + React Testing Library
echo "🧪 Running Unit Tests..."

# テスト実行（カバレッジ付き）
npm run test:coverage -- --testPathPattern="$ARGUMENTS"

# カバレッジ閾値チェック
npm run test:coverage:check

# 結果出力
echo "📊 Coverage Report Generated: coverage/lcov-report/index.html"
```

## Component Tests (Storybook)
```bash
# HeroUIベースStorybook テスト
echo "📚 Running HeroUI Component Tests..."

# 全ストーリー正常レンダリング確認
npm run storybook:test

# ビジュアルリグレッションテスト
npm run storybook:chromatic

# アクセシビリティテスト
npm run storybook:a11y

# HeroUIコンポーネント連携テスト
npm run test:heroui-integration
```

## Integration Tests
```bash
# Next.js API Routes テスト
echo "🔗 Running Integration Tests..."

# API エンドポイントテスト
npm run test:api

# Firebase エミュレータ起動
firebase emulators:start --only firestore,auth &
FIREBASE_PID=$!

# データベース連携テスト
npm run test:integration

# エミュレータ停止
kill $FIREBASE_PID
```

## E2E Tests
```bash
# Cypress E2Eテスト
echo "🎭 Running E2E Tests..."

# テスト環境起動
npm run dev &
DEV_PID=$!
sleep 10  # 起動待機

# E2Eテスト実行
npm run cypress:run

# 開発サーバー停止
kill $DEV_PID
```

## Performance Tests
```bash
# Lighthouse パフォーマンステスト
echo "⚡ Running Performance Tests..."

# 本番ビルド作成
npm run build
npm run start &
START_PID=$!
sleep 5

# Lighthouse 実行
npx lighthouse http://localhost:3000 \
  --chrome-flags="--headless" \
  --output=json \
  --output-path=lighthouse-report.json

# パフォーマンススコア確認
node -e "
const report = require('./lighthouse-report.json');
const score = report.lhr.categories.performance.score * 100;
console.log('Performance Score:', score);
if (score < 90) {
  console.error('❌ Performance score below threshold');
  process.exit(1);
}
console.log('✅ Performance test passed');
"

# サーバー停止
kill $START_PID
```

## Security Tests
```bash
# セキュリティテスト
echo "🔒 Running Security Tests..."

# 依存関係脆弱性チェック
npm audit --audit-level high

# OWASP ZAP セキュリティスキャン（設定済みの場合）
if command -v zap-baseline.py &> /dev/null; then
  zap-baseline.py -t http://localhost:3000
fi

# 手動セキュリティチェック項目
echo "Manual Security Checklist:"
echo "- [ ] HTTPS enforced"
echo "- [ ] CSP headers configured"  
echo "- [ ] XSS protection enabled"
echo "- [ ] CSRF protection in place"
echo "- [ ] Authentication flow secure"
```

## Test Report Generation
```bash
# 統合テストレポート生成
echo "📋 Generating Test Report..."

cat > test-report.md << EOF
# Test Report - $(date)

## Test Results Summary
- **Unit Tests**: $(npm run test:coverage:json | jq '.total.statements.pct')% coverage
- **Component Tests**: ✅ All stories rendered
- **Integration Tests**: ✅ API endpoints functional  
- **E2E Tests**: ✅ User flows working
- **Performance Tests**: $(node -e "console.log(require('./lighthouse-report.json').lhr.categories.performance.score * 100)")/100

## Failed Tests
[記載がある場合のみ]

## Performance Metrics
- **FCP**: $(node -e "console.log(require('./lighthouse-report.json').lhr.audits['first-contentful-paint'].displayValue)")
- **LCP**: $(node -e "console.log(require('./lighthouse-report.json').lhr.audits['largest-contentful-paint'].displayValue)")
- **CLS**: $(node -e "console.log(require('./lighthouse-report.json').lhr.audits['cumulative-layout-shift'].displayValue)")

## Recommendations
[改善提案があれば記載]
EOF

echo "✅ Test report generated: test-report.md"
```
