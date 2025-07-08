import { NextRequest } from 'next/server';
import crypto from 'crypto';

// 入力値のサニタイゼーション
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // HTMLタグの除去
    .replace(/['"]/g, '') // クォートの除去
    .trim()
    .slice(0, 1000); // 最大長制限
}

// メールアドレスバリデーション
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// パスワード強度チェック
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('パスワードは8文字以上である必要があります');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('大文字を含む必要があります');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('小文字を含む必要があります');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('数字を含む必要があります');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('特殊文字を含む必要があります');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// ファイルタイプバリデーション
export function validateFileType(contentType: string, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']): boolean {
  return allowedTypes.includes(contentType);
}

// ファイルサイズバリデーション（バイト）
export function validateFileSize(size: number, maxSize: number = 10 * 1024 * 1024): boolean {
  return size <= maxSize;
}

// レート制限のためのシンプルなメモリベースの実装
// 本番環境では Redis などを使用することを推奨
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1分
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const current = rateLimitMap.get(identifier);
  
  if (!current || now > current.resetTime) {
    // 新しいウィンドウまたは期限切れ
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs
    };
  }
  
  if (current.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime
    };
  }
  
  current.count++;
  return {
    allowed: true,
    remaining: maxRequests - current.count,
    resetTime: current.resetTime
  };
}

// IPアドレス取得（プロキシ対応）
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return request.ip || 'unknown';
}

// CSRF トークン生成
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// CSRF トークン検証
export function verifyCSRFToken(token: string, sessionToken: string): boolean {
  if (!token || !sessionToken) return false;
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(sessionToken, 'hex')
    );
  } catch {
    return false;
  }
}

// セキュアなハッシュ生成
export function generateSecureHash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// エラーレスポンス（詳細情報の漏洩を防ぐ）
export function createSecureErrorResponse(error: unknown, isDevelopment: boolean = false) {
  const genericMessage = 'Internal server error';
  
  if (isDevelopment) {
    console.error('Detailed error:', error);
    return {
      error: genericMessage,
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
  
  // 本番環境では詳細なエラー情報を返さない
  console.error('Production error:', error);
  return {
    error: genericMessage
  };
}
