# Environment and Deployment Configuration Documentation

## Overview

This document provides comprehensive documentation for environment variables, deployment configurations, and CI/CD pipeline setup for the AI Development Template. The application uses a secure, multi-environment deployment strategy with comprehensive security scanning and monitoring.

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Firebase Configuration](#firebase-configuration)
3. [Deployment Architecture](#deployment-architecture)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Security Scanning Processes](#security-scanning-processes)
6. [Environment-Specific Configurations](#environment-specific-configurations)
7. [Deployment Best Practices](#deployment-best-practices)

## Environment Variables

### Environment Variable Categories

The application uses a comprehensive set of environment variables organized by category for security and maintainability:

```mermaid
graph TD
    subgraph "Environment Variables"
        Firebase[Firebase Configuration]
        Security[Security Keys]
        Application[Application Settings]
        ExternalAPI[External APIs]
        Monitoring[Monitoring & Analytics]
        Database[Database Connections]
        Storage[Cloud Storage]
        Development[Development Tools]
    end

    subgraph "Security Levels"
        Public[Public Variables]
        Private[Private Variables]
        Secrets[Secret Variables]
    end

    Firebase --> Public
    Application --> Public
    Security --> Secrets
    ExternalAPI --> Secrets
    Monitoring --> Private
    Database --> Secrets
    Storage --> Secrets
    Development --> Private
```

### Required Environment Variables

#### Firebase Configuration (Required)

```bash
# Firebase Project Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDummyFirebaseApiKey123456789012345678
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dummy-project-12345.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dummy-project-12345
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dummy-project-12345.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890abcdef

# Firebase Admin SDK (Server-side)
FIREBASE_ADMIN_PRIVATE_KEY_ID=dummy_private_key_id
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\ndummy_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@dummy-project.iam.gserviceaccount.com
FIREBASE_ADMIN_CLIENT_ID=123456789012345678901
FIREBASE_ADMIN_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40dummy-project.iam.gserviceaccount.com
```

#### Security Configuration (Required)

```bash
# Encryption and Security Keys
ENCRYPTION_KEY=abcdefghijklmnopqrstuvwxyz123456  # 32+ characters
JWT_SECRET=jwt-secret-key-with-32-chars-minimum-length-required-123456
CSRF_SECRET=csrf-secret-key-with-32-chars-minimum-length-required-123456
SESSION_SECRET=dummy_session_secret_key_64_characters_minimum_with_special_chars
RATE_LIMIT_SECRET=dummy_rate_limit_secret_key_32_chars_minimum
```

#### Application Configuration

```bash
# Application URLs
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com
NEXT_PUBLIC_WS_URL=wss://ws.your-domain.com

# Environment
NODE_ENV=production
```

### Optional Environment Variables

#### External API Integration

```bash
# Figma API Integration
FIGMA_ACCESS_TOKEN=figd_dummy-figma-access-token-123456789
FIGMA_PERSONAL_ACCESS_TOKEN=figd_dummy-figma-personal-access-token-123456
FIGMA_WEBHOOK_SECRET=dummy-figma-webhook-secret

# AI Services
OPENAI_API_KEY=sk-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRST12
ANTHROPIC_API_KEY=sk-ant-dummy_claude_api_key
GOOGLE_AI_API_KEY=dummy_google_ai_api_key
```

#### Monitoring and Analytics

```bash
# Error Monitoring
SENTRY_DSN=https://abc123def456789@abc123def456.ingest.sentry.io/1234567
SENTRY_AUTH_TOKEN=dummy_sentry_auth_token

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_HOTJAR_ID=1234567
NEXT_PUBLIC_LOGROCKET_ID=dummy_logrocket_app_id
```

#### Notification Services

```bash
# Email Services
SENDGRID_API_KEY=SG.dummy_sendgrid_api_key
RESEND_API_KEY=re_dummy_resend_api_key

# Chat Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/dummy/SLACK/WEBHOOK
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/dummy/DISCORD/WEBHOOK
```

#### Cloud Storage

```bash
# AWS S3
AWS_ACCESS_KEY_ID=dummy_aws_access_key_id
AWS_SECRET_ACCESS_KEY=dummy_aws_secret_access_key
AWS_REGION=ap-northeast-1
AWS_S3_BUCKET=dummy-s3-bucket-name

# Cloudinary
CLOUDINARY_CLOUD_NAME=dummy_cloudinary_cloud_name
CLOUDINARY_API_KEY=dummy_cloudinary_api_key
CLOUDINARY_API_SECRET=dummy_cloudinary_api_secret
```

#### Database Connections

```bash
# PostgreSQL (Supabase, etc.)
DATABASE_URL=postgresql://user:password@localhost:5432/database_name

# Redis (Session Management)
REDIS_URL=redis://localhost:6379

# MongoDB
MONGODB_URI=mongodb://localhost:27017/database_name
```

### Environment Variable Validation

The application includes comprehensive environment variable validation:

```typescript
// Environment validation schema
const FirebaseConfigSchema = z.object({
  apiKey: z.string().min(1, "Firebase API key is required"),
  authDomain: z.string().min(1, "Firebase auth domain is required"),
  projectId: z.string().min(1, "Firebase project ID is required"),
  storageBucket: z.string().min(1, "Firebase storage bucket is required"),
  messagingSenderId: z
    .string()
    .min(1, "Firebase messaging sender ID is required"),
  appId: z.string().min(1, "Firebase app ID is required"),
});

const AppConfigSchema = z.object({
  nodeEnv: z.enum(["development", "production", "test"]).default("development"),
  port: z
    .string()
    .regex(/^\d+$/, "Port must be a number")
    .transform(Number)
    .default("3000"),
});
```

## Firebase Configuration

### Firebase Project Setup

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Console as Firebase Console
    participant Project as Firebase Project
    participant App as Next.js App

    Dev->>Console: Create Firebase Project
    Console->>Project: Initialize Project
    Project->>Project: Enable Authentication
    Project->>Project: Enable Firestore
    Project->>Project: Enable Storage
    Project->>Console: Generate Config
    Console->>Dev: Provide Config Keys
    Dev->>App: Configure Environment Variables
    App->>Project: Initialize Firebase SDK
```

### Firebase Services Configuration

#### Authentication Setup

```javascript
// Firebase Authentication configuration
export const auth = app ? getAuth(app) : null;

// Google OAuth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});
```

#### Firestore Security Rules

```javascript
// Firestore security rules structure
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Authentication checks
    function isAuthenticated() {
      return request.auth != null && request.auth.uid != null;
    }

    function isEmailVerified() {
      return isAuthenticated() && request.auth.token.email_verified == true;
    }

    // Data validation
    function isValidDataSize() {
      return request.resource.size < 1024 * 1024; // 1MB limit
    }

    function isSafeString(text) {
      return text is string &&
             !text.matches('.*<script.*') &&
             !text.matches('.*javascript:.*');
    }
  }
}
```

#### Storage Security Rules

```javascript
// Firebase Storage security rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User-specific folders
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId;
    }

    // Public files with size limits
    match /posts/{postId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && request.resource.size < 10 * 1024 * 1024  // 10MB limit
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

## Deployment Architecture

### Multi-Environment Architecture

```mermaid
graph TB
    subgraph "Development Environment"
        DevLocal[Local Development]
        DevFirebase[Firebase Dev Project]
        DevDB[Development Database]
    end

    subgraph "Staging Environment"
        StagingApp[Staging Application]
        StagingFirebase[Firebase Staging Project]
        StagingDB[Staging Database]
    end

    subgraph "Production Environment"
        ProdApp[Production Application]
        ProdFirebase[Firebase Production Project]
        ProdDB[Production Database]
        CDN[CDN/Load Balancer]
        Monitoring[Monitoring Services]
    end

    subgraph "CI/CD Pipeline"
        GitHub[GitHub Repository]
        Actions[GitHub Actions]
        Security[Security Scanning]
        Deploy[Deployment Process]
    end

    DevLocal --> GitHub
    GitHub --> Actions
    Actions --> Security
    Security --> Deploy
    Deploy --> StagingApp
    Deploy --> ProdApp

    StagingApp --> StagingFirebase
    StagingApp --> StagingDB

    ProdApp --> CDN
    CDN --> ProdFirebase
    ProdApp --> ProdDB
    ProdApp --> Monitoring
```

### Deployment Targets

#### Vercel Deployment (Primary)

```yaml
# Vercel deployment configuration
name: Deploy to Vercel
env:
  VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}

steps:
  - name: Deploy to Vercel
    run: |
      npm install -g vercel@latest
      vercel deploy --prod --token $VERCEL_TOKEN --confirm
```

#### Firebase Hosting (Alternative)

```json
{
  "hosting": {
    "public": "out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          }
        ]
      }
    ]
  }
}
```

#### Docker Deployment (Optional)

```dockerfile
# Multi-stage Docker build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## CI/CD Pipeline

### Pipeline Architecture

```mermaid
flowchart TD
    Push[Code Push] --> Trigger[Trigger CI/CD]
    Trigger --> Checkout[Checkout Code]
    Checkout --> Setup[Setup Environment]
    Setup --> Install[Install Dependencies]
    Install --> Lint[Code Linting]
    Lint --> TypeCheck[Type Checking]
    TypeCheck --> SecurityScan[Security Scanning]
    SecurityScan --> Build[Build Application]
    Build --> Test[Run Tests]
    Test --> SecurityAudit[Security Audit]
    SecurityAudit --> Deploy[Deploy to Staging]
    Deploy --> HealthCheck[Health Check]
    HealthCheck --> ProdDeploy[Deploy to Production]
    ProdDeploy --> Notify[Send Notifications]

    SecurityScan -->|Fail| SecurityAlert[Security Alert]
    SecurityAudit -->|Fail| SecurityAlert
    HealthCheck -->|Fail| Rollback[Rollback Deployment]

    SecurityAlert --> Notify
    Rollback --> Notify
```

### GitHub Actions Workflows

#### Main CI/CD Pipeline

```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20.x"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run TypeScript type checking
        run: npm run type-check

      - name: Run ESLint
        run: npm run lint:check

      - name: Build application
        run: npm run build
```

#### Security Scanning Pipeline

```yaml
name: Security Scanning
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run security audit
        run: npm audit --audit-level high

      - name: Check for secrets
        run: npm run security:secrets

      - name: Comprehensive security check
        run: npm run security:check
```

#### Semgrep Security Analysis

```yaml
name: Semgrep SAST Analysis
jobs:
  semgrep:
    runs-on: ubuntu-latest
    container:
      image: semgrep/semgrep
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Semgrep scan
        run: |
          semgrep ci \
            --config p/security-audit \
            --config p/typescript \
            --config p/react \
            --config p/owasp-top-ten \
            --sarif \
            --output semgrep-results.sarif
        env:
          SEMGREP_APP_TOKEN: ${{ secrets.SEMGREP_APP_TOKEN }}
```

### Deployment Pipeline

#### Secure Production Deployment

```yaml
name: Secure Deploy to Production
jobs:
  security-check:
    name: Security Pre-check
    runs-on: ubuntu-latest
    steps:
      - name: Verify environment variables
        env:
          ENCRYPTION_KEY: ${{ secrets.ENCRYPTION_KEY }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
        run: npm run env:validate

      - name: Security audit
        run: |
          npm audit --audit-level=high
          npm run security:secrets
          npm run security:check

      - name: Build test
        run: npm run build

  deploy-production:
    needs: security-check
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Build application
        env:
          # All required environment variables
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.NEXT_PUBLIC_FIREBASE_API_KEY }}
          ENCRYPTION_KEY: ${{ secrets.ENCRYPTION_KEY }}
          # ... other environment variables
        run: npm run build

      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: vercel deploy --prod --token $VERCEL_TOKEN --confirm
```

## Security Scanning Processes

### Automated Security Scanning

```mermaid
flowchart TD
    CodeCommit[Code Commit] --> TriggerScan[Trigger Security Scan]
    TriggerScan --> DependencyScan[Dependency Vulnerability Scan]
    TriggerScan --> StaticAnalysis[Static Code Analysis]
    TriggerScan --> SecretScan[Secret Detection Scan]
    TriggerScan --> LicenseScan[License Compliance Scan]

    DependencyScan --> NPMAudit[NPM Audit]
    StaticAnalysis --> Semgrep[Semgrep SAST]
    StaticAnalysis --> ESLint[ESLint Security Rules]
    SecretScan --> CustomScript[Custom Secret Detection]
    LicenseScan --> LicenseChecker[License Checker]

    NPMAudit --> Results[Scan Results]
    Semgrep --> Results
    ESLint --> Results
    CustomScript --> Results
    LicenseChecker --> Results

    Results --> Evaluation{Critical Issues?}
    Evaluation -->|Yes| BlockDeploy[Block Deployment]
    Evaluation -->|No| AllowDeploy[Allow Deployment]

    BlockDeploy --> SecurityAlert[Security Alert]
    SecurityAlert --> CreateIssue[Create GitHub Issue]
    CreateIssue --> NotifyTeam[Notify Security Team]
```

### Security Scanning Tools

#### 1. NPM Audit

```bash
# Comprehensive dependency vulnerability scanning
npm audit --audit-level=high
npm audit --json > vulnerability-report.json
```

#### 2. Semgrep Static Analysis

```bash
# Security-focused static code analysis
semgrep ci \
  --config p/security-audit \
  --config p/typescript \
  --config p/react \
  --config p/owasp-top-ten \
  --config p/javascript \
  --config p/nextjs
```

#### 3. Custom Security Checks

```javascript
// Custom security scanning script
const securityChecks = [
  "checkEnvTemplate",
  "checkNextConfig",
  "checkGitignore",
  "checkPackageScripts",
  "checkGitHubActions",
  "checkDependencyVulnerabilities",
  "checkSourceCodeSecurity",
];
```

#### 4. License Compliance

```bash
# License compliance checking
npx license-checker \
  --onlyAllow="MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC" \
  --summary
```

### Weekly Security Reports

```yaml
name: Weekly Security Report
on:
  schedule:
    - cron: "0 0 * * 5" # Every Friday at midnight UTC

jobs:
  generate-security-report:
    runs-on: ubuntu-latest
    steps:
      - name: Run comprehensive security scan
        run: npm run security:full

      - name: Generate security metrics
        run: |
          npm audit --json > vulnerability-report.json
          npm outdated --json > outdated-packages.json

      - name: Create security report
        run: |
          # Generate detailed security report
          # Include vulnerability analysis
          # Add recommendations

      - name: Send notifications
        if: always()
        run: |
          # Send Slack/Discord notifications
          # Create GitHub issues for critical findings
```

## Environment-Specific Configurations

### Development Environment

```bash
# Development-specific settings
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug
MOCK_MODE=false

# Local Firebase Emulator
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199
```

### Staging Environment

```bash
# Staging-specific settings
NODE_ENV=staging
DEBUG=false
LOG_LEVEL=info

# Staging Firebase project
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-staging
```

### Production Environment

```bash
# Production-specific settings
NODE_ENV=production
DEBUG=false
LOG_LEVEL=error

# Production Firebase project
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-production

# Production security settings
STRICT_TRANSPORT_SECURITY=max-age=31536000; includeSubDomains; preload
```

### Next.js Configuration

```javascript
// Environment-specific Next.js configuration
const nextConfig = {
  // Security headers for all environments
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
        {
          key: "Content-Security-Policy",
          value: "default-src 'self'; script-src 'self' 'unsafe-inline';",
        },
      ],
    },
  ],

  // Environment-specific image domains
  images: {
    domains:
      process.env.NODE_ENV === "production"
        ? ["firebasestorage.googleapis.com"]
        : ["localhost", "firebasestorage.googleapis.com"],
  },
};
```

## Deployment Best Practices

### Pre-Deployment Checklist

- [ ] Environment variables validated
- [ ] Security audit passed
- [ ] Dependencies updated and scanned
- [ ] Build successful
- [ ] Tests passing
- [ ] Security headers configured
- [ ] Firebase rules deployed
- [ ] Monitoring configured

### Post-Deployment Verification

```bash
# Health check script
#!/bin/bash
DEPLOY_URL=$1

