#!/usr/bin/env node

/**
 * 環境変数検証スクリプト
 * 必要な環境変数の存在、形式、セキュリティ要件をチェックします
 */

// .envファイルを読み込み
require('dotenv').config();

const fs = require('fs');
const path = require('path');

console.log('🔑 環境変数検証を開始します...\n');

let hasErrors = false;
let hasWarnings = false;

// 必須環境変数の定義
const requiredVars = {
  // Firebase設定（必須）
  'NEXT_PUBLIC_FIREBASE_API_KEY': {
    required: true,
    pattern: /^[A-Za-z0-9_-]{30,}$/,
    description: 'Firebase API Key',
    sensitive: false
  },
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': {
    required: true,
    pattern: /^[a-z0-9-]+\.firebaseapp\.com$/,
    description: 'Firebase Auth Domain',
    sensitive: false
  },
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID': {
    required: true,
    pattern: /^[a-z0-9-]+$/,
    description: 'Firebase Project ID',
    sensitive: false
  },
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': {
    required: true,
    pattern: /^[a-z0-9-]+\.appspot\.com$/,
    description: 'Firebase Storage Bucket',
    sensitive: false
  },

  // セキュリティ関連（必須）
  'ENCRYPTION_KEY': {
    required: true,
    pattern: /^[A-Za-z0-9]{32,}$/,
    description: 'Encryption Key (32+ characters)',
    sensitive: true
  },
  'JWT_SECRET': {
    required: true,
    pattern: /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{16,}$/,
    description: 'JWT Secret (16+ characters)',
    sensitive: true
  },
  'CSRF_SECRET': {
    required: true,
    pattern: /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{16,}$/,
    description: 'CSRF Secret (16+ characters)',
    sensitive: true
  },

  // オプション環境変数
  'FIGMA_ACCESS_TOKEN': {
    required: false,
    pattern: /^figd_[A-Za-z0-9_-]+$/,
    description: 'Figma Access Token',
    sensitive: true
  },
  'OPENAI_API_KEY': {
    required: false,
    pattern: /^sk-[A-Za-z0-9]{48}$/,
    description: 'OpenAI API Key',
    sensitive: true
  },
  'SENTRY_DSN': {
    required: false,
    pattern: /^https:\/\/[a-f0-9]+@[a-f0-9]+\.ingest\.sentry\.io\/[0-9]+$/,
    description: 'Sentry DSN',
    sensitive: true
  }
};

// 環境変数の存在チェック
function checkEnvironmentVariables() {
  console.log('📋 環境変数存在チェック');
  
  let missingRequired = [];
  let missingOptional = [];
  
  Object.entries(requiredVars).forEach(([varName, config]) => {
    const value = process.env[varName];
    
    if (!value) {
      if (config.required) {
        console.log(`❌ 必須環境変数が未設定: ${varName} (${config.description})`);
        missingRequired.push(varName);
        hasErrors = true;
      } else {
        console.log(`⚠️  オプション環境変数が未設定: ${varName} (${config.description})`);
        missingOptional.push(varName);
        hasWarnings = true;
      }
    } else {
      console.log(`✅ ${varName} が設定されています`);
    }
  });
  
  if (missingRequired.length === 0 && missingOptional.length === 0) {
    console.log('  ✅ すべての環境変数が適切に設定されています');
  }
  
  console.log('');
  return { missingRequired, missingOptional };
}

// 環境変数の形式チェック
function validateEnvironmentVariableFormats() {
  console.log('🔍 環境変数形式チェック');
  
  let formatErrors = [];
  
  Object.entries(requiredVars).forEach(([varName, config]) => {
    const value = process.env[varName];
    
    if (value && config.pattern) {
      if (config.pattern.test(value)) {
        const displayValue = config.sensitive ? '***[HIDDEN]***' : value;
        console.log(`  ✅ ${varName}: ${displayValue} (形式OK)`);
      } else {
        console.log(`  ❌ ${varName}: 形式が正しくありません (期待形式: ${config.pattern})`);
        formatErrors.push(varName);
        hasErrors = true;
      }
    }
  });
  
  if (formatErrors.length === 0) {
    console.log('  ✅ すべての環境変数の形式が正しいです');
  }
  
  console.log('');
  return formatErrors;
}

