import { 
  encryptObject, 
  decryptObject, 
  createHash
} from './crypto';

/**
 * 🔐 セキュアストレージユーティリティ
 * 
 * 機密情報を暗号化してローカルストレージやセッションストレージに安全に保存します
 * ブラウザ環境とサーバー環境の両方をサポートします
 */

// ストレージタイプの定義
export type StorageType = 'localStorage' | 'sessionStorage' | 'memory' | 'cookie';

// メモリストレージ（サーバーサイド用）
const memoryStorage = new Map<string, string>();

// Cookie 設定オプション
export interface CookieOptions {
  maxAge?: number; // 秒単位
  expires?: Date;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * セキュアストレージクラス
 */
export class SecureStorage {
  private storageType: StorageType;
  private keyPrefix: string;
  private enableCompression: boolean;

  constructor(
    storageType: StorageType = 'localStorage',
    keyPrefix: string = 'secure_',
    enableCompression: boolean = false
  ) {
    this.storageType = storageType;
    this.keyPrefix = keyPrefix;
    this.enableCompression = enableCompression;
  }

  /**
   * 実際のストレージキーを生成
   */
  private getStorageKey(key: string): string {
    const hashedKey = createHash(key);
    return `${this.keyPrefix}${hashedKey}`;
  }

  /**
   * ストレージアダプターを取得
   */
  private getStorageAdapter() {
    switch (this.storageType) {
      case 'localStorage':
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage;
        }
        throw new Error('localStorage is not available');
      
      case 'sessionStorage':
        if (typeof window !== 'undefined' && window.sessionStorage) {
          return window.sessionStorage;
        }
        throw new Error('sessionStorage is not available');
      
      case 'memory':
        return {
          getItem: (key: string) => memoryStorage.get(key) || null,
          setItem: (key: string, value: string) => memoryStorage.set(key, value),
          removeItem: (key: string) => memoryStorage.delete(key),
          clear: () => memoryStorage.clear(),
          get length() { return memoryStorage.size; },
          key: (index: number) => Array.from(memoryStorage.keys())[index] || null
        };
      
      case 'cookie':
        return this.getCookieAdapter();
      
      default:
        throw new Error(`Unsupported storage type: ${this.storageType}`);
    }
  }

  /**
   * Cookie アダプターを取得
   */
  private getCookieAdapter() {
    return {
      getItem: (key: string) => {
        if (typeof document === 'undefined') return null;
        
        const name = key + '=';
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');
        
        for (let c of ca) {
          while (c.charAt(0) === ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
          }
        }
        return null;
      },
      
      setItem: (key: string, value: string, options?: CookieOptions) => {
        if (typeof document === 'undefined') return;
        
        let cookie = `${key}=${encodeURIComponent(value)}`;
        
        if (options?.maxAge) {
          cookie += `; max-age=${options.maxAge}`;
        }
        
        if (options?.expires) {
          cookie += `; expires=${options.expires.toUTCString()}`;
        }
        
        if (options?.domain) {
          cookie += `; domain=${options.domain}`;
        }
        
        if (options?.path) {
          cookie += `; path=${options.path}`;
        } else {
          cookie += `; path=/`;
        }
        
        if (options?.secure) {
          cookie += `; secure`;
        }
        
        if (options?.httpOnly) {
          cookie += `; httponly`;
        }
        
        if (options?.sameSite) {
          cookie += `; samesite=${options.sameSite}`;
        }
        
        document.cookie = cookie;
      },
      
      removeItem: (key: string) => {
        if (typeof document === 'undefined') return;
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      },
      
      clear: () => {
        if (typeof document === 'undefined') return;
        
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      },
      
      get length() {
        if (typeof document === 'undefined') return 0;
        return document.cookie.split(';').filter(c => c.trim()).length;
      },
      
      key: (index: number) => {
        if (typeof document === 'undefined') return null;
        
        const cookies = document.cookie.split(';');
        const cookie = cookies[index];
        if (!cookie) return null;
        
        const eqPos = cookie.indexOf('=');
        return eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      }
    };
  }