echo "🏥 Health check for $DEPLOY_URL"

# SSL certificate check
echo "🔒 SSL certificate check..."
echo | openssl s_client -servername $(echo $DEPLOY_URL | sed 's|https://||') \
  -connect $(echo $DEPLOY_URL | sed 's|https://||'):443 2>/dev/null | \
  openssl x509 -noout -dates

# Security headers check
echo "🛡️ Security headers check..."
curl -I "$DEPLOY_URL" | grep -E "(X-Frame-Options|X-Content-Type-Options|Strict-Transport-Security)"

# Application health check
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL")
if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ Health check passed (HTTP $HTTP_STATUS)"
else
  echo "⚠️ Health check warning (HTTP $HTTP_STATUS)"
fi
```

### Rollback Strategy

```yaml
# Rollback deployment workflow
name: Rollback Deployment
on:
  workflow_dispatch:
    inputs:
      environment:
        description: "Environment to rollback"
        required: true
        type: choice
        options: ["staging", "production"]

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - name: Rollback Vercel deployment
        run: |
          # Get previous deployment
          PREV_DEPLOYMENT=$(vercel ls --token $VERCEL_TOKEN | head -2 | tail -1)

          # Promote previous deployment
          vercel promote $PREV_DEPLOYMENT --token $VERCEL_TOKEN

      - name: Verify rollback
        run: |
          # Health check on rolled back deployment
          # Notify team of rollback completion
```

### Monitoring and Alerting

```yaml
# Deployment monitoring
- name: Setup monitoring
  run: |
    # Configure Sentry release tracking
    sentry-cli releases new ${{ github.sha }}
    sentry-cli releases set-commits ${{ github.sha }} --auto

    # Configure error tracking
    # Setup performance monitoring
    # Configure uptime monitoring
```

This comprehensive documentation provides complete coverage of environment configuration, deployment architecture, and CI/CD processes for the AI Development Template, ensuring secure and reliable deployments across all environments.
