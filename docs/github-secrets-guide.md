# 🔐 GitHub Secrets 活用ガイド

## 概要

GitHub Secrets は、機密情報を安全に管理し、GitHub Actions ワークフロー内で使用するための機能です。
このガイドでは、プロジェクトで必要な機密情報を適切に管理する方法を説明します。

## 🎯 GitHub Secrets とは

GitHub Secrets は以下の特徴を持ちます：

- **暗号化された保存**: すべてのシークレットは暗号化されて保存
- **アクセス制御**: リポジトリまたは組織レベルでのアクセス制御
- **ワークフロー専用**: GitHub Actions 内でのみアクセス可能
- **ログ非表示**: ワークフローログでシークレット値は自動的にマスク

## 📋 必要なSecrets一覧

### 🔥 Firebase関連（必須）

```bash
# Firebase プロジェクト設定
NEXT_PUBLIC_FIREBASE_API_KEY        # Firebase API キー
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN    # Firebase 認証ドメイン
NEXT_PUBLIC_FIREBASE_PROJECT_ID     # Firebase プロジェクトID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET # Firebase ストレージバケット
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID # Firebase メッセージング送信者ID
NEXT_PUBLIC_FIREBASE_APP_ID         # Firebase アプリID

# Firebase Admin SDK（サーバーサイド）
FIREBASE_ADMIN_PRIVATE_KEY_ID       # Firebase Admin 秘密キーID
FIREBASE_ADMIN_PRIVATE_KEY          # Firebase Admin 秘密キー
FIREBASE_ADMIN_CLIENT_EMAIL         # Firebase Admin クライアントEmail
FIREBASE_ADMIN_CLIENT_ID            # Firebase Admin クライアントID
FIREBASE_ADMIN_CLIENT_X509_CERT_URL # Firebase Admin X509証明書URL
```

### 🔒 セキュリティ関連（必須）

```bash
ENCRYPTION_KEY      # データ暗号化キー（32文字以上）
JWT_SECRET          # JWT認証シークレット（32文字以上）
CSRF_SECRET         # CSRF攻撃防止シークレット（32文字以上）
SESSION_SECRET      # セッション暗号化キー（64文字以上）
RATE_LIMIT_SECRET   # レート制限シークレット
```

### 🌐 アプリケーション設定

```bash
NEXT_PUBLIC_APP_URL     # 本番環境URL
NEXT_PUBLIC_API_BASE_URL # API ベースURL
NEXT_PUBLIC_WS_URL      # WebSocket URL
```

### 🎨 外部API（オプション）

```bash
FIGMA_ACCESS_TOKEN          # Figma アクセストークン
FIGMA_WEBHOOK_SECRET        # Figma Webhook シークレット
FIGMA_PERSONAL_ACCESS_TOKEN # Figma Personal Access Token
OPENAI_API_KEY              # OpenAI API キー
ANTHROPIC_API_KEY           # Claude API キー
GOOGLE_AI_API_KEY           # Google AI Studio API キー
```

### 📧 通知サービス（オプション）

```bash
SENDGRID_API_KEY       # SendGrid API キー
RESEND_API_KEY         # Resend API キー
SLACK_WEBHOOK_URL      # Slack Webhook URL
DISCORD_WEBHOOK_URL    # Discord Webhook URL
```

### 📊 監視・分析（本番推奨）

```bash
SENTRY_DSN           # Sentry DSN
SENTRY_AUTH_TOKEN    # Sentry 認証トークン
NEXT_PUBLIC_GA_ID    # Google Analytics ID
NEXT_PUBLIC_HOTJAR_ID # Hotjar サイトID
```

### ☁️ クラウドサービス（オプション）

```bash
# AWS
AWS_ACCESS_KEY_ID     # AWS アクセスキーID
AWS_SECRET_ACCESS_KEY # AWS シークレットアクセスキー
AWS_REGION           # AWS リージョン
AWS_S3_BUCKET        # S3 バケット名

# Cloudinary
CLOUDINARY_CLOUD_NAME # Cloudinary クラウド名
CLOUDINARY_API_KEY    # Cloudinary API キー
CLOUDINARY_API_SECRET # Cloudinary API シークレット
```

## 🚀 Secrets の設定方法

### 1. リポジトリSecrets の設定

#### Web UI での設定

1. GitHub リポジトリページに移動
2. **Settings** タブをクリック
3. 左サイドバーの **Secrets and variables** → **Actions** をクリック
4. **New repository secret** ボタンをクリック
5. Secret 名と値を入力して **Add secret** をクリック

#### GitHub CLI での設定

```bash
# GitHub CLI を使用した一括設定
gh secret set ENCRYPTION_KEY --body "your_32_character_encryption_key_here"
gh secret set JWT_SECRET --body "your_jwt_secret_key_here"
gh secret set CSRF_SECRET --body "your_csrf_secret_key_here"

# ファイルから設定
gh secret set FIREBASE_ADMIN_PRIVATE_KEY < firebase-private-key.pem

# 環境変数から設定
gh secret set OPENAI_API_KEY --body "$OPENAI_API_KEY"
```

### 2. Organization Secrets の設定（複数リポジトリ共有）

```bash
# Organization レベルでのSecret設定
gh secret set ENCRYPTION_KEY --org your-org --body "shared_encryption_key"

# 特定のリポジトリのみに適用
gh secret set API_KEY --org your-org --repos "repo1,repo2" --body "shared_api_key"
```

### 3. Environment Secrets の設定（環境別）

```bash
# 本番環境用Secret
gh secret set DATABASE_URL --env production --body "production_db_url"

# ステージング環境用Secret
gh secret set DATABASE_URL --env staging --body "staging_db_url"
```

## 🔧 GitHub Actions での使用方法

