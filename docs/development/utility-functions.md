# ユーティリティ関数とヘルパーライブラリ

## 概要

このプロジェクトでは、再利用可能で型安全なユーティリティ関数とヘルパーライブラリを提供しています。これらのライブラリは、セキュリティ、バリデーション、API 通信、暗号化、環境変数管理などの共通機能を抽象化し、開発効率と品質を向上させます。

## ライブラリ一覧

### 1. バリデーション (`src/lib/validation.ts`)

Zod を使用した型安全なバリデーションライブラリ。フォーム、API、データの検証を統一的に処理します。

#### 主な機能

##### 共通バリデーションスキーマ

```typescript
import { commonSchemas, validators } from "../lib/validation";

// 基本的なフィールドバリデーション
const emailResult = validators.email("user@example.com");
const passwordResult = validators.password("SecurePass123");
const figmaFileIdResult = validators.figmaFileId("abc123def456ghi789jkl012");

if (emailResult.success) {
  console.log("Valid email:", emailResult.data);
} else {
  console.log("Validation errors:", emailResult.errors);
}
```

##### フォームバリデーション

```typescript
import { validators, formSchemas } from "../lib/validation";

// ログインフォームの検証
const loginData = {
  email: "user@example.com",
  password: "password123",
};

const loginResult = validators.loginForm(loginData);

if (loginResult.success) {
  // ログイン処理
  console.log("Login data is valid:", loginResult.data);
} else {
  // エラー表示
  loginResult.errors?.forEach((error) => {
    console.log(`${error.field}: ${error.message}`);
  });
}

// 登録フォームの検証（パスワード確認含む）
const registerData = {
  email: "user@example.com",
  password: "SecurePass123",
  confirmPassword: "SecurePass123",
};

const registerResult = validators.registerForm(registerData);
```

##### API リクエストバリデーション

```typescript
import { validators, apiSchemas } from "../lib/validation";

// Figma API リクエストの検証
const figmaRequest = {
  fileId: "abc123def456ghi789jkl012",
  nodeId: "1:23",
};

const figmaResult = validators.figmaMcpRequest(figmaRequest);

if (figmaResult.success) {
  // API呼び出し実行
  await callFigmaAPI(figmaResult.data);
}
```

##### カスタムバリデーター作成

```typescript
import { createValidator } from "../lib/validation";
import { z } from "zod";

// カスタムスキーマの定義
const customSchema = z.object({
  name: z.string().min(1).max(50),
  age: z.number().int().min(0).max(120),
  tags: z.array(z.string()).max(10),
});

// バリデーターの作成
const customValidator = createValidator(customSchema);

// 使用例
const result = customValidator({
  name: "John Doe",
  age: 30,
  tags: ["developer", "typescript"],
});
```

#### 利用可能なスキーマ

- **基本フィールド**: email, password, url, safeText, positiveInteger, dateString
- **ID 系**: figmaFileId, figmaNodeId
- **フォーム**: loginForm, registerForm, profileUpdateForm
- **API**: figmaFileRequest, figmaMcpRequest, authRequest, paginationQuery

### 2. 暗号化 (`src/lib/crypto.ts`)

AES-256-GCM を使用した安全な暗号化・復号化ライブラリ。機密データの保護に使用します。

#### 主な機能

##### 基本的な暗号化・復号化

```typescript
import { encrypt, decrypt } from "../lib/crypto";

// データの暗号化
const sensitiveData = "This is confidential information";
const encrypted = encrypt(sensitiveData);

console.log("Encrypted:", encrypted);
// {
//   encrypted: "...",
//   iv: "...",
//   salt: "...",
//   tag: "..."
// }

// データの復号化
const decrypted = decrypt(encrypted);
console.log("Decrypted:", decrypted); // "This is confidential information"
```

##### オブジェクトの暗号化

```typescript
import { encryptObject, decryptObject } from "../lib/crypto";

// オブジェクトの暗号化
const userData = {
  id: 123,
  email: "user@example.com",
  preferences: {
    theme: "dark",
    notifications: true,
  },
};

const encryptedString = encryptObject(userData);

// オブジェクトの復号化
const decryptedData = decryptObject<typeof userData>(encryptedString);
console.log("Decrypted user data:", decryptedData);
```

##### ハッシュと HMAC

