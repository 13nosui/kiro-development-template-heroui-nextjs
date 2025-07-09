// 型安全性を確保するためのインポート
type NextRequest = {
  method: string;
  headers: {
    get(name: string): string | null;
  };
};

type NextResponse = {
  headers: {
    set(name: string, value: string): void;
  };
} & Response;

// NextResponseコンストラクタの型定義
interface NextResponseConstructor {
  new (body?: BodyInit | null, init?: ResponseInit): NextResponse;
  (body?: BodyInit | null, init?: ResponseInit): NextResponse;
}

declare const NextResponse: NextResponseConstructor;

import { security } from './security';

// Node.js環境での型安全性を確保
declare const process: {
  env: Record<string, string | undefined>;
};

// CORS設定インターフェース
export interface CorsConfig {
  allowedOrigins: string[] | string | ((origin: string) => boolean);
  allowedMethods: string[];
  allowedHeaders: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
  preflightContinue?: boolean;
  optionsSuccessStatus?: number;
}

// 環境別CORS設定
export interface EnvironmentCorsConfig {
  development: CorsConfig;
  staging: CorsConfig;
  production: CorsConfig;
}

// セキュリティレベル
export type SecurityLevel = 'strict' | 'moderate' | 'permissive';

// デフォルトのCORS設定
const DEFAULT_CORS_CONFIG: CorsConfig = {
  allowedOrigins: [],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-CSRF-Token',
    'X-Request-ID',
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset',
    'X-Request-ID',
  ],
  credentials: true,
  maxAge: 86400, // 24時間
  optionsSuccessStatus: 204,
};

// 環境別のデフォルト設定
const ENVIRONMENT_CONFIGS: EnvironmentCorsConfig = {
  development: {
    ...DEFAULT_CORS_CONFIG,
    allowedOrigins: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:5173',
    ],
    credentials: true,
  },
  staging: {
    ...DEFAULT_CORS_CONFIG,
    allowedOrigins: [
      'https://staging.example.com',
      'https://preview.example.com',
    ],
    credentials: true,
  },
  production: {
    ...DEFAULT_CORS_CONFIG,
    allowedOrigins: [
      'https://example.com',
      'https://www.example.com',
      'https://ai-development-template-heroui-nextjs-nine.vercel.app',
    ],
    credentials: true,
  },
};

// セキュリティレベル別設定
const SECURITY_LEVEL_CONFIGS: Record<SecurityLevel, Partial<CorsConfig>> = {
  strict: {
    credentials: true,
    allowedMethods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-CSRF-Token',
    ],
    maxAge: 3600, // 1時間
  },
  moderate: {
    credentials: true,
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'X-CSRF-Token',
      'X-Request-ID',
    ],
    maxAge: 86400, // 24時間
  },
  permissive: {
    credentials: false,
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-CSRF-Token',
      'X-Request-ID',
      'X-Custom-Header',
    ],
    maxAge: 86400, // 24時間
  },
};

class CorsManager {
  private config: CorsConfig;
  private environment: keyof EnvironmentCorsConfig;
  private securityLevel: SecurityLevel;

  constructor(
    environment: keyof EnvironmentCorsConfig = 'production',
    securityLevel: SecurityLevel = 'moderate',
    customConfig?: Partial<CorsConfig>
  ) {
    this.environment = environment;
    this.securityLevel = securityLevel;
    
    // 環境設定とセキュリティレベルを基に設定を構築
    this.config = {
      ...ENVIRONMENT_CONFIGS[environment],
      ...SECURITY_LEVEL_CONFIGS[securityLevel],
      ...customConfig,
    };
  }

  // Originの検証
  private isOriginAllowed(origin: string): boolean {
    const { allowedOrigins } = this.config;

    if (!origin) {
      return false;
    }

    // 機能による検証
    if (typeof allowedOrigins === 'function') {
      return allowedOrigins(origin);
    }

    // 文字列の場合（ワイルドカード）
    if (typeof allowedOrigins === 'string') {
      return allowedOrigins === '*' || allowedOrigins === origin;
    }

    // 配列の場合
    if (Array.isArray(allowedOrigins)) {
      return allowedOrigins.includes(origin) || allowedOrigins.includes('*');
    }

    return false;
  }

