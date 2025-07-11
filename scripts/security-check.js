#!/usr/bin/env node

/**
 * 強化されたセキュリティチェックスクリプト
 * 環境変数、設定ファイル、依存関係のセキュリティ状況を包括的にチェックします
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔒 強化されたセキュリティチェックを開始します...\n');

let hasErrors = false;
let hasWarnings = false;
const securityReport = {
  timestamp: new Date().toISOString(),
  checks: {},
  vulnerabilities: [],
  recommendations: []
};

// 1. 環境変数テンプレートの存在確認（強化版）
function checkEnvTemplate() {
  console.log('📋 環境変数テンプレートチェック');
  const result = { status: 'pass', details: [], warnings: [] };
  
  if (!fs.existsSync('.env.example')) {
    console.log('❌ .env.example ファイルが見つかりません');
    result.status = 'fail';
    result.details.push('.env.example file missing');
    hasErrors = true;
  } else {
    console.log('✅ .env.example ファイルが存在します');
    result.details.push('.env.example file exists');
    
    // 必要な環境変数がテンプレートに含まれているかチェック
    const envExample = fs.readFileSync('.env.example', 'utf8');
    const requiredVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'FIGMA_ACCESS_TOKEN',
      'ENCRYPTION_KEY',
      'JWT_SECRET',
      'CSRF_SECRET'
    ];
    
    const missingVars = [];
    requiredVars.forEach(varName => {
      if (envExample.includes(varName)) {
        console.log(`  ✅ ${varName} がテンプレートに含まれています`);
        result.details.push(`${varName} included in template`);
      } else {
        console.log(`  ⚠️  ${varName} がテンプレートに含まれていません`);
        result.warnings.push(`${varName} missing from template`);
        missingVars.push(varName);
        hasWarnings = true;
      }
    });
    
    // 機密情報のハードコーディングチェック
    const dangerousPatterns = [
      /[A-Za-z0-9]{32,}/g, // 長い文字列（APIキーの可能性）
      /sk-[A-Za-z0-9]{48}/g, // OpenAI APIキーパターン
      /xoxb-[0-9]{11}-[0-9]{11}-[A-Za-z0-9]{24}/g // Slack Token
    ];
    
    dangerousPatterns.forEach(pattern => {
      if (pattern.test(envExample)) {
        console.log('  ⚠️  実際の機密情報がテンプレートに含まれている可能性があります');
        result.warnings.push('Potential real secrets in template');
        hasWarnings = true;
      }
    });
  }
  
  securityReport.checks.envTemplate = result;
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

// 6. 依存関係の脆弱性詳細チェック
function checkDependencyVulnerabilities() {
  console.log('🔍 依存関係脆弱性詳細チェック');
  const result = { status: 'pass', details: [], warnings: [] };
  
  try {
    // npm audit を実行して詳細な脆弱性情報を取得
    console.log('  📊 依存関係スキャン実行中...');
    const auditOutput = execSync('npm audit --json', { encoding: 'utf8' });
    const auditData = JSON.parse(auditOutput);
    
    if (auditData.vulnerabilities && Object.keys(auditData.vulnerabilities).length > 0) {
      const criticalCount = Object.values(auditData.vulnerabilities).filter(v => v.severity === 'critical').length;
      const highCount = Object.values(auditData.vulnerabilities).filter(v => v.severity === 'high').length;
      const moderateCount = Object.values(auditData.vulnerabilities).filter(v => v.severity === 'moderate').length;
      
      console.log(`  ⚠️  脆弱性発見: Critical(${criticalCount}), High(${highCount}), Moderate(${moderateCount})`);
      
      if (criticalCount > 0 || highCount > 0) {
        result.status = 'fail';
        hasErrors = true;
        securityReport.vulnerabilities.push(...Object.values(auditData.vulnerabilities).filter(v => v.severity === 'critical' || v.severity === 'high'));
      } else if (moderateCount > 0) {
        result.status = 'warning';
        hasWarnings = true;
      }
      
      result.details.push(`Vulnerabilities found: Critical(${criticalCount}), High(${highCount}), Moderate(${moderateCount})`);
    } else {
      console.log('  ✅ 重大な脆弱性は検出されませんでした');
      result.details.push('No critical vulnerabilities found');
    }
  } catch (error) {
    console.log('  ⚠️  npm audit の実行に失敗しました:', error.message);
    result.warnings.push('npm audit execution failed');
    hasWarnings = true;
  }
  
  securityReport.checks.dependencyVulnerabilities = result;
  console.log('');
}

// 7. ソースコード内のセキュリティ問題チェック
function checkSourceCodeSecurity() {
  console.log('🔎 ソースコードセキュリティチェック');
  const result = { status: 'pass', details: [], warnings: [] };
  
  const srcDir = 'src';
  if (!fs.existsSync(srcDir)) {
    console.log('  ⚠️  src ディレクトリが見つかりません');
    result.warnings.push('src directory not found');
    hasWarnings = true;
    return;
  }
  
  // 危険なパターンをチェック
  const dangerousPatterns = [
    { pattern: /eval\s*\(/g, description: 'eval() usage detected', severity: 'high' },
    { pattern: /innerHTML\s*=/g, description: 'innerHTML usage detected', severity: 'medium' },
    { pattern: /document\.write\s*\(/g, description: 'document.write() usage detected', severity: 'high' },
    { pattern: /\$\{.*\}/g, description: 'Template literal in sensitive context', severity: 'low' },
    { pattern: /localStorage\.setItem.*password/gi, description: 'Password stored in localStorage', severity: 'critical' },
    { pattern: /sessionStorage\.setItem.*token/gi, description: 'Token stored in sessionStorage', severity: 'medium' }
  ];
  
  function scanFile(filePath) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx') && !filePath.endsWith('.js') && !filePath.endsWith('.jsx')) {
      return;
    }
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      dangerousPatterns.forEach(({ pattern, description, severity }) => {
        const matches = content.match(pattern);
        if (matches) {
          const message = `${description} in ${filePath} (${matches.length} occurrences)`;
          console.log(`  ⚠️  ${message}`);
          
          if (severity === 'critical' || severity === 'high') {
            result.status = 'fail';
            hasErrors = true;
          } else {
            hasWarnings = true;
          }
          
          result.warnings.push(message);
        }
      });
    } catch (error) {
      console.log(`  ⚠️  ファイル読み込みエラー: ${filePath}`);
    }
  }
  
  // ディレクトリを再帰的にスキャン
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else {
        scanFile(fullPath);
      }
    });
  }
  
  scanDirectory(srcDir);
  
  if (result.warnings.length === 0) {
    console.log('  ✅ 危険なコードパターンは検出されませんでした');
    result.details.push('No dangerous code patterns detected');
  }
  
  securityReport.checks.sourceCodeSecurity = result;
  console.log('');
}

// 8. セキュリティレポート生成
function generateSecurityReport() {
  console.log('📊 セキュリティレポート生成');
  
  const reportPath = 'security-report.json';
  securityReport.summary = {
    hasErrors,
    hasWarnings,
    totalChecks: Object.keys(securityReport.checks).length,
    passedChecks: Object.values(securityReport.checks).filter(c => c.status === 'pass').length,
    failedChecks: Object.values(securityReport.checks).filter(c => c.status === 'fail').length,
    warningChecks: Object.values(securityReport.checks).filter(c => c.status === 'warning').length
  };
  
  try {
    fs.writeFileSync(reportPath, JSON.stringify(securityReport, null, 2));
    console.log(`  ✅ セキュリティレポートを生成しました: ${reportPath}`);
  } catch (error) {
    console.log(`  ⚠️  レポート生成に失敗しました: ${error.message}`);
  }
  
  // レコメンデーション追加
  if (hasErrors || hasWarnings) {
    console.log('\n📋 セキュリティ改善提案:');
    securityReport.recommendations.forEach(rec => {
      console.log(`  • ${rec}`);
    });
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
  checkDependencyVulnerabilities();
  checkSourceCodeSecurity();
  generateSecurityReport();
  
  console.log('\n🏁 セキュリティチェック結果サマリー:');
  console.log(`   - 実行チェック数: ${Object.keys(securityReport.checks).length}`);
  console.log(`   - 合格: ${Object.values(securityReport.checks).filter(c => c.status === 'pass').length}`);
  console.log(`   - 失敗: ${Object.values(securityReport.checks).filter(c => c.status === 'fail').length}`);
  console.log(`   - 警告: ${Object.values(securityReport.checks).filter(c => c.status === 'warning').length}`);
  
  if (hasErrors) {
    console.log('\n❌ セキュリティチェックでエラーが検出されました');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('\n⚠️  セキュリティチェック完了 - 警告があります');
    process.exit(0);
  } else {
    console.log('\n✅ セキュリティチェック完了 - 問題ありません');
    process.exit(0);
  }
}

main().catch(error => {
  // 本番環境ではconsole.errorを無効化
  if (process.env.NODE_ENV !== 'production') {
    console.error(error);
  }
});
