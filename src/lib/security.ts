import DOMPurify from 'dompurify';
import validator from 'validator';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { ValidationError } from './validation';

// XSS対策関連
export const xssProtection = {
  // HTMLの危険なタグやスクリプトをサニタイゼ
  sanitizeHtml: (html: string): string => {
    if (typeof window === 'undefined') {
      // サーバーサイドの場合は正規表現でタグを除去
      return html.replace(/<[^>]*>/g, '');
    }
    
    // クライアントサイドの場合はDOMPurifyを使用
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'span'],
      ALLOWED_ATTR: ['class'],
    });
  },

  // プレーンテキストの危険な文字をエスケープ
  escapeHtml: (text: string): string => {
    return validator.escape(text);
  },

  // スクリプトタグの検出と除去
  removeScriptTags: (input: string): string => {
    return input.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  },

  // JavaScriptプロトコルの検出と除去
  removeJavaScriptProtocol: (input: string): string => {
    return input.replace(/javascript:/gi, '');
  },

  // 危険なイベントハンドラーの除去
  removeEventHandlers: (input: string): string => {
    const dangerousEvents = [
      'onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout',
      'onkeypress', 'onkeydown', 'onkeyup', 'onfocus', 'onblur',
      'onsubmit', 'onreset', 'onselect', 'onchange', 'onunload'
    ];
    
    let cleanInput = input;
    dangerousEvents.forEach(event => {
      const regex = new RegExp(`${event}\\s*=\\s*["'][^"']*["']`, 'gi');
      cleanInput = cleanInput.replace(regex, '');
    });
    
    return cleanInput;
  },

  // 包括的なXSSフィルタリング
  filterXSS: (input: string): string => {
    if (!input) return '';
    
    let filtered = input;
    
    // 各種フィルタリングを適用
    filtered = xssProtection.removeScriptTags(filtered);
    filtered = xssProtection.removeJavaScriptProtocol(filtered);
    filtered = xssProtection.removeEventHandlers(filtered);
    filtered = xssProtection.sanitizeHtml(filtered);
    
    return filtered;
  },
};

// SQLインジェクション対策
export const sqlInjectionProtection = {
  // SQLインジェクションパターンの検出
  detectSQLInjection: (input: string): boolean => {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /(\b(OR|AND)\s+\w+\s*=\s*\w+)/i,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(;|\-\-|\||\/\*|\*\/)/,
      /(\b(CHAR|NCHAR|VARCHAR|NVARCHAR|ASCII|DECLARE|EXEC|EXECUTE)\b)/i,
      /(\b(SP_|XP_|MS_)\w+)/i,
    ];
    
    return sqlPatterns.some(pattern => pattern.test(input));
  },

  // SQLインジェクションの可能性があるかチェック
  isSuspiciousInput: (input: string): boolean => {
    if (!input) return false;
    
    // 基本的なSQLインジェクション検出
    if (sqlInjectionProtection.detectSQLInjection(input)) {
      return true;
    }
    
    // 異常な文字数（非常に長い入力）
    if (input.length > 10000) {
      return true;
    }
    
    // 制御文字の検出
    if (/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/.test(input)) {
      return true;
    }
    
    return false;
  },

  // セーフティチェック
  sanitizeForDatabase: (input: string): string => {
    if (!input) return '';
    
    // 基本的なサニタイゼーション
    return validator.blacklist(input, '\'";--/**/');
  },
};

// CSRF保護用の型定義
interface CSRFValidationResult {
  isValid: boolean;
  error?: string | undefined;
}

interface CSRFTokenOptions {
  cookieName?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number;
  path?: string;
}