```typescript
import { createHash, createHmac } from "../lib/crypto";

// SHA-256 ハッシュ
const hash = createHash("sensitive data");
console.log("Hash:", hash);

// HMAC（メッセージ認証）
const hmac = createHmac("message to authenticate", "secret-key");
console.log("HMAC:", hmac);
```

##### セキュアランダム生成

```typescript
import { generateSecureRandom, generateSalt } from "../lib/crypto";

// セキュアなランダム文字列
const randomString = generateSecureRandom(32); // 32バイト = 64文字の16進数

// パスワード用ソルト
const salt = generateSalt(16); // 16バイト = 32文字の16進数
```

##### 機密情報のマスキング

```typescript
import { maskSensitive } from "../lib/crypto";

const apiKey = "sk-1234567890abcdef1234567890abcdef";
const masked = maskSensitive(apiKey, 4);
console.log("Masked:", masked); // "sk-1****************************cdef"
```

### 3. セキュリティ (`src/lib/security.ts`)

XSS、SQL インジェクション、CSRF 攻撃などからアプリケーションを保護するセキュリティライブラリ。

#### 主な機能

##### XSS 対策

```typescript
import { security } from "../lib/security";

// HTMLのサニタイゼーション
const userInput = '<script>alert("XSS")</script><p>Safe content</p>';
const sanitized = security.xss.sanitizeHtml(userInput);
console.log("Sanitized:", sanitized); // "<p>Safe content</p>"

// 包括的なXSSフィルタリング
const dangerousInput = 'javascript:alert("XSS") onclick="malicious()"';
const filtered = security.xss.filterXSS(dangerousInput);
console.log("Filtered:", filtered);
```

##### 入力値の安全性チェック

```typescript
import { security } from "../lib/security";

const userInput = "SELECT * FROM users WHERE id = 1; DROP TABLE users;";
const securityCheck = security.input.isSecure(userInput);

if (!securityCheck.secure) {
  console.log("Security issues found:", securityCheck.issues);
  // ["SQLインジェクションの可能性があります"]
}

// 入力値のサニタイゼーション
const sanitizedInput = security.input.sanitizeInput(userInput);
```

##### CSRF トークン生成

```typescript
import { security } from "../lib/security";

// CSRFトークンの生成
const csrfToken = security.csrf.generateToken();

// CSRFトークンの検証
const isValid = security.csrf.validateToken(receivedToken, expectedToken);
```

##### API セキュリティ

```typescript
import { security } from "../lib/security";

// セキュリティヘッダーの生成
const headers = security.api.generateSecurityHeaders();
console.log("Security headers:", headers);

// レート制限チェック
const canProceed = security.api.checkRateLimit("user-123", 100, 3600);
if (!canProceed) {
  console.log("Rate limit exceeded");
}

// 入力値の検証とサニタイゼーション
const validation = security.api.validateAndSanitize(userInput);
if (validation.isValid) {
  console.log("Sanitized input:", validation.sanitized);
} else {
  console.log("Validation errors:", validation.errors);
}
```

### 4. 環境変数管理 (`src/lib/env.ts`)

Zod を使用した型安全な環境変数管理ライブラリ。設定の検証と型安全性を提供します。

#### 主な機能

##### 基本的な環境変数取得

```typescript
import {
  getEnvConfig,
  getFirebaseConfig,
  getAppConfig,
  envUtils,
} from "../lib/env";

// 完全な環境設定の取得
const config = getEnvConfig();
console.log("Environment:", config.app.nodeEnv);

// Firebase設定の取得
const firebaseConfig = getFirebaseConfig();
console.log("Firebase Project ID:", firebaseConfig.projectId);

// アプリケーション設定の取得
const appConfig = getAppConfig();
console.log("Port:", appConfig.port);
```

##### 安全な環境変数取得

```typescript
import {
  safeGetEnvConfig,
  getEnvVar,
  getRequiredEnvVar,
  getNumericEnvVar,
  getBooleanEnvVar,
} from "../lib/env";

// エラーハンドリング付きの設定取得
const configResult = safeGetEnvConfig();
if (configResult.success) {
  console.log("Config loaded:", configResult.config);
} else {
  console.error("Config error:", configResult.error.getDetailedMessage());
  console.log("Missing vars:", configResult.error.getMissingVars());
}

// 個別の環境変数取得
const apiKey = getEnvVar("API_KEY"); // string | null
const requiredKey = getRequiredEnvVar("REQUIRED_KEY"); // string (throws if missing)
const port = getNumericEnvVar("PORT"); // number | null
const debugMode = getBooleanEnvVar("DEBUG"); // boolean | null
```