  /**
   * データを暗号化して保存
   */
  async setItem<T>(key: string, value: T, options?: CookieOptions): Promise<void> {
    try {
      const storageKey = this.getStorageKey(key);
      const encryptedData = encryptObject(value);
      
      const adapter = this.getStorageAdapter();
      
      if (this.storageType === 'cookie') {
        const cookieAdapter = adapter as {
          setItem: (key: string, value: string, options?: CookieOptions) => void;
        };
        cookieAdapter.setItem(storageKey, encryptedData, {
          secure: true,
          httpOnly: false, // JSからアクセス可能にする
          sameSite: 'strict',
          maxAge: 3600, // 1時間
          ...options
        });
      } else {
        adapter.setItem(storageKey, encryptedData);
      }
    } catch (error) {
      throw new Error(`Failed to set secure item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * データを復号化して取得
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const storageKey = this.getStorageKey(key);
      const adapter = this.getStorageAdapter();
      const encryptedData = adapter.getItem(storageKey);
      
      if (!encryptedData) {
        return null;
      }
      
      return decryptObject<T>(encryptedData);
    } catch {
      // セキュリティ上の理由でエラー詳細はログに出力しない
      return null;
    }
  }

  /**
   * アイテムを削除
   */
  async removeItem(key: string): Promise<void> {
    try {
      const storageKey = this.getStorageKey(key);
      const adapter = this.getStorageAdapter();
      adapter.removeItem(storageKey);
    } catch (error) {
      throw new Error(`Failed to remove secure item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * すべてのアイテムをクリア
   */
  async clear(): Promise<void> {
    try {
      const adapter = this.getStorageAdapter();
      
      if (this.storageType === 'memory') {
        adapter.clear();
      } else {
        // プレフィックスが一致するアイテムのみクリア
        const keysToRemove: string[] = [];
        
        for (let i = 0; i < adapter.length; i++) {
          const key = adapter.key(i);
          if (key && key.startsWith(this.keyPrefix)) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => adapter.removeItem(key));
      }
    } catch (error) {
      throw new Error(`Failed to clear secure storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * ストレージ内のアイテム数を取得
   */
  async size(): Promise<number> {
    try {
      const adapter = this.getStorageAdapter();
      
      if (this.storageType === 'memory') {
        return adapter.length;
      }
      
      let count = 0;
      for (let i = 0; i < adapter.length; i++) {
        const key = adapter.key(i);
        if (key && key.startsWith(this.keyPrefix)) {
          count++;
        }
      }
      
      return count;
    } catch {
      // セキュリティ上の理由でエラー詳細はログに出力しない
      return 0;
    }
  }

  /**
   * すべてのキーを取得
   */
  async keys(): Promise<string[]> {
    try {
      const adapter = this.getStorageAdapter();
      const keys: string[] = [];
      
      for (let i = 0; i < adapter.length; i++) {
        const key = adapter.key(i);
        if (key && key.startsWith(this.keyPrefix)) {
          // ハッシュ化されたキーから元のキーを復元するのは困難なので、
          // ここではハッシュ化されたキーをそのまま返す
          keys.push(key);
        }
      }
      
      return keys;
    } catch {
      // セキュリティ上の理由でエラー詳細はログに出力しない
      return [];
    }
  }
}

/**
 * セキュア用トークン管理クラス
 */
export class SecureTokenManager {
  private storage: SecureStorage;
  private tokenKey: string;

  constructor(storageType: StorageType = 'localStorage') {
    this.storage = new SecureStorage(storageType, 'token_');
    this.tokenKey = 'auth_tokens';
  }

  /**
   * アクセストークンを保存
   */
  async setAccessToken(token: string, expiresIn?: number): Promise<void> {
    const tokenData = {
      token,
      expiresAt: expiresIn ? Date.now() + (expiresIn * 1000) : null,
      createdAt: Date.now()
    };
    
    await this.storage.setItem(this.tokenKey, tokenData);
  }

  /**
   * アクセストークンを取得
   */
  async getAccessToken(): Promise<string | null> {
    const tokenData = await this.storage.getItem<{
      token: string;
      expiresAt: number | null;
      createdAt: number;
    }>(this.tokenKey);
    
    if (!tokenData) {
      return null;
    }
    
    // トークンの有効期限をチェック
    if (tokenData.expiresAt && Date.now() > tokenData.expiresAt) {
      await this.clearTokens();
      return null;
    }
    
    return tokenData.token;
  }

  /**
   * リフレッシュトークンを保存
   */
  async setRefreshToken(token: string): Promise<void> {
    await this.storage.setItem('refresh_token', {
      token,
      createdAt: Date.now()
    });
  }

  /**
   * リフレッシュトークンを取得
   */
  async getRefreshToken(): Promise<string | null> {
    const tokenData = await this.storage.getItem<{
      token: string;
      createdAt: number;
    }>('refresh_token');
    
    return tokenData?.token || null;
  }

  /**
   * すべてのトークンをクリア
   */
  async clearTokens(): Promise<void> {
    await Promise.all([
      this.storage.removeItem(this.tokenKey),
      this.storage.removeItem('refresh_token')
    ]);
  }

  /**
   * トークンの有効性をチェック
   */
  async isTokenValid(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }
}

// デフォルトインスタンス
export const secureStorage = new SecureStorage();
export const secureSessionStorage = new SecureStorage('sessionStorage');
export const secureMemoryStorage = new SecureStorage('memory');
export const secureCookieStorage = new SecureStorage('cookie');

// トークンマネージャー
export const tokenManager = new SecureTokenManager();
export const sessionTokenManager = new SecureTokenManager('sessionStorage');

/**
 * ユーザー設定のセキュア管理
 */
export class SecureUserPreferences {
  private storage: SecureStorage;

  constructor(storageType: StorageType = 'localStorage') {
    this.storage = new SecureStorage(storageType, 'pref_');
  }

  /**
   * ユーザー設定を保存
   */
  async setPreference<T>(key: string, value: T): Promise<void> {
    await this.storage.setItem(`user_pref_${key}`, value);
  }

  /**
   * ユーザー設定を取得
   */
  async getPreference<T>(key: string, defaultValue?: T): Promise<T | null> {
    const value = await this.storage.getItem<T>(`user_pref_${key}`);
    return value !== null ? value : (defaultValue || null);
  }

  /**
   * ユーザー設定を削除
   */
  async removePreference(key: string): Promise<void> {
    await this.storage.removeItem(`user_pref_${key}`);
  }

  /**
   * すべてのユーザー設定をクリア
   */
  async clearAllPreferences(): Promise<void> {
    await this.storage.clear();
  }
}

export const userPreferences = new SecureUserPreferences();