### 基本的な使用例

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        env:
          # Firebase設定
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.NEXT_PUBLIC_FIREBASE_API_KEY }}
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN }}
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_PROJECT_ID }}
          
          # セキュリティ設定
          ENCRYPTION_KEY: ${{ secrets.ENCRYPTION_KEY }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
          CSRF_SECRET: ${{ secrets.CSRF_SECRET }}
          
          # 外部API
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          FIGMA_ACCESS_TOKEN: ${{ secrets.FIGMA_ACCESS_TOKEN }}
        run: npm run build
      
      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
        run: |
          npm install -g vercel
          vercel --token $VERCEL_TOKEN --prod
```

### 環境別デプロイ

```yaml
# .github/workflows/deploy-env.yml
name: Deploy to Environment

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        default: 'staging'
        type: choice
        options:
        - staging
        - production

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Build and Deploy
        env:
          # 環境別のSecret使用
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          API_ENDPOINT: ${{ secrets.API_ENDPOINT }}
          DEPLOYMENT_KEY: ${{ secrets.DEPLOYMENT_KEY }}
        run: |
          echo "Deploying to ${{ github.event.inputs.environment }}"
          npm run build
          npm run deploy:${{ github.event.inputs.environment }}
```

### セキュリティテスト付きワークフロー

```yaml
# .github/workflows/security-check.yml
name: Security Check

on:
  pull_request:
    branches: [main, develop]

jobs:
  security-audit:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Security audit
        run: npm audit --audit-level=high
      
      - name: Environment validation
        env:
          # テスト用の最小限のSecret
          ENCRYPTION_KEY: ${{ secrets.ENCRYPTION_KEY }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
        run: |
          npm run env:validate
          npm run security:check
      
      - name: Secrets scan
        run: |
          npm run security:secrets
          
      - name: SAST with Semgrep
        env:
          SEMGREP_APP_TOKEN: ${{ secrets.SEMGREP_APP_TOKEN }}
        run: |
          python -m pip install semgrep
          semgrep --config=auto --json --output=semgrep-results.json
```

## 🛡️ セキュリティベストプラクティス

### 1. Secret の管理原則

- **最小権限の原則**: 必要最小限のSecretsのみ設定
- **定期的なローテーション**: APIキーは定期的に更新
- **環境分離**: 本番・ステージング・開発環境でSecret分離
- **アクセスログ監視**: Secret使用履歴の定期確認

### 2. Secret の命名規則

```bash
# ✅ 良い例
NEXT_PUBLIC_FIREBASE_API_KEY    # Public変数は明示
FIREBASE_ADMIN_PRIVATE_KEY      # 用途が明確
ENCRYPTION_KEY                  # 簡潔で分かりやすい

# ❌ 悪い例
KEY1                           # 用途不明
firebase_key                   # 一貫性なし
SUPER_SECRET_KEY_FOR_ENCRYPTION # 冗長
```

### 3. Secret の値の形式

```bash
# 強力なSecret生成例
ENCRYPTION_KEY=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -base64 64)
SESSION_SECRET=$(openssl rand -base64 128)

# Firebase Private Key（改行をエスケープ）
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7..."
```

### 4. 緊急時の対応

```bash
# 漏洩時の緊急対応
gh secret delete COMPROMISED_SECRET
gh secret set NEW_SECRET --body "new_secure_value"

# 全Secretの一括更新スクリプト
./scripts/rotate-secrets.sh
```

## 📊 Secrets の監査とモニタリング

### 1. 使用状況の確認

```bash
# Secret使用履歴の確認
gh api repos/:owner/:repo/actions/secrets

# 最近のワークフロー実行確認
gh run list --workflow=deploy.yml
```

### 2. 自動監査スクリプト

```bash
#!/bin/bash
# scripts/audit-secrets.sh

echo "🔍 GitHub Secrets 監査開始"

# 必須Secretsの確認
REQUIRED_SECRETS=(
  "ENCRYPTION_KEY"
  "JWT_SECRET"
  "CSRF_SECRET"
  "NEXT_PUBLIC_FIREBASE_API_KEY"
)

for secret in "${REQUIRED_SECRETS[@]}"; do
  if gh secret list | grep -q "$secret"; then
    echo "✅ $secret が設定されています"
  else
    echo "❌ $secret が設定されていません"
  fi
done

echo "📊 監査完了"
```

### 3. 定期的なSecret更新

```yaml
# .github/workflows/rotate-secrets.yml
name: Rotate Secrets

on:
  schedule:
    - cron: '0 2 1 * *'  # 毎月1日午前2時
  workflow_dispatch:

jobs:
  rotate:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Rotate API Keys
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          # APIキーの自動更新ロジック
          echo "🔄 API keys rotation started"
          # 実際のローテーション処理をここに実装
```

## 🔗 関連リソース

### 公式ドキュメント
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitHub CLI Secrets](https://cli.github.com/manual/gh_secret)

### セキュリティガイド
- [OWASP Secrets Management](https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_secrets)
- [NIST Special Publication 800-57](https://csrc.nist.gov/publications/detail/sp/800-57-part-1/rev-5/final)

### プロジェクト内の関連ファイル
- `.env.example` - 環境変数テンプレート
- `src/lib/crypto.ts` - 暗号化ユーティリティ
- `src/lib/secure-storage.ts` - セキュアストレージ
- `scripts/validate-env.js` - 環境変数検証
- `scripts/security-check.js` - セキュリティチェック

---

**🚨 重要な注意事項**

1. **絶対にSecretをコードにハードコーディングしないでください**
2. **`.env.local` ファイルをGitにコミットしないでください**
3. **Secretは定期的にローテーションしてください**
4. **不要になったSecretは即座に削除してください**
5. **チームメンバーには必要最小限のSecretのみ共有してください**