##### 環境判定ユーティリティ

```typescript
import { envUtils } from "../lib/env";

// 環境の判定
if (envUtils.isDevelopment()) {
  console.log("Running in development mode");
}

if (envUtils.isProduction()) {
  console.log("Running in production mode");
}

// 環境サマリーの取得
const summary = envUtils.getEnvSummary();
console.log("Environment summary:", summary);
```

### 5. API クライアント (`src/lib/api-client.ts`)

Axios ベースの高機能 API クライアント。認証、リトライ、レート制限、セキュリティ機能を統合。

#### 主な機能

##### 基本的な API クライアント

```typescript
import { createApiClient } from "../lib/api-client";

// 基本的なクライアント作成
const client = createApiClient({
  baseURL: "https://api.example.com",
  timeout: 10000,
  retryAttempts: 3,
  enableLogging: true,
});

// API呼び出し
const response = await client.get<UserData>("/users/123");
console.log("User data:", response.data);

// POST リクエスト
const createResponse = await client.post<User>("/users", {
  name: "John Doe",
  email: "john@example.com",
});
```

##### 認証付きクライアント

```typescript
import { createApiClient } from "../lib/api-client";

// Bearer トークン認証
const authenticatedClient = createApiClient({
  baseURL: "https://api.example.com",
  authConfig: {
    type: "bearer",
    token: "your-access-token",
  },
});

// API キー認証
const apiKeyClient = createApiClient({
  baseURL: "https://api.example.com",
  authConfig: {
    type: "apikey",
    token: "your-api-key",
    apiKeyHeader: "X-API-Key",
  },
});
```

##### Figma API クライアント

```typescript
import {
  createFigmaApiClient,
  createServerSideFigmaApiClient,
  createClientSideFigmaApiClient,
} from "../lib/api-client";

// 環境に応じた適切なクライアント
const figmaClient = createFigmaApiClient();

// サーバーサイド専用（環境変数のトークンを使用）
const serverFigmaClient = createServerSideFigmaApiClient();

// クライアントサイド専用（API Routes経由）
const clientFigmaClient = createClientSideFigmaApiClient();

// Figma ファイル情報の取得
const fileData = await figmaClient.get(`/files/${fileId}`);
```

##### エラーハンドリングとリトライ

```typescript
import { createApiClient, ApiError } from "../lib/api-client";

const client = createApiClient({
  retryAttempts: 3,
  retryDelay: 1000,
});

try {
  const response = await client.get("/api/data");
  console.log("Success:", response.data);
} catch (error) {
  const apiError = error as ApiError;
  console.error("API Error:", {
    code: apiError.code,
    message: apiError.message,
    timestamp: apiError.timestamp,
    requestId: apiError.requestId,
  });
}
```

### 6. セキュアストレージ (`src/lib/secure-storage.ts`)

暗号化されたローカルストレージ。機密データを安全にブラウザに保存します。

#### 主な機能

##### 基本的なセキュアストレージ

```typescript
import { secureStorage, secureSessionStorage } from "../lib/secure-storage";

// データの暗号化保存
await secureStorage.setItem("user-preferences", {
  theme: "dark",
  language: "ja",
  notifications: true,
});

// データの復号化取得
const preferences = await secureStorage.getItem<UserPreferences>(
  "user-preferences"
);
console.log("User preferences:", preferences);

// データの削除
await secureStorage.removeItem("user-preferences");
```

##### トークン管理

```typescript
import { tokenManager, sessionTokenManager } from "../lib/secure-storage";

// アクセストークンの保存（有効期限付き）
await tokenManager.setAccessToken("access-token-value", 3600); // 1時間

// リフレッシュトークンの保存
await tokenManager.setRefreshToken("refresh-token-value");

// トークンの取得
const accessToken = await tokenManager.getAccessToken();
const refreshToken = await tokenManager.getRefreshToken();

// トークンの有効性チェック
const isValid = await tokenManager.isTokenValid();

// すべてのトークンをクリア
await tokenManager.clearTokens();
```

##### ユーザー設定管理

```typescript
import { userPreferences } from "../lib/secure-storage";

// ユーザー設定の保存
await userPreferences.setPreference("theme", "dark");
await userPreferences.setPreference("language", "ja");

// ユーザー設定の取得（デフォルト値付き）
const theme = await userPreferences.getPreference("theme", "light");
const language = await userPreferences.getPreference("language", "en");

// 設定の削除
await userPreferences.removePreference("theme");

// すべての設定をクリア
await userPreferences.clearAllPreferences();
```