  // セキュリティヘッダーの生成
  private generateSecurityHeaders(): Record<string, string> {
    const baseHeaders = security.api.generateSecurityHeaders();
    
    const additionalHeaders: Record<string, string> = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), camera=(), microphone=()',
    };

    // セキュリティレベルに応じてCSPを調整
    let csp = "default-src 'self'";
    
    switch (this.securityLevel) {
      case 'strict':
        csp += "; script-src 'self'; style-src 'self'; img-src 'self' data:";
        break;
      case 'moderate':
        csp += "; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:";
        break;
      case 'permissive':
        csp += "; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:";
        break;
    }

    additionalHeaders['Content-Security-Policy'] = csp;

    return { ...baseHeaders, ...additionalHeaders };
  }

  // CORSヘッダーの生成
  private generateCorsHeaders(origin?: string): Record<string, string> {
    const headers: Record<string, string> = {};

    // Origin設定
    if (origin && this.isOriginAllowed(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
    } else if (this.config.allowedOrigins === '*') {
      headers['Access-Control-Allow-Origin'] = '*';
    }

    // Methods設定
    headers['Access-Control-Allow-Methods'] = this.config.allowedMethods.join(', ');

    // Headers設定
    headers['Access-Control-Allow-Headers'] = this.config.allowedHeaders.join(', ');

    // Exposed Headers設定
    if (this.config.exposedHeaders && this.config.exposedHeaders.length > 0) {
      headers['Access-Control-Expose-Headers'] = this.config.exposedHeaders.join(', ');
    }

    // Credentials設定
    if (this.config.credentials) {
      headers['Access-Control-Allow-Credentials'] = 'true';
    }

    // Max Age設定
    if (this.config.maxAge) {
      headers['Access-Control-Max-Age'] = this.config.maxAge.toString();
    }

    return headers;
  }

  // リクエストの処理
  public handleRequest(request: NextRequest): NextResponse | null {
    const origin = request.headers.get('origin');
    const method = request.method;

    // セキュリティログ
    security.logger.logSecurityEvent({
      type: 'XSS_ATTEMPT',
      input: `CORS request: ${method} from ${origin || 'unknown'}`,
    });

    // Origin検証（開発環境以外）
    if (this.environment !== 'development' && origin && !this.isOriginAllowed(origin)) {
      security.logger.logSecurityEvent({
        type: 'XSS_ATTEMPT',
        input: `Blocked origin: ${origin}`,
      });

      return new NextResponse('CORS policy violation', {
        status: 403,
        headers: this.generateSecurityHeaders(),
      });
    }

    // Preflightリクエストの処理
    if (method === 'OPTIONS') {
      const corsHeaders = this.generateCorsHeaders(origin || undefined);
      const securityHeaders = this.generateSecurityHeaders();

      return new NextResponse(null, {
        status: this.config.optionsSuccessStatus || 204,
        headers: { ...corsHeaders, ...securityHeaders },
      });
    }

    return null; // 通常のリクエストはそのまま通す
  }

  // レスポンスにCORSヘッダーを追加
  public addCorsHeaders(response: NextResponse, origin?: string): NextResponse {
    const corsHeaders = this.generateCorsHeaders(origin);
    const securityHeaders = this.generateSecurityHeaders();

    // ヘッダーを追加
    Object.entries({ ...corsHeaders, ...securityHeaders }).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }

  // 設定の更新
  public updateConfig(newConfig: Partial<CorsConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // 現在の設定を取得
  public getConfig(): CorsConfig {
    return { ...this.config };
  }

  // 環境設定の変更
  public setEnvironment(env: keyof EnvironmentCorsConfig): void {
    this.environment = env;
    this.config = {
      ...ENVIRONMENT_CONFIGS[env],
      ...SECURITY_LEVEL_CONFIGS[this.securityLevel],
    };
  }

  // セキュリティレベルの変更
  public setSecurityLevel(level: SecurityLevel): void {
    this.securityLevel = level;
    this.config = {
      ...ENVIRONMENT_CONFIGS[this.environment],
      ...SECURITY_LEVEL_CONFIGS[level],
    };
  }
}

// 環境の自動検出
const detectEnvironment = (): keyof EnvironmentCorsConfig => {
  if (typeof window !== 'undefined') {
    return 'development'; // クライアントサイドの場合
  }

  // Node.js環境での環境変数確認
  const nodeEnv = process?.env?.NODE_ENV;
  const vercelEnv = process?.env?.VERCEL_ENV;

  if (vercelEnv === 'production' || nodeEnv === 'production') {
    return 'production';
  }

  if (vercelEnv === 'preview' || nodeEnv === 'staging') {
    return 'staging';
  }

  return 'development';
};

// ファクトリー関数
export const createCorsManager = (
  environment?: keyof EnvironmentCorsConfig,
  securityLevel: SecurityLevel = 'moderate',
  customConfig?: Partial<CorsConfig>
): CorsManager => {
  const env = environment || detectEnvironment();
  return new CorsManager(env, securityLevel, customConfig);
};

// デフォルトインスタンス
export const defaultCorsManager = createCorsManager();

// ミドルウェア用のヘルパー関数
export const corsMiddleware = (
  corsManager: CorsManager = defaultCorsManager
) => {
  return (request: NextRequest): NextResponse | null => {
    return corsManager.handleRequest(request);
  };
};

// API Route用のヘルパー関数
export const withCors = (
  handler: (req: NextRequest, ...args: unknown[]) => Promise<NextResponse>,
  corsManager: CorsManager = defaultCorsManager
) => {
  return async (req: NextRequest, ...args: unknown[]): Promise<NextResponse> => {
    // CORSチェック
    const corsResponse = corsManager.handleRequest(req);
    if (corsResponse) {
      return corsResponse;
    }

    // 元のハンドラー実行
    const response = await handler(req, ...args);

    // CORSヘッダーを追加
    const origin = req.headers.get('origin');
    return corsManager.addCorsHeaders(response, origin || undefined);
  };
};

export default CorsManager;
