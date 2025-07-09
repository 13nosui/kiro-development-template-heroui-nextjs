import crypto from 'crypto';

/**
 * 🔒 セキュアな暗号化・復号化ユーティリティ
 * 
 * AES-256-GCM アルゴリズムを使用してデータを安全に暗号化/復号化します
 * 環境変数 ENCRYPTION_KEY が必要です
 */

// 暗号化設定
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // AES block size
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;
const TAG_LENGTH = 16;

/**
 * 環境変数から暗号化キーを取得
 */
function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }
  
  if (key.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters long');
  }
  
  return key;
}

/**
 * キー導出関数 - PBKDF2を使用してより安全なキーを生成
 */
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha512');
}

/**
 * 暗号化された結果の型定義
 */
export interface EncryptedData {
  encrypted: string;
  iv: string;
  salt: string;
  tag: string;
}

/**
 * データを暗号化する
 * 
 * @param text - 暗号化する文字列
 * @returns 暗号化されたデータオブジェクト
 */
export function encrypt(text: string): EncryptedData {
  try {
    const password = getEncryptionKey();
    
    // ランダムなソルトとIVを生成
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // キー導出
    const key = deriveKey(password, salt);
    
    // 暗号化
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // 認証タグを取得
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      salt: salt.toString('hex'),
      tag: tag.toString('hex')
    };
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * データを復号化する
 * 
 * @param encryptedData - 暗号化されたデータオブジェクト
 * @returns 復号化された文字列
 */
export function decrypt(encryptedData: EncryptedData): string {
  try {
    const password = getEncryptionKey();
    
    // バッファに変換
    const salt = Buffer.from(encryptedData.salt, 'hex');
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const tag = Buffer.from(encryptedData.tag, 'hex');
    
    // キー導出
    const key = deriveKey(password, salt);
    
    // 復号化
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 文字列を Base64 エンコードする
 */
export function encodeBase64(text: string): string {
  return Buffer.from(text, 'utf8').toString('base64');
}

/**
 * Base64 文字列をデコードする
 */
export function decodeBase64(base64: string): string {
  return Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * 暗号化されたデータを JSON 文字列にシリアライズ
 */
export function serializeEncryptedData(data: EncryptedData): string {
  return JSON.stringify(data);
}

/**
 * JSON 文字列から暗号化データをデシリアライズ
 */
export function deserializeEncryptedData(serialized: string): EncryptedData {
  try {
    const parsed = JSON.parse(serialized);
    
    // 必要なプロパティが存在するかチェック
    if (!parsed.encrypted || !parsed.iv || !parsed.salt || !parsed.tag) {
      throw new Error('Invalid encrypted data format');
    }
    
    return parsed as EncryptedData;
  } catch (error) {
    throw new Error(`Failed to deserialize encrypted data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * ハッシュ関数 - パスワードのハッシュ化などに使用
 */
export function createHash(data: string, algorithm: 'sha256' | 'sha512' = 'sha256'): string {
  return crypto.createHash(algorithm).update(data, 'utf8').digest('hex');
}

/**
 * HMAC 関数 - メッセージ認証に使用
 */
export function createHmac(data: string, secret?: string, algorithm: 'sha256' | 'sha512' = 'sha256'): string {
  const key = secret || getEncryptionKey();
  return crypto.createHmac(algorithm, key).update(data, 'utf8').digest('hex');
}

/**
 * 安全なランダム文字列を生成
 */
export function generateSecureRandom(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * パスワード用の安全なソルトを生成
 */
export function generateSalt(length: number = 16): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * 暗号化されたオブジェクト全体を安全に保存するための関数
 */
export function encryptObject<T>(obj: T): string {
  const jsonString = JSON.stringify(obj);
  const encrypted = encrypt(jsonString);
  return serializeEncryptedData(encrypted);
}

/**
 * 暗号化されたオブジェクトを復号化する関数
 */
export function decryptObject<T>(encryptedString: string): T {
  const encryptedData = deserializeEncryptedData(encryptedString);
  const decryptedJson = decrypt(encryptedData);
  return JSON.parse(decryptedJson) as T;
}

/**
 * 機密情報をマスクする関数（ログ出力時など）
 */
export function maskSensitive(value: string, visibleChars: number = 4): string {
  if (value.length <= visibleChars * 2) {
    return '*'.repeat(value.length);
  }
  
  const start = value.substring(0, visibleChars);
  const end = value.substring(value.length - visibleChars);
  const middle = '*'.repeat(value.length - (visibleChars * 2));
  
  return `${start}${middle}${end}`;
}

/**
 * 暗号化強度をテストする関数
 */
export function testEncryption(): boolean {
  try {
    const testData = 'Test encryption data with special characters: !@#$%^&*()';
    const encrypted = encrypt(testData);
    const decrypted = decrypt(encrypted);
    
    return testData === decrypted;
  } catch {
    // セキュリティ上の理由でエラー詳細はログに出力しない
    return false;
  }
}

/**
 * 暗号化ユーティリティの設定情報を取得
 */
export function getCryptoInfo() {
  return {
    algorithm: ALGORITHM,
    keyLength: KEY_LENGTH,
    ivLength: IV_LENGTH,
    saltLength: SALT_LENGTH,
    tagLength: TAG_LENGTH,
    isConfigured: !!process.env.ENCRYPTION_KEY,
    testPassed: testEncryption()
  };
}