### 7. CSRF 保護 (`src/lib/csrf.ts`)

Next.js 15 の cookies API を使用した CSRF トークン管理。

#### 主な機能

##### CSRF トークンの生成と検証

```typescript
import {
  generateCSRFToken,
  validateCSRFToken,
  getCurrentCSRFToken,
  clearCSRFToken,
} from "../lib/csrf";

// サーバーサイドでのトークン生成
const token = await generateCSRFToken({
  cookieName: "csrf-token",
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: 3600, // 1時間
});

// トークンの検証
const validation = await validateCSRFToken(receivedToken);
if (validation.isValid) {
  console.log("CSRF token is valid");
} else {
  console.error("CSRF validation failed:", validation.error);
}

// 現在のトークンを取得
const currentToken = await getCurrentCSRFToken();

// トークンのクリア
await clearCSRFToken();
```

### 8. CORS 設定 (`src/lib/cors-config.ts`)

環境別・セキュリティレベル別の CORS 設定管理。

#### 主な機能

##### CORS マネージャーの作成

```typescript
import { createCorsManager, corsMiddleware } from "../lib/cors-config";

// 環境とセキュリティレベルを指定
const corsManager = createCorsManager("production", "strict", {
  allowedOrigins: ["https://example.com"],
  allowedMethods: ["GET", "POST"],
  credentials: true,
});

// ミドルウェアとして使用
const middleware = corsMiddleware(corsManager);
```

##### API Route での使用

```typescript
import { withCors } from "../lib/cors-config";

const handler = async (req: NextRequest) => {
  return new NextResponse(JSON.stringify({ message: "Hello" }));
};

// CORS対応のハンドラー
export const GET = withCors(handler);
```

## 使用例とベストプラクティス

### 1. セキュアなフォーム処理

```typescript
import { validators, security } from "../lib/validation";
import { generateCSRFToken, validateCSRFToken } from "../lib/csrf";

// フォーム送信の処理
export async function handleFormSubmission(formData: FormData) {
  // CSRF トークンの検証
  const csrfToken = formData.get("csrf-token") as string;
  const csrfValidation = await validateCSRFToken(csrfToken);

  if (!csrfValidation.isValid) {
    throw new Error("CSRF validation failed");
  }

  // 入力値の検証
  const loginData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validation = validators.loginForm(loginData);

  if (!validation.success) {
    return { errors: validation.errors };
  }

  // セキュリティチェック
  const emailSecurity = security.input.isSecure(validation.data.email);
  if (!emailSecurity.secure) {
    throw new Error("Security validation failed");
  }

  // 処理続行...
  return { success: true };
}
```

### 2. セキュアな API エンドポイント

```typescript
import { createApiClient } from "../lib/api-client";
import { security } from "../lib/security";
import { withCors } from "../lib/cors-config";

const handler = async (req: NextRequest) => {
  // セキュリティヘッダーの設定
  const securityHeaders = security.api.generateSecurityHeaders();

  // レート制限チェック
  const clientIP = req.headers.get("x-forwarded-for") || "unknown";
  const canProceed = security.api.checkRateLimit(clientIP, 100, 3600);

  if (!canProceed) {
    return new NextResponse("Rate limit exceeded", {
      status: 429,
      headers: securityHeaders,
    });
  }

  // API処理...
  const data = { message: "Success" };

  return new NextResponse(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      ...securityHeaders,
    },
  });
};

export const POST = withCors(handler);
```

### 3. 機密データの管理

```typescript
import { encryptObject, decryptObject } from "../lib/crypto";
import { secureStorage } from "../lib/secure-storage";

// 機密データの暗号化保存
async function saveUserCredentials(credentials: UserCredentials) {
  // メモリ内での暗号化
  const encrypted = encryptObject(credentials);

  // セキュアストレージに保存
  await secureStorage.setItem("user-credentials", encrypted);
}

// 機密データの復号化取得
async function getUserCredentials(): Promise<UserCredentials | null> {
  const encrypted = await secureStorage.getItem<string>("user-credentials");

  if (!encrypted) {
    return null;
  }

  try {
    return decryptObject<UserCredentials>(encrypted);
  } catch {
    // 復号化失敗時はnullを返す
    return null;
  }
}
```

