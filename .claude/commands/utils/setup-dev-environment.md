---
description: "HeroUIベース開発環境の完全セットアップ"
allowed-tools: ["Bash", "FileSystem"]
---

# HeroUIベース開発環境完全セットアップ

新しい環境でProject Template HeroUIベースプロジェクトの開発環境を完全構築します。

## Prerequisites Check
```bash
# 必要なツールのバージョン確認
echo "🔍 Prerequisites Check..."

# Node.js
NODE_VERSION=$(node --version | cut -d'v' -f2)
echo "Node.js: $NODE_VERSION"
if [[ "$NODE_VERSION" < "18.0.0" ]]; then
  echo "❌ Node.js 18+ required"
  exit 1
fi

# pnpm (推奨パッケージマネージャー)
if ! command -v pnpm &> /dev/null; then
  echo "📦 Installing pnpm..."
  npm install -g pnpm
fi

# Firebase CLI
if ! command -v firebase &> /dev/null; then
  echo "🔥 Installing Firebase CLI..."
  npm install -g firebase-tools
fi

# Vercel CLI
if ! command -v vercel &> /dev/null; then
  echo "▲ Installing Vercel CLI..."
  npm install -g vercel
fi

echo "✅ Prerequisites check complete"
```

## Project Setup
```bash
# リポジトリクローン（新規の場合）
if [[ ! -d ".git" ]]; then
  echo "📂 Cloning repository..."
  git clone https://github.com/sugawaramasaya/ai-development-template-heroui-nextjs.git .
fi

# 依存関係インストール（HeroUI含む）
echo "📦 Installing dependencies with HeroUI..."
pnpm install

# HeroUI設定確認
echo "🎨 Checking HeroUI configuration..."
if ! grep -q "@heroui/react" package.json; then
  echo "⚠️  HeroUI not found in dependencies"
  echo "Run: pnpm add @heroui/react"
fi

# mise設定（Node.js、pnpmバージョン管理）
if [[ -f ".mise.toml" ]]; then
  echo "🔧 Setting up mise..."
  mise install
  mise use
fi
```

## Environment Configuration
```bash
# 環境変数設定
echo "🔧 Environment Configuration..."

# .env.local テンプレート作成
cat > .env.local << EOF
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (サーバーサイド)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_PRIVATE_KEY="your_private_key"
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email

# Vercel
VERCEL_TOKEN=your_vercel_token

# Development
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

echo "📝 Please update .env.local with your actual values"
echo "🔗 Firebase config: https://console.firebase.google.com/"
echo "🔗 Vercel token: https://vercel.com/account/tokens"
```

## Firebase Setup
```bash
# Firebase プロジェクト設定
echo "🔥 Firebase Setup..."

# Firebase login
firebase login

# プロジェクト設定
firebase use --add

# エミュレータ設定
firebase init emulators

# Firestore Rules デプロイ
firebase deploy --only firestore:rules

# Functions設定（必要な場合）
if [[ -d "functions" ]]; then
  cd functions
  npm install
  cd ..
fi

echo "✅ Firebase setup complete"
```

## Development Tools Setup
```bash
# VS Code設定
echo "💻 Development Tools Setup..."

# .vscode/settings.json 作成
mkdir -p .vscode
cat > .vscode/settings.json << EOF
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|\\`)([^']*)(?:'|\"|\\`)"],
    ["className\\s*:\\s*['\"]([^'\"]*)['\"]"]
  ],
  "heroui.intellisense.enabled": true,
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
EOF

# 推奨拡張機能リスト
cat > .vscode/extensions.json << EOF
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "fireflysemantics.vscode-storybook-nextjs",
    "ms-playwright.playwright",
    "heroui.heroui-vscode"
  ]
}
EOF

echo "✅ VS Code configuration created with HeroUI support"
```

## Git Hooks Setup
```bash
# Git hooks設定
echo "🪝 Git Hooks Setup..."

# Husky インストール
npx husky install

# Pre-commit hook
npx husky add .husky/pre-commit "npm run lint:fix && npm run type-check"

# Pre-push hook  
npx husky add .husky/pre-push "npm run test:ci"

# Commit message hook
npx husky add .husky/commit-msg "npx commitlint --edit \$1"

echo "✅ Git hooks configured"
```

## Development Server Test
```bash
# 開発サーバー起動テスト
echo "🚀 Testing Development Server..."

# Next.js 開発サーバー
npm run dev &
DEV_PID=$!
sleep 10

# ヘルスチェック
if curl -f http://localhost:3000; then
  echo "✅ Development server running successfully"
else
  echo "❌ Development server failed to start"
  kill $DEV_PID
  exit 1
fi

# Storybook起動テスト
npm run storybook &
STORYBOOK_PID=$!
sleep 15

if curl -f http://localhost:6006; then
  echo "✅ Storybook running successfully"
else
  echo "❌ Storybook failed to start"
fi

# プロセス停止
kill $DEV_PID $STORYBOOK_PID

echo "✅ Development environment setup complete!"
```

## Setup Verification
```bash
# セットアップ検証
echo "🔍 Setup Verification..."

# 必要なファイルの存在確認
FILES=(
  "package.json"
  "tsconfig.json"
  "tailwind.config.js"
  ".env.local"
  "docs/AI_IMPLEMENTATION_RULES.md"
  "docs/DESIGN_GUIDELINE.md"
)

for file in "${FILES[@]}"; do
  if [[ -f "$file" ]]; then
    echo "✅ $file exists"
  else
    echo "❌ $file missing"
  fi
done

# スクリプト実行テスト
echo "🧪 Testing scripts..."
npm run type-check
npm run lint
npm run build

echo "🎉 Development environment ready!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your Firebase credentials"
echo "2. Run 'npm run dev' to start development"
echo "3. Run 'npm run storybook' for component development"
echo "4. Use Claude Code commands: /figma-to-component, /create-feature-complete, etc."
```
