import crypto from 'crypto';
import { cookies } from 'next/headers';

// CSRF保護用の型定義
export interface CSRFValidationResult {
  isValid: boolean;
  error?: string | undefined;
}

export interface CSRFTokenOptions {
  cookieName?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number;
  path?: string;
}

// タイミング攻撃を防ぐための定数時間比較
const constantTimeCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
};

/**
 * CSRFトークンを生成し、自動的にクッキーに設定します
 * Next.js 15のcookies APIを使用してサーバーサイドでのみ動作します
 * 
 * @param options - クッキー設定オプション
 * @returns 生成された32バイトのCSRFトークン（64文字の16進数）
 * @throws サーバーサイド以外で呼び出された場合やクッキー設定に失敗した場合
 */
export const generateCSRFToken = async (options: CSRFTokenOptions = {}): Promise<string> => {
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

  try {
    // 32バイトのランダムトークンを生成
    const token = crypto.randomBytes(32).toString('hex');

    // Next.js 15のcookies APIを使用してクッキーに設定
    const cookieStore = await cookies();
    cookieStore.set(cookieName, token, {
      httpOnly,
      secure,
      sameSite,
      maxAge,
      path,
    });

    return token;
  } catch (error) {
    throw new Error(`Failed to generate CSRF token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * CSRFトークンを検証します
 * クッキーに保存されたトークンと比較してCSRF攻撃を防ぎます
 * 
 * @param token - 検証するCSRFトークン
 * @param options - クッキー名などのオプション
 * @returns 検証結果とエラーメッセージ
 * @throws サーバーサイド以外で呼び出された場合
 */
export const validateCSRFToken = async (
  token: string, 
  options: Pick<CSRFTokenOptions, 'cookieName'> = {}
): Promise<CSRFValidationResult> => {
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
    const cookieStore = await cookies();
    const expectedToken = cookieStore.get(cookieName)?.value;

    if (!expectedToken) {
      return {
        isValid: false,
        error: 'CSRF token not found in cookies',
      };
    }

    // タイミング攻撃を防ぐための定数時間比較
    const isValid = constantTimeCompare(token, expectedToken);

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

/**
 * CSRFトークンをクッキーから削除します
 * ログアウト時やセッション終了時に使用します
 * 
 * @param options - クッキー名などのオプション
 * @throws サーバーサイド以外で呼び出された場合
 */
export const clearCSRFToken = async (
  options: Pick<CSRFTokenOptions, 'cookieName'> = {}
): Promise<void> => {
  // サーバーサイド実行のチェック
  if (typeof window !== 'undefined') {
    throw new Error('clearCSRFToken can only be called on the server side');
  }

  const { cookieName = 'csrf-token' } = options;

  try {
    const cookieStore = await cookies();
    cookieStore.delete(cookieName);
  } catch (error) {
    throw new Error(`Failed to clear CSRF token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * 現在のCSRFトークンを取得します
 * フォームなどで使用するために現在のトークンを取得する場合に使用します
 * 
 * @param options - クッキー名などのオプション
 * @returns 現在のCSRFトークン（存在しない場合はnull）
 * @throws サーバーサイド以外で呼び出された場合
 */
export const getCurrentCSRFToken = async (
  options: Pick<CSRFTokenOptions, 'cookieName'> = {}
): Promise<string | null> => {
  // サーバーサイド実行のチェック
  if (typeof window !== 'undefined') {
    throw new Error('getCurrentCSRFToken can only be called on the server side');
  }

  const { cookieName = 'csrf-token' } = options;

  try {
    const cookieStore = await cookies();
    return cookieStore.get(cookieName)?.value || null;
  } catch (error) {
    throw new Error(`Failed to get CSRF token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
