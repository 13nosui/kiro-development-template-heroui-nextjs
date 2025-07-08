// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, AuthError, signOut, updatePassword, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { validateEmail, validatePassword, sanitizeInput, createSecureErrorResponse } from "./security";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Firebase設定の検証
const isValidFirebaseConfig = firebaseConfig.apiKey && 
  firebaseConfig.authDomain && 
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'development-api-key' && // ダミー値を除外
  firebaseConfig.apiKey.length > 20; // 最小限の長さチェック

// Firebase アプリの初期化（設定が有効な場合のみ）
const app = isValidFirebaseConfig ? initializeApp(firebaseConfig) : null;

// サービスのインスタンスをエクスポート（安全な初期化）
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

// セキュアな認証結果の型定義
interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  code?: string;
  requiresEmailVerification?: boolean;
}

// Google認証関連
export async function loginWithFirebase(idToken: string): Promise<AuthResult> {
  if (!auth) {
    return { success: false, error: 'Firebase is not configured properly', code: 'auth/not-configured' };
  }
  
  if (!idToken || idToken.length < 100) { // Google IDトークンの最小長チェック
    return { success: false, error: 'Invalid authentication token', code: 'auth/invalid-token' };
  }
  
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);
    return { success: true, user: result.user };
  } catch (error) {
    const authError = error as AuthError;
    const isDevelopment = process.env.NODE_ENV === 'development';
    const secureError = createSecureErrorResponse(authError, isDevelopment);
    return { 
      success: false, 
      error: secureError.error, 
      code: authError.code 
    };
  }
}

// メールアドレス認証関連（強化版）
export async function registerWithEmail(email: string, password: string): Promise<AuthResult> {
  if (!auth) {
    return { success: false, error: 'Firebase is not configured properly', code: 'auth/not-configured' };
  }
  
  // 入力値のサニタイゼーションとバリデーション
  const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
  
  if (!validateEmail(sanitizedEmail)) {
    return { success: false, error: 'Invalid email format', code: 'auth/invalid-email' };
  }
  
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return { 
      success: false, 
      error: `Password requirements not met: ${passwordValidation.errors.join(', ')}`, 
      code: 'auth/weak-password' 
    };
  }
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, sanitizedEmail, password);
    
    // メール認証を送信
    await sendEmailVerification(userCredential.user);
    
    return { 
      success: true, 
      user: userCredential.user,
      requiresEmailVerification: true
    };
  } catch (error) {
    const authError = error as AuthError;
    const isDevelopment = process.env.NODE_ENV === 'development';
    const secureError = createSecureErrorResponse(authError, isDevelopment);
    
    // セキュアなエラーメッセージマッピング
    const errorMap: Record<string, string> = {
      'auth/email-already-in-use': 'An account with this email already exists',
      'auth/weak-password': 'Password is too weak',
      'auth/invalid-email': 'Invalid email address',
      'auth/operation-not-allowed': 'Registration is currently disabled',
    };
    
    return { 
      success: false, 
      error: errorMap[authError.code] || secureError.error, 
      code: authError.code 
    };
  }
}

export async function loginWithEmail(email: string, password: string): Promise<AuthResult> {
  if (!auth) {
    return { success: false, error: 'Firebase is not configured properly', code: 'auth/not-configured' };
  }
  
  // 入力値のサニタイゼーション
  const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
  
  if (!validateEmail(sanitizedEmail)) {
    return { success: false, error: 'Invalid email format', code: 'auth/invalid-email' };
  }
  
  if (!password || password.length < 6) {
    return { success: false, error: 'Invalid password', code: 'auth/invalid-password' };
  }
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, sanitizedEmail, password);
    
    // メール認証チェック
    if (!userCredential.user.emailVerified) {
      return {
        success: false,
        error: 'Please verify your email address before signing in',
        code: 'auth/email-not-verified',
        requiresEmailVerification: true
      };
    }
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    const authError = error as AuthError;
    const isDevelopment = process.env.NODE_ENV === 'development';
    const secureError = createSecureErrorResponse(authError, isDevelopment);
    
    // セキュアなエラーメッセージマッピング
    const errorMap: Record<string, string> = {
      'auth/user-not-found': 'Invalid email or password',
      'auth/wrong-password': 'Invalid email or password',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later',
      'auth/user-disabled': 'This account has been disabled',
      'auth/invalid-credential': 'Invalid email or password',
    };
    
    return { 
      success: false, 
      error: errorMap[authError.code] || secureError.error, 
      code: authError.code 
    };
  }
}

