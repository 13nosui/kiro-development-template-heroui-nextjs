import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError,
  InternalAxiosRequestConfig
} from 'axios';
import { security } from './security';
import { getEnvVar, getRequiredEnvVar, envUtils } from './env';

// サーバーサイド実行判定
const isServerSide = (): boolean => {
  return typeof window === 'undefined';
};

// 環境変数の安全な取得（サーバーサイドのみ）
const getServerEnvVar = (key: string): string | null => {
  if (!isServerSide()) {
    throw new Error(`Environment variable ${key} can only be accessed on server side`);
  }
  return getEnvVar(key);
};

// 必須環境変数の取得（サーバーサイドのみ）
const getRequiredServerEnvVar = (key: string): string => {
  if (!isServerSide()) {
    throw new Error(`Environment variable ${key} can only be accessed on server side`);
  }
  return getRequiredEnvVar(key);
};

// APIクライアント設定インターフェース
export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  enableLogging?: boolean;
  customHeaders?: Record<string, string>;
  authConfig?: {
    type: 'bearer' | 'apikey' | 'custom';
    token?: string;
    apiKeyHeader?: string;
    customAuth?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig;
  };
}

// API応答の標準フォーマット
export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  message?: string;
  timestamp: string;
}

// エラーレスポンスの標準フォーマット
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
  requestId?: string;
}

// レート制限情報
interface RateLimitInfo {
  remaining: number;
  reset: number;
  limit: number;
}

class ApiClient {
  private instance: AxiosInstance;
  private config: Required<ApiClientConfig>;
  private rateLimitInfo: Map<string, RateLimitInfo> = new Map();
  private requestCache: Map<string, { response: unknown; timestamp: number }> = new Map();

