---
description: "HeroUIベース本番環境への安全なデプロイメント"
allowed-tools: ["Bash", "FileSystem"]
---

# HeroUIベース本番環境デプロイメント

$ARGUMENTSをHeroUIベース本番環境に安全にデプロイします。

## Pre-Deploy チェック (必須)
```bash
#!/bin/bash
set -e

echo "🔍 Pre-Deploy Quality Check開始..."

# 1. Git状態確認
if [[ -n $(git status --porcelain) ]]; then
  echo "❌ Uncommitted changes detected"
  git status
  exit 1
fi

# 2. 現在のブランチ確認
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" ]]; then
  echo "❌ Not on main branch. Current: $CURRENT_BRANCH"
  exit 1
fi

# 3. 依存関係チェック
echo "📦 Dependencies check..."
npm ci

# 4. 型チェック
echo "🔍 TypeScript check..."
npx tsc --noEmit

# 5. Lint チェック
echo "🔍 ESLint check..."
npx eslint . --ext .ts,.tsx --max-warnings 0

# 6. テスト実行
echo "🧪 Running tests..."
npm run test:ci

# 7. ビルドテスト
echo "🏗️ Build test..."
npm run build

echo "✅ All pre-deploy checks passed!"
```

## Environment Setup
```bash
# 環境変数確認
echo "🔧 Environment variables check..."

REQUIRED_VARS=(
  "NEXT_PUBLIC_FIREBASE_API_KEY"
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
  "FIREBASE_ADMIN_PRIVATE_KEY"
  "VERCEL_TOKEN"
)

for var in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!var}" ]]; then
    echo "❌ Missing required environment variable: $var"
    exit 1
  fi
done

echo "✅ All environment variables configured"
```

## Firebase Deploy
```bash
# Firebase Functions デプロイ
echo "🔥 Deploying Firebase Functions..."
npm run build:functions
firebase deploy --only functions

# Firestore Rules デプロイ  
echo "🔥 Deploying Firestore Rules..."
firebase deploy --only firestore:rules

# Firebase Storage Rules デプロイ
echo "🔥 Deploying Storage Rules..."
firebase deploy --only storage
```

## Vercel Deploy
```bash
# Vercel本番デプロイ
echo "▲ Deploying to Vercel..."

# プロダクションデプロイ実行
vercel --prod --confirm

# デプロイURL取得
DEPLOY_URL=$(vercel ls --scope personal | grep "$PROJECT_NAME" | head -1 | awk '{print $2}')
echo "🌐 Deployed to: https://$DEPLOY_URL"
```

## Post-Deploy Verification
```bash
# 本番環境動作確認
echo "🔍 Post-deploy verification..."

# ヘルスチェック
curl -f "https://$DEPLOY_URL/api/health" || {
  echo "❌ Health check failed"
  exit 1
}

# HeroUIコンポーネント読み込み確認
curl -s "https://$DEPLOY_URL" | grep -q "heroui" && echo "✅ HeroUI loaded" || echo "⚠️  HeroUI not detected"

# 主要ページアクセス確認
PAGES=("/" "/login" "/mypage" "/home" "/settings")
for page in "${PAGES[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$DEPLOY_URL$page")
  if [[ $STATUS -ne 200 ]]; then
    echo "❌ Page $page returned status $STATUS"
    exit 1
  fi
  echo "✅ Page $page: OK"
done

# Performance test
echo "⚡ Performance check..."
npx lighthouse "https://$DEPLOY_URL" --chrome-flags="--headless" --output=json --output-path=./lighthouse-report.json

# Core Web Vitals スコア確認
node -e "
const report = require('./lighthouse-report.json');
const scores = report.lhr.categories;
console.log('Performance:', scores.performance.score * 100);
console.log('Accessibility:', scores.accessibility.score * 100);
console.log('Best Practices:', scores['best-practices'].score * 100);
console.log('SEO:', scores.seo.score * 100);
"
```

## Rollback Plan
```bash
# 問題発生時のロールバック手順
if [[ "$1" == "--rollback" ]]; then
  echo "🔄 Rolling back deployment..."
  
  # 前回のデプロイメント確認
  PREVIOUS_DEPLOYMENT=$(vercel ls --scope personal | grep "$PROJECT_NAME" | sed -n '2p' | awk '{print $1}')
  
  if [[ -n "$PREVIOUS_DEPLOYMENT" ]]; then
    # 前回デプロイメントを本番に昇格
    vercel promote "$PREVIOUS_DEPLOYMENT" --scope personal
    echo "✅ Rolled back to: $PREVIOUS_DEPLOYMENT"
  else
    echo "❌ No previous deployment found"
    exit 1
  fi
fi
```

## Monitoring Setup
```bash
# デプロイ後モニタリング設定
echo "📊 Setting up monitoring..."

# Vercel Analytics確認
vercel analytics

# Sentry リリース作成（設定済みの場合）
if command -v sentry-cli &> /dev/null; then
  RELEASE=$(git rev-parse HEAD)
  sentry-cli releases new "$RELEASE"
  sentry-cli releases set-commits "$RELEASE" --auto
  sentry-cli releases finalize "$RELEASE"
fi
```

## Deployment Report
デプロイ完了後、以下のレポートを生成：

```markdown
# HeroUI Deployment Report - $(date)

## Summary
- **Project**: Project Template (HeroUI-based)
- **Target**: $ARGUMENTS
- **Deployment URL**: https://$DEPLOY_URL
- **Git Commit**: $(git rev-parse HEAD)
- **Deploy Time**: $(date)

## HeroUI Integration Status
- **HeroUI Components**: Loaded successfully
- **Theme Configuration**: Applied
- **Bundle Size Impact**: [Record impact]

## Quality Metrics
- **Performance Score**: /100
- **Accessibility Score**: /100
- **Best Practices**: /100
- **SEO Score**: /100

## Deploy Steps Completed
- [ ] Pre-deploy quality checks
- [ ] HeroUI bundle optimization
- [ ] Firebase Functions deployment
- [ ] Firestore rules deployment
- [ ] Vercel production deployment
- [ ] Post-deploy verification
- [ ] Performance monitoring setup

## Known Issues
[発見された問題があれば記載]

## Next Actions
[必要なフォローアップアクション]
```

## Emergency Contacts
デプロイ時の緊急連絡先とエスカレーション手順：
- 即座にロールバック: `claude deploy-production --rollback`
- パフォーマンス問題: Vercel Analyticsで確認
- Firebase問題: Firebase Consoleで確認