// セキュアなログアウト
export async function secureSignOut(): Promise<AuthResult> {
  if (!auth) {
    return { success: false, error: 'Firebase is not configured properly', code: 'auth/not-configured' };
  }
  
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    const authError = error as AuthError;
    const isDevelopment = process.env.NODE_ENV === 'development';
    const secureError = createSecureErrorResponse(authError, isDevelopment);
    return { 
      success: false, 
      error: secureError.error, 
      code: authError.code 
    };
  }
}

// パスワードリセット
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  if (!auth) {
    return { success: false, error: 'Firebase is not configured properly', code: 'auth/not-configured' };
  }
  
  const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
  
  if (!validateEmail(sanitizedEmail)) {
    return { success: false, error: 'Invalid email format', code: 'auth/invalid-email' };
  }
  
  try {
    await sendPasswordResetEmail(auth, sanitizedEmail);
    return { success: true };
  } catch (error) {
    const authError = error as AuthError;
    const isDevelopment = process.env.NODE_ENV === 'development';
    const secureError = createSecureErrorResponse(authError, isDevelopment);
    
    // セキュリティのため、常に成功を返す（ユーザー存在確認を防ぐ）
    return { success: true };
  }
}

// パスワード変更
export async function changePassword(currentUser: User, newPassword: string): Promise<AuthResult> {
  if (!auth) {
    return { success: false, error: 'Firebase is not configured properly', code: 'auth/not-configured' };
  }
  
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    return { 
      success: false, 
      error: `Password requirements not met: ${passwordValidation.errors.join(', ')}`, 
      code: 'auth/weak-password' 
    };
  }
  
  try {
    await updatePassword(currentUser, newPassword);
    return { success: true };
  } catch (error) {
    const authError = error as AuthError;
    const isDevelopment = process.env.NODE_ENV === 'development';
    const secureError = createSecureErrorResponse(authError, isDevelopment);
    
    const errorMap: Record<string, string> = {
      'auth/requires-recent-login': 'Please sign in again to update your password',
      'auth/weak-password': 'Password is too weak',
    };
    
    return { 
      success: false, 
      error: errorMap[authError.code] || secureError.error, 
      code: authError.code 
    };
  }
}

// メール認証再送信
export async function resendVerificationEmail(user: User): Promise<AuthResult> {
  if (!auth) {
    return { success: false, error: 'Firebase is not configured properly', code: 'auth/not-configured' };
  }
  
  if (user.emailVerified) {
    return { success: false, error: 'Email is already verified', code: 'auth/email-already-verified' };
  }
  
  try {
    await sendEmailVerification(user);
    return { success: true };
  } catch (error) {
    const authError = error as AuthError;
    const isDevelopment = process.env.NODE_ENV === 'development';
    const secureError = createSecureErrorResponse(authError, isDevelopment);
    return { 
      success: false, 
      error: secureError.error, 
      code: authError.code 
    };
  }
}

// Firebaseの認証状態を監視するための関数
export function onAuthStateChanged(callback: (user: User | null) => void) {
  if (!auth) {
    // Firebase未設定の場合は即座にnullを返す
    callback(null);
    return () => {}; // 空のunsubscribe関数を返す
  }
  return auth.onAuthStateChanged(callback);
}

// 現在のユーザーがアクティブかつ認証済みかチェック
export function getCurrentSecureUser(): User | null {
  if (!auth?.currentUser) return null;
  
  const user = auth.currentUser;
  
  // メール認証チェック
  if (!user.emailVerified && user.providerData[0]?.providerId === 'password') {
    return null;
  }
  
  return user;
}
