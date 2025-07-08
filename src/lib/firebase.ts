// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, AuthError, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

const isValidFirebaseConfig = firebaseConfig.apiKey && 
  firebaseConfig.authDomain && 
  firebaseConfig.projectId &&
  firebaseConfig.storageBucket &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId;

// Firebase アプリの初期化（設定が有効な場合のみ）
const app = isValidFirebaseConfig ? initializeApp(firebaseConfig) : null;

// サービスのインスタンスをエクスポート
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

// 基本的な認証結果の型定義
interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  code?: string;
}

// Google認証
export async function loginWithFirebase(idToken: string): Promise<AuthResult> {
  if (!auth) {
    return { success: false, error: 'Firebase is not configured properly', code: 'auth/not-configured' };
  }
  
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);
    return { success: true, user: result.user };
  } catch (error) {
    const authError = error as AuthError;
    return { 
      success: false, 
      error: authError.message, 
      code: authError.code 
    };
  }
}

// メールアドレス認証（基本版）
export async function registerWithEmail(email: string, password: string): Promise<AuthResult> {
  if (!auth) {
    return { success: false, error: 'Firebase is not configured properly', code: 'auth/not-configured' };
  }
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    
    return { 
      success: true, 
      user: userCredential.user 
    };
  } catch (error) {
    const authError = error as AuthError;
    return { 
      success: false, 
      error: authError.message, 
      code: authError.code 
    };
  }
}

export async function loginWithEmail(email: string, password: string): Promise<AuthResult> {
  if (!auth) {
    return { success: false, error: 'Firebase is not configured properly', code: 'auth/not-configured' };
  }
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    const authError = error as AuthError;
    return { 
      success: false, 
      error: authError.message, 
      code: authError.code 
    };
  }
}

// Firebaseの認証状態を監視するための関数
export function onAuthStateChanged(callback: (user: User | null) => void) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return auth.onAuthStateChanged(callback);
}