  constructor(config: ApiClientConfig = {}) {
    this.config = {
      baseURL: config.baseURL || '',
      timeout: config.timeout || 10000,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
      enableLogging: config.enableLogging ?? true,
      customHeaders: config.customHeaders || {},
      authConfig: config.authConfig || { type: 'bearer' },
    };

    this.instance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...this.config.customHeaders,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // リクエストインターセプター
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // セキュリティヘッダーの追加
        const securityHeaders = security.api.generateSecurityHeaders();
        Object.assign(config.headers, securityHeaders);

        // 認証設定の適用
        this.applyAuthentication(config);

        // リクエストIDの生成
        const requestId = this.generateRequestId();
        config.headers['X-Request-ID'] = requestId;

        // ログ出力
        if (this.config.enableLogging) {
          console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
            requestId,
            headers: this.sanitizeHeaders(config.headers),
          });
        }

        return config;
      },
      (error: AxiosError) => {
        this.logError('Request interceptor error', error);
        return Promise.reject(error);
      }
    );

    // レスポンスインターセプター
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // レート制限情報の更新
        this.updateRateLimitInfo(response);

        // レスポンスのサニタイゼーション
        response.data = this.sanitizeResponseData(response.data);

        // ログ出力
        if (this.config.enableLogging) {
          console.log(`[API Response] ${response.status} ${response.config.url}`, {
            requestId: response.config.headers['X-Request-ID'],
            status: response.status,
            dataSize: JSON.stringify(response.data).length,
          });
        }

        return response;
      },
      async (error: AxiosError) => {
        // リトライ処理
        if (this.shouldRetry(error)) {
          return this.retryRequest(error);
        }

        // エラーログ
        this.logError('Response error', error);
        
        // セキュリティイベントログ
        if (error.response?.status === 401 || error.response?.status === 403) {
          security.logger.logSecurityEvent({
            type: 'XSS_ATTEMPT',
            input: `API authentication failed: ${error.config?.url}`,
          });
        }

        return Promise.reject(this.formatError(error));
      }
    );
  }

  private applyAuthentication(config: InternalAxiosRequestConfig): void {
    const { authConfig } = this.config;

    switch (authConfig.type) {
      case 'bearer':
        if (authConfig.token) {
          config.headers.Authorization = `Bearer ${authConfig.token}`;
        }
        break;

      case 'apikey':
        if (authConfig.token && authConfig.apiKeyHeader) {
          config.headers[authConfig.apiKeyHeader] = authConfig.token;
        }
        break;

      case 'custom':
        if (authConfig.customAuth) {
          authConfig.customAuth(config);
        }
        break;
    }
  }

  private shouldRetry(error: AxiosError): boolean {
    const config = error.config as (AxiosError['config'] & { __retryCount?: number });
    if (!config || (config.__retryCount ?? 0) >= this.config.retryAttempts) {
      return false;
    }

    // リトライ対象のステータスコード
    const retryableStatus = [408, 429, 500, 502, 503, 504];
    return !error.response || retryableStatus.includes(error.response.status);
  }

  private async retryRequest(error: AxiosError): Promise<AxiosResponse> {
    const config = error.config as (AxiosError['config'] & { __retryCount?: number });
    if (config) {
      config.__retryCount = (config.__retryCount || 0) + 1;
    }

    // 指数バックオフ
    const delay = this.config.retryDelay * Math.pow(2, (config?.__retryCount ?? 1) - 1);
    await new Promise(resolve => setTimeout(resolve, delay));

    if (this.config.enableLogging) {
      console.log(`[API Retry] Attempt ${config.__retryCount}/${this.config.retryAttempts} for ${config.url}`);
    }

    return this.instance.request(config);
  }

  private updateRateLimitInfo(response: AxiosResponse): void {
    const remaining = response.headers['x-ratelimit-remaining'];
    const reset = response.headers['x-ratelimit-reset'];
    const limit = response.headers['x-ratelimit-limit'];

    if (remaining && reset && limit) {
      const url = response.config.url || 'unknown';
      this.rateLimitInfo.set(url, {
        remaining: parseInt(remaining),
        reset: parseInt(reset),
        limit: parseInt(limit),
      });
    }
  }

  private sanitizeResponseData(data: unknown): unknown {
    if (typeof data === 'string') {
      return security.xss.filterXSS(data);
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeResponseData(item));
    }

    if (data && typeof data === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeResponseData(value);
      }
      return sanitized;
    }

    return data;
  }

  private sanitizeHeaders(headers: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...headers };
    
    // 機密情報を含むヘッダーをマスク
    const sensitiveHeaders = ['authorization', 'x-api-key', 'x-figma-token'];
    for (const header of sensitiveHeaders) {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private formatError(error: AxiosError): ApiError {
    const apiError: ApiError = {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      timestamp: new Date().toISOString(),
      requestId: error.config?.headers?.['X-Request-ID'] as string,
    };

    if (error.response) {
      apiError.code = `HTTP_${error.response.status}`;
      apiError.message = error.response.statusText || apiError.message;
      apiError.details = error.response.data;
    }

    return apiError;
  }

  private logError(context: string, error: AxiosError): void {
    if (this.config.enableLogging) {
      // 本番環境ではconsole.errorを無効化
      if (!envUtils.isProduction()) {
        console.error(`[API Error] ${context}`, {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message: error.message,
          requestId: error.config?.headers?.['X-Request-ID'],
        });
      }
    }
  }

  // パブリックメソッド
  public async get<T = unknown>(
    url: string, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.get<T>(url, config);
    return this.formatResponse(response);
  }

  public async post<T = unknown>(
    url: string, 
    data?: unknown, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.post<T>(url, data, config);
    return this.formatResponse(response);
  }

  public async put<T = unknown>(
    url: string, 
    data?: unknown, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.put<T>(url, data, config);
    return this.formatResponse(response);
  }

  public async delete<T = unknown>(
    url: string, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.delete<T>(url, config);
    return this.formatResponse(response);
  }

  public async patch<T = unknown>(
    url: string, 
    data?: unknown, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.patch<T>(url, data, config);
    return this.formatResponse(response);
  }

  private formatResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    return {
      data: response.data,
      status: response.status,
      timestamp: new Date().toISOString(),
    };
  }

  // レート制限情報の取得
  public getRateLimitInfo(url: string): RateLimitInfo | null {
    return this.rateLimitInfo.get(url) || null;
  }

  // 設定の更新
  public updateConfig(newConfig: Partial<ApiClientConfig>): void {
    Object.assign(this.config, newConfig);
  }

  // インスタンスの取得（高度な使用ケース用）
  public getInstance(): AxiosInstance {
    return this.instance;
  }
}

