// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  AuthError, 
  GoogleAuthProvider, 
  signInWithCredential,
  signInWithPopup,
  signOut as firebaseSignOut
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { validateFirebaseConfig, envUtils } from './env';

// Type-safe Firebase configuration with validation
const firebaseConfigResult = validateFirebaseConfig();

let app: ReturnType<typeof initializeApp> | null = null;

if (firebaseConfigResult.success) {
  try {
    app = initializeApp(firebaseConfigResult.config);
  } catch (error) {
    if (envUtils.isDevelopment()) {
      console.warn('Firebase initialization failed:', error);
    }
    app = null;
  }
} else {
  if (envUtils.isDevelopment()) {
    console.warn('Firebase configuration validation failed:', firebaseConfigResult.error);
  }
}

// サービスのインスタンスをエクスポート
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

// Google OAuth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// OAuth with Google
export async function signInWithGoogle() {
  if (!auth) {
    return { success: false, error: 'Firebase is not configured properly', code: 'auth/not-configured' };
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (error) {
    const authError = error as AuthError;
    return { success: false, error: authError.message, code: authError.code };
  }
}

// Legacy function for compatibility
export async function loginWithFirebase(idToken: string) {
  if (!auth) {
    throw new Error('Firebase is not configured properly');
  }
  const credential = GoogleAuthProvider.credential(idToken);
  await signInWithCredential(auth, credential);
}

// Email/Password Authentication
export async function registerWithEmail(email: string, password: string) {
  if (!auth) {
    return { success: false, error: 'Firebase is not configured properly', code: 'auth/not-configured' };
  }
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // メール認証を送信
    await sendEmailVerification(userCredential.user);
    return { success: true, user: userCredential.user };
  } catch (error) {
    const authError = error as AuthError;
    return { success: false, error: authError.message, code: authError.code };
  }
}

export async function loginWithEmail(email: string, password: string) {
  if (!auth) {
    return { success: false, error: 'Firebase is not configured properly', code: 'auth/not-configured' };
  }
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    const authError = error as AuthError;
    return { success: false, error: authError.message, code: authError.code };
  }
}

// Sign Out
export async function signOut() {
  if (!auth) {
    return { success: false, error: 'Firebase is not configured properly' };
  }
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    const authError = error as AuthError;
    return { success: false, error: authError.message, code: authError.code };
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