### 4. 環境設定の管理

```typescript
import { safeGetEnvConfig, getRequiredEnvVar, envUtils } from "../lib/env";

// アプリケーション初期化時の設定チェック
export function initializeApp() {
  const configResult = safeGetEnvConfig();

  if (!configResult.success) {
    console.error(
      "Configuration error:",
      configResult.error.getDetailedMessage()
    );

    if (envUtils.isDevelopment()) {
      console.log("Missing variables:", configResult.error.getMissingVars());
    }

    throw new Error("Application configuration is invalid");
  }

  const config = configResult.config;

  console.log(`Starting application in ${config.app.nodeEnv} mode`);
  console.log(`Server port: ${config.app.port}`);

  return config;
}
```

## エラーハンドリング

### 1. バリデーションエラー

```typescript
import { ValidationError, validateData } from "../lib/validation";

function handleValidationErrors(errors: ValidationError[]) {
  const errorMap = new Map<string, string[]>();

  errors.forEach((error) => {
    const fieldErrors = errorMap.get(error.field) || [];
    fieldErrors.push(error.message);
    errorMap.set(error.field, fieldErrors);
  });

  return Object.fromEntries(errorMap);
}
```

### 2. API エラー

```typescript
import { ApiError } from "../lib/api-client";

function handleApiError(error: ApiError) {
  switch (error.code) {
    case "HTTP_401":
      // 認証エラー
      redirectToLogin();
      break;
    case "HTTP_429":
      // レート制限
      showRateLimitMessage();
      break;
    case "HTTP_500":
      // サーバーエラー
      showServerErrorMessage();
      break;
    default:
      showGenericErrorMessage(error.message);
  }
}
```

### 3. 暗号化エラー

```typescript
import { encrypt, decrypt } from "../lib/crypto";

function safeEncrypt(data: string): string | null {
  try {
    const encrypted = encrypt(data);
    return JSON.stringify(encrypted);
  } catch (error) {
    console.error("Encryption failed:", error);
    return null;
  }
}

function safeDecrypt(encryptedData: string): string | null {
  try {
    const parsed = JSON.parse(encryptedData);
    return decrypt(parsed);
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
}
```

## パフォーマンス最適化

### 1. キャッシュ戦略

```typescript
import { createApiClient } from "../lib/api-client";

// レスポンスキャッシュ付きクライアント
class CachedApiClient {
  private client = createApiClient();
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5分

  async get<T>(url: string): Promise<T> {
    const cached = this.cache.get(url);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data as T;
    }

    const response = await this.client.get<T>(url);
    this.cache.set(url, { data: response.data, timestamp: Date.now() });

    return response.data;
  }
}
```

### 2. バリデーション最適化

```typescript
import { createValidator } from "../lib/validation";
import { z } from "zod";

// バリデーターのメモ化
const validatorCache = new Map<string, ReturnType<typeof createValidator>>();

function getCachedValidator<T>(schema: z.ZodSchema<T>, key: string) {
  if (!validatorCache.has(key)) {
    validatorCache.set(key, createValidator(schema));
  }
  return validatorCache.get(key)!;
}
```

## セキュリティ考慮事項

### 1. 機密情報の取り扱い

- 環境変数は適切に検証し、ログに出力しない
- 暗号化キーは十分な長さ（32 文字以上）を確保
- セキュアストレージは信頼できるデータのみに使用

### 2. 入力値の検証

- すべての外部入力は検証とサニタイゼーションを実施
- XSS、SQL インジェクション対策を徹底
- CSRF トークンによる状態変更の保護

### 3. API セキュリティ

- 適切な認証・認可の実装
- レート制限による DoS 攻撃対策
- セキュリティヘッダーの設定

## 今後の拡張計画

### 1. 新機能追加

- [ ] GraphQL クライアントサポート
- [ ] WebSocket 通信ライブラリ
- [ ] ファイルアップロード・ダウンロードユーティリティ
- [ ] 国際化（i18n）サポート

### 2. パフォーマンス改善

- [ ] Service Worker によるキャッシュ戦略
- [ ] バックグラウンド同期機能
- [ ] オフライン対応
- [ ] メモリ使用量の最適化

### 3. セキュリティ強化

- [ ] Content Security Policy の動的生成
- [ ] セキュリティイベントの詳細ログ
- [ ] 脆弱性スキャンの自動化
- [ ] セキュリティメトリクスの監視