// 事前設定されたAPIクライアントのファクトリー
export const createApiClient = (config?: ApiClientConfig): ApiClient => {
  return new ApiClient(config);
};

// Figma API専用クライアント（サーバーサイド専用）
export const createServerSideFigmaApiClient = (): ApiClient => {
  if (!isServerSide()) {
    throw new Error('Figma API client with token can only be created on server side');
  }

  // 環境変数の優先順位: FIGMA_ACCESS_TOKEN > FIGMA_PERSONAL_ACCESS_TOKEN
  const accessToken = getServerEnvVar('FIGMA_ACCESS_TOKEN');
  const personalToken = getServerEnvVar('FIGMA_PERSONAL_ACCESS_TOKEN');
  
  const token = accessToken || personalToken;
  
  if (!token) {
    throw new Error(
      'Figma access token is required. Please set FIGMA_ACCESS_TOKEN or FIGMA_PERSONAL_ACCESS_TOKEN environment variable. ' +
      'Available tokens: FIGMA_ACCESS_TOKEN=' + (accessToken ? 'set' : 'not set') + ', ' +
      'FIGMA_PERSONAL_ACCESS_TOKEN=' + (personalToken ? 'set' : 'not set')
    );
  }
  
  return createApiClient({
    baseURL: 'https://api.figma.com/v1',
    timeout: 15000,
    retryAttempts: 3,
    authConfig: {
      type: 'apikey',
      token,
      apiKeyHeader: 'X-Figma-Token',
    },
    customHeaders: {
      'User-Agent': 'AI-Development-Template/1.0',
    },
  });
};

// クライアントサイド用Figma APIクライアント（API Routes経由）
export const createClientSideFigmaApiClient = (): ApiClient => {
  if (isServerSide()) {
    throw new Error('Client-side Figma API client should not be used on server side');
  }
  
  return createApiClient({
    baseURL: '/api/figma',
    timeout: 15000,
    retryAttempts: 3,
    customHeaders: {
      'User-Agent': 'AI-Development-Template/1.0',
    },
  });
};

// 汎用Figma APIクライアント（実行環境に応じて適切なクライアントを返す）
export const createFigmaApiClient = (): ApiClient => {
  if (isServerSide()) {
    return createServerSideFigmaApiClient();
  } else {
    return createClientSideFigmaApiClient();
  }
};

// その他のサーバーサイド専用APIクライアント作成関数
export const createServerSideApiClient = (config: ApiClientConfig & {
  envTokenKey?: string;
  tokenHeader?: string;
  required?: boolean;
}): ApiClient => {
  if (!isServerSide()) {
    throw new Error('Server-side API client can only be created on server side');
  }

  const { envTokenKey, tokenHeader, required = true, ...clientConfig } = config;
  
  if (envTokenKey) {
    const token = required ? getRequiredServerEnvVar(envTokenKey) : getServerEnvVar(envTokenKey);
    
    if (!token) {
      if (required) {
        throw new Error(`Environment variable ${envTokenKey} is required for server-side API client`);
      } else {
        // トークンが不要な場合は認証設定をスキップ
        return createApiClient(clientConfig);
      }
    }
    
    clientConfig.authConfig = {
      type: tokenHeader ? 'apikey' : 'bearer',
      token,
      ...(tokenHeader && { apiKeyHeader: tokenHeader }),
    };
  }
  
  return createApiClient(clientConfig);
};

// クライアントサイド専用APIクライアント（認証情報なし）
export const createClientSideApiClient = (config: Omit<ApiClientConfig, 'authConfig'>): ApiClient => {
  if (isServerSide()) {
    throw new Error('Client-side API client should not be used on server side');
  }

  // クライアントサイドでは認証情報を含めない
  return createApiClient(config);
};

// デフォルトエクスポート
export default ApiClient;