// CSRFトークン生成とバリデーション
export const csrfProtection = {
  // CSRFトークンの生成
  generateToken: (): string => {
    if (typeof window !== 'undefined' && window.crypto) {
      const array = new Uint8Array(32);
      window.crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    
    // フォールバック（サーバーサイドの場合）
    try {
      return crypto.randomBytes(32).toString('hex');
    } catch {
      // crypto モジュールが利用できない場合のフォールバック
      throw new Error('Secure random generation is not available');
    }
  },

  // CSRFトークンの検証
  validateToken: (token: string, expectedToken: string): boolean => {
    if (!token || !expectedToken) return false;
    if (token.length !== expectedToken.length) return false;
    
    // タイミング攻撃を防ぐための定数時間比較
    let result = 0;
    for (let i = 0; i < token.length; i++) {
      result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
    }
    
    return result === 0;
  },
};

// Next.js 15のcookies APIを使用したCSRF保護（サーバーサイド専用）
export const generateCSRFToken = (options: CSRFTokenOptions = {}): string => {
  // サーバーサイド実行のチェック
  if (typeof window !== 'undefined') {
    throw new Error('generateCSRFToken can only be called on the server side');
  }

  const {
    cookieName = 'csrf-token',
    httpOnly = true,
    secure = process.env.NODE_ENV === 'production',
    sameSite = 'strict',
    maxAge = 3600, // 1時間
    path = '/',
  } = options;

  // 32バイトのランダムトークンを生成
  const token = crypto.randomBytes(32).toString('hex');

  try {
    // Next.js 15のcookies APIを使用してクッキーに設定
    const cookieStore = cookies();
    cookieStore.set(cookieName, token, {
      httpOnly,
      secure,
      sameSite,
      maxAge,
      path,
    });

    return token;
  } catch (error) {
    throw new Error(`Failed to set CSRF token cookie: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const validateCSRFToken = (
  token: string, 
  options: Pick<CSRFTokenOptions, 'cookieName'> = {}
): CSRFValidationResult => {
  // サーバーサイド実行のチェック
  if (typeof window !== 'undefined') {
    throw new Error('validateCSRFToken can only be called on the server side');
  }

  const { cookieName = 'csrf-token' } = options;

  // 入力値の基本検証
  if (!token || typeof token !== 'string') {
    return {
      isValid: false,
      error: 'CSRF token is required and must be a string',
    };
  }

  // トークンの形式検証（64文字の16進数）
  if (!/^[a-f0-9]{64}$/i.test(token)) {
    return {
      isValid: false,
      error: 'CSRF token format is invalid',
    };
  }

  try {
    // Next.js 15のcookies APIを使用してクッキーから期待値を取得
    const cookieStore = cookies();
    const expectedToken = cookieStore.get(cookieName)?.value;

    if (!expectedToken) {
      return {
        isValid: false,
        error: 'CSRF token not found in cookies',
      };
    }

    // タイミング攻撃を防ぐための定数時間比較
    const isValid = csrfProtection.validateToken(token, expectedToken);

    if (!isValid) {
      // セキュリティイベントをログ出力
      securityLogger.logSecurityEvent({
        type: 'CSRF_ATTACK',
        input: token.substring(0, 10) + '...', // 部分的にログ出力
      });
    }

    return {
      isValid,
      error: isValid ? undefined : 'CSRF token validation failed',
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Failed to validate CSRF token: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

// 入力値の包括的なセキュリティチェック
export const inputSecurityCheck = {
  // 入力値の安全性をチェック
  isSecure: (input: string): { secure: boolean; issues: string[] } => {
    const issues: string[] = [];
    
    // XSS脆弱性チェック
    if (/<script|javascript:|on\w+\s*=/.test(input)) {
      issues.push('XSS攻撃の可能性があります');
    }
    
    // SQLインジェクションチェック
    if (sqlInjectionProtection.isSuspiciousInput(input)) {
      issues.push('SQLインジェクションの可能性があります');
    }
    
    // パストラバーサル攻撃チェック
    if (/\.\.[\/\\]/.test(input)) {
      issues.push('パストラバーサル攻撃の可能性があります');
    }
    
    // コマンドインジェクションチェック
    if (/[;&|`$(){}[\]<>]/.test(input)) {
      issues.push('コマンドインジェクションの可能性があります');
    }
    
    // LDAP インジェクションチェック
    if (/[*()\\|&]/.test(input)) {
      issues.push('LDAP インジェクションの可能性があります');
    }
    
    return {
      secure: issues.length === 0,
      issues,
    };
  },

  // 入力値のサニタイゼーション
  sanitizeInput: (input: string): string => {
    if (!input) return '';
    
    let sanitized = input;
    
    // XSS対策
    sanitized = xssProtection.filterXSS(sanitized);
    
    // SQLインジェクション対策
    sanitized = sqlInjectionProtection.sanitizeForDatabase(sanitized);
    
    // 制御文字の除去
    sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
    
    // 余分な空白の正規化
    sanitized = validator.trim(sanitized);
    sanitized = sanitized.replace(/\s+/g, ' ');
    
    return sanitized;
  },
};

// APIセキュリティヘルパー
export const apiSecurity = {
  // セキュリティヘッダーの生成
  generateSecurityHeaders: () => {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    };
  },

  // レート制限チェック
  checkRateLimit: (identifier: string, limit: number = 100, windowMs: number = 3600): boolean => {
    // 実際の実装ではRedisやメモリキャッシュを使用
    // ここではシンプルな実装例
    const key = `rate_limit:${identifier}`;
    const now = Date.now();
    
    // 実際のアプリケーションでは適切なストレージを使用
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      const stored = window.localStorage.getItem(key);
      if (stored) {
        const data = JSON.parse(stored);
        if (now - data.timestamp < windowMs * 1000) {
          if (data.count >= limit) {
            return false;
          }
          data.count++;
          window.localStorage.setItem(key, JSON.stringify(data));
        } else {
          window.localStorage.setItem(key, JSON.stringify({ count: 1, timestamp: now }));
        }
      } else {
        window.localStorage.setItem(key, JSON.stringify({ count: 1, timestamp: now }));
      }
    }
    
    return true;
  },

  // 入力値の検証とサニタイゼーション
  validateAndSanitize: (input: unknown): { 
    isValid: boolean; 
    sanitized?: string; 
    errors?: ValidationError[] 
  } => {
    if (typeof input !== 'string') {
      return {
        isValid: false,
        errors: [{ field: 'input', message: '文字列である必要があります' }],
      };
    }
    
    const securityCheck = inputSecurityCheck.isSecure(input);
    
    if (!securityCheck.secure) {
      return {
        isValid: false,
        errors: securityCheck.issues.map(issue => ({
          field: 'input',
          message: issue,
        })),
      };
    }
    
    const sanitized = inputSecurityCheck.sanitizeInput(input);
    
    return {
      isValid: true,
      sanitized,
    };
  },
};

// セキュリティログ
export const securityLogger = {
  // セキュリティイベントのログ
  logSecurityEvent: (event: {
    type: 'XSS_ATTEMPT' | 'SQL_INJECTION' | 'CSRF_ATTACK' | 'RATE_LIMIT_EXCEEDED';
    ip?: string;
    userAgent?: string;
    input?: string;
    timestamp?: Date;
  }) => {
    const logEntry = {
      ...event,
      timestamp: event.timestamp || new Date(),
    };
    
    // 実際のアプリケーションでは適切なログシステムを使用
    console.warn('[SECURITY]', logEntry);
    
    // 必要に応じて外部セキュリティサービスに送信
    // sendToSecurityService(logEntry);
  },
};

// エクスポート用のメインオブジェクト
export const security = {
  xss: xssProtection,
  sql: sqlInjectionProtection,
  csrf: csrfProtection,
  input: inputSecurityCheck,
  api: apiSecurity,
  logger: securityLogger,
};
