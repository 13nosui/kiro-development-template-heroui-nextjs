#!/usr/bin/env node

/**
 * セキュリティチェックスクリプト
 * 環境変数、設定ファイル、依存関係のセキュリティ状況をチェックします
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 セキュリティチェックを開始します...\n');

let hasErrors = false;

// 1. 環境変数テンプレートの存在確認
function checkEnvTemplate() {
  console.log('📋 環境変数テンプレートチェック');
  
  if (!fs.existsSync('.env.example')) {
    console.log('❌ .env.example ファイルが見つかりません');
    hasErrors = true;
  } else {
    console.log('✅ .env.example ファイルが存在します');
    
    // 必要な環境変数がテンプレートに含まれているかチェック
    const envExample = fs.readFileSync('.env.example', 'utf8');
    const requiredVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'FIGMA_ACCESS_TOKEN',
      'ENCRYPTION_KEY'
    ];
    
    requiredVars.forEach(varName => {
      if (envExample.includes(varName)) {
        console.log(`  ✅ ${varName} がテンプレートに含まれています`);
      } else {
        console.log(`  ⚠️  ${varName} がテンプレートに含まれていません`);
      }
    });
  }
  console.log('');
}

// 2. Next.js設定のセキュリティヘッダーチェック
function checkNextConfig() {
  console.log('🛡️  Next.js セキュリティ設定チェック');
  
  if (!fs.existsSync('next.config.js')) {
    console.log('❌ next.config.js ファイルが見つかりません');
    hasErrors = true;
    return;
  }
  
  const nextConfig = fs.readFileSync('next.config.js', 'utf8');
  const securityHeaders = [
    'X-Frame-Options',
    'X-Content-Type-Options', 
    'Content-Security-Policy',
    'Strict-Transport-Security'
  ];
  
  securityHeaders.forEach(header => {
    if (nextConfig.includes(header)) {
      console.log(`  ✅ ${header} が設定されています`);
    } else {
      console.log(`  ❌ ${header} が設定されていません`);
      hasErrors = true;
    }
  });
  console.log('');
}

// 3. .gitignore設定チェック
function checkGitignore() {
  console.log('📁 .gitignore 設定チェック');
  
  if (!fs.existsSync('.gitignore')) {
    console.log('❌ .gitignore ファイルが見つかりません');
    hasErrors = true;
    return;
  }
  
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  const sensitivePatterns = [
    '.env',
    '*.key',
    '*.cert',
    '*.pem'
  ];
  
  sensitivePatterns.forEach(pattern => {
    if (gitignore.includes(pattern)) {
      console.log(`  ✅ ${pattern} が除外設定されています`);
    } else {
      console.log(`  ⚠️  ${pattern} が除外設定されていません`);
    }
  });
  console.log('');
}

// 4. package.jsonのセキュリティスクリプトチェック
function checkPackageScripts() {
  console.log('📦 package.json セキュリティスクリプトチェック');
  
  if (!fs.existsSync('package.json')) {
    console.log('❌ package.json ファイルが見つかりません');
    hasErrors = true;
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const securityScripts = [
    'security:audit',
    'security:check',
    'env:check'
  ];
  
  securityScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`  ✅ ${script} スクリプトが定義されています`);
    } else {
      console.log(`  ❌ ${script} スクリプトが定義されていません`);
      hasErrors = true;
    }
  });
  console.log('');
}

// 5. GitHub Actions設定チェック
function checkGitHubActions() {
  console.log('🔄 GitHub Actions セキュリティ設定チェック');
  
  const ciPath = '.github/workflows/ci.yml';
  if (!fs.existsSync(ciPath)) {
    console.log('❌ GitHub Actions CI設定が見つかりません');
    hasErrors = true;
    return;
  }
  
  const ciConfig = fs.readFileSync(ciPath, 'utf8');
  
  if (ciConfig.includes('npm audit')) {
    console.log('  ✅ 依存関係の脆弱性チェックが設定されています');
  } else {
    console.log('  ❌ 依存関係の脆弱性チェックが設定されていません');
    hasErrors = true;
  }
  
  if (ciConfig.includes('semgrep') || ciConfig.includes('Semgrep')) {
    console.log('  ✅ Semgrepセキュリティスキャンが設定されています');
  } else {
    console.log('  ⚠️  Semgrepセキュリティスキャンが設定されていません');
  }
  
  console.log('');
}

// メイン実行
async function main() {
  checkEnvTemplate();
  checkNextConfig();
  checkGitignore();
  checkPackageScripts();
  checkGitHubActions();
  
  if (hasErrors) {
    console.log('❌ セキュリティチェックでエラーが検出されました');
    process.exit(1);
  } else {
    console.log('✅ セキュリティチェック完了 - 問題ありません');
    process.exit(0);
  }
}

main().catch(console.error);