// セキュリティ強度チェック
function checkSecurityStrength() {
  console.log('🔒 セキュリティ強度チェック');
  
  const securityChecks = [
    {
      name: 'ENCRYPTION_KEY',
      minLength: 32,
      description: '暗号化キーの長さ'
    },
    {
      name: 'JWT_SECRET',
      minLength: 32,
      description: 'JWTシークレットの長さ'
    },
    {
      name: 'CSRF_SECRET',
      minLength: 32,
      description: 'CSRFシークレットの長さ'
    }
  ];
  
  securityChecks.forEach(check => {
    const value = process.env[check.name];
    if (value) {
      if (value.length >= check.minLength) {
        console.log(`  ✅ ${check.name}: 十分な長さです (${value.length}文字)`);
      } else {
        console.log(`  ⚠️  ${check.name}: 長さが不十分です (${value.length}文字 < ${check.minLength}文字)`);
        hasWarnings = true;
      }
      
      // エントロピーチェック（簡易版）
      const uniqueChars = new Set(value).size;
      const entropy = uniqueChars / value.length;
      if (entropy > 0.6) {
        console.log(`  ✅ ${check.name}: 十分な複雑さです`);
      } else {
        console.log(`  ⚠️  ${check.name}: 複雑さが不十分です（より多様な文字を使用してください）`);
        hasWarnings = true;
      }
    }
  });
  
  console.log('');
}

// 環境変数ファイルのセキュリティチェック
function checkEnvFilesSecurity() {
  console.log('📁 環境変数ファイルセキュリティチェック');
  
  const envFiles = ['.env', '.env.local', '.env.production', '.env.development'];
  const gitignore = fs.existsSync('.gitignore') ? fs.readFileSync('.gitignore', 'utf8') : '';
  
  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`  📄 ${file} ファイルが存在します`);
      
      // .gitignoreチェック
      if (gitignore.includes(file) || gitignore.includes('.env*') || gitignore.includes('.env')) {
        console.log(`    ✅ ${file} は .gitignore に含まれています`);
      } else {
        console.log(`    ❌ ${file} が .gitignore に含まれていません！`);
        hasErrors = true;
      }
      
      // ファイル権限チェック（Unix系）
      try {
        const stats = fs.statSync(file);
        const mode = stats.mode & parseInt('777', 8);
        if (mode <= parseInt('600', 8)) {
          console.log(`    ✅ ${file} のファイル権限は安全です`);
        } else {
          console.log(`    ⚠️  ${file} のファイル権限が緩いです (現在: ${mode.toString(8)})`);
          hasWarnings = true;
        }
      } catch (error) {
        console.log(`    ⚠️  ${file} のファイル権限をチェックできません`);
      }
    }
  });
  
  console.log('');
}

// 本番環境の追加チェック
function checkProductionEnvironment() {
  const nodeEnv = process.env.NODE_ENV;
  
  if (nodeEnv === 'production') {
    console.log('🚀 本番環境追加チェック');
    
    // 必須の本番環境変数
    const productionVars = [
      'NEXT_PUBLIC_APP_URL',
      'SENTRY_DSN'
    ];
    
    productionVars.forEach(varName => {
      if (!process.env[varName]) {
        console.log(`  ⚠️  本番環境で推奨される環境変数が未設定: ${varName}`);
        hasWarnings = true;
      } else {
        console.log(`  ✅ ${varName} が設定されています`);
      }
    });
    
    // HTTP/HTTPSチェック
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (appUrl && !appUrl.startsWith('https://')) {
      console.log('  ❌ 本番環境ではHTTPSを使用してください');
      hasErrors = true;
    }
    
    console.log('');
  }
}

// レポート生成
function generateReport() {
  console.log('📊 環境変数検証レポート');
  
  const report = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV || 'not-set',
    totalVariables: Object.keys(requiredVars).length,
    setVariables: Object.keys(requiredVars).filter(name => process.env[name]).length,
    hasErrors,
    hasWarnings
  };
  
  try {
    fs.writeFileSync('env-validation-report.json', JSON.stringify(report, null, 2));
    console.log('  ✅ 検証レポートを生成しました: env-validation-report.json');
  } catch (error) {
    console.log(`  ⚠️  レポート生成に失敗しました: ${error.message}`);
  }
  
  console.log('');
}

// メイン実行
function main() {
  const { missingRequired } = checkEnvironmentVariables();
  
  // 必須変数が不足している場合は形式チェックをスキップ
  if (missingRequired.length === 0) {
    validateEnvironmentVariableFormats();
    checkSecurityStrength();
  }
  
  checkEnvFilesSecurity();
  checkProductionEnvironment();
  generateReport();
  
  console.log('🏁 環境変数検証結果:');
  if (hasErrors) {
    console.log('  ❌ エラーが検出されました');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('  ⚠️  警告があります');
    process.exit(0);
  } else {
    console.log('  ✅ 問題ありません');
    process.exit(0);
  }
}

main();
