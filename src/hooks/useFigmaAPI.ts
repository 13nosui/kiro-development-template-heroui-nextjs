import { useState, useCallback, useRef, useEffect } from "react";
import { createApiClient, ApiResponse, ApiError } from "../lib/api-client";

// Figma APIレスポンスの型定義
interface FigmaData {
  name: string;
  lastModified: string;
  version: string;
  document?: {
    id: string;
    name: string;
    type: string;
  };
  metadata: {
    timestamp: string;
    requestId: string;
    status: string;
  };
}

// エラー情報の型定義
interface ApiErrorInfo {
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
  requestId?: string;
}

// フックの戻り値型定義
interface UseFigmaAPIResult {
  data: FigmaData | null;
  loading: boolean;
  error: ApiErrorInfo | null;
  rateLimitInfo: {
    remaining: number;
    reset: number;
    limit: number;
  } | null;
  fetchFigmaFile: (fileId: string, options?: FetchOptions) => Promise<void>;
  clearError: () => void;
  clearData: () => void;
  retry: () => Promise<void>;
}

// フェッチオプション
interface FetchOptions {
  useCache?: boolean;
  timeout?: number;
  skipValidation?: boolean;
}

// キャッシュエントリ
interface CacheEntry {
  data: FigmaData;
  timestamp: number;
  expiry: number;
}

// グローバルキャッシュ（シンプルなメモリキャッシュ）
const globalCache = new Map<string, CacheEntry>();
const CACHE_DURATION = 5 * 60 * 1000; // 5分間

export const useFigmaAPI = (): UseFigmaAPIResult => {
  const [data, setData] = useState<FigmaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiErrorInfo | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    remaining: number;
    reset: number;
    limit: number;
  } | null>(null);

  // 最後のリクエスト情報を保存（リトライ用）
  const lastRequest = useRef<{
    fileId: string;
    options?: FetchOptions;
  } | null>(null);

  // APIクライアントの初期化
  const apiClient = useRef(
    createApiClient({
      timeout: 15000,
      retryAttempts: 3,
      retryDelay: 1000,
      enableLogging: true,
    })
  );

  // キャッシュクリーンアップ
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of globalCache.entries()) {
        if (now > entry.expiry) {
          globalCache.delete(key);
        }
      }
    }, 60000); // 1分ごとにクリーンアップ

    return () => clearInterval(cleanupInterval);
  }, []);

  // キャッシュからデータを取得
  const getCachedData = useCallback((fileId: string): FigmaData | null => {
    const cacheKey = `figma_file_${fileId}`;
    const cached = globalCache.get(cacheKey);
    
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }
    
    return null;
  }, []);

  // キャッシュにデータを保存
  const setCachedData = useCallback((fileId: string, data: FigmaData): void => {
    const cacheKey = `figma_file_${fileId}`;
    const now = Date.now();
    
    globalCache.set(cacheKey, {
      data,
      timestamp: now,
      expiry: now + CACHE_DURATION,
    });
  }, []);

  // 入力値の基本的なバリデーション
  const validateFileId = useCallback((fileId: string): boolean => {
    if (!fileId || typeof fileId !== 'string') {
      return false;
    }
    
    // Figma file IDの基本的な形式チェック
    const figmaFileIdPattern = /^[a-zA-Z0-9]{22}$/;
    return figmaFileIdPattern.test(fileId);
  }, []);

  // Figmaファイルデータの取得
  const fetchFigmaFile = useCallback(async (
    fileId: string, 
    options: FetchOptions = {}
  ): Promise<void> => {
    const { useCache = true, timeout, skipValidation = false } = options;

    // リクエスト情報を保存（リトライ用）
    lastRequest.current = { fileId, options };

    setLoading(true);
    setError(null);

    try {
      // 入力値のバリデーション
      if (!skipValidation && !validateFileId(fileId)) {
        throw new Error('Invalid Figma file ID format');
      }

      // キャッシュチェック
      if (useCache) {
        const cachedData = getCachedData(fileId);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          return;
        }
      }

      // タイムアウト設定の適用
      if (timeout) {
        apiClient.current.updateConfig({ timeout });
      }

      // APIリクエスト実行
      const response: ApiResponse<FigmaData> = await apiClient.current.get(
        `/api/figma/${fileId}`
      );

      // レスポンスデータの設定
      setData(response.data);

      // キャッシュに保存
      if (useCache) {
        setCachedData(fileId, response.data);
      }

      // レート制限情報の更新
      const rateLimitHeaders = apiClient.current.getRateLimitInfo(`/api/figma/${fileId}`);
      if (rateLimitHeaders) {
        setRateLimitInfo(rateLimitHeaders);
      }

    } catch (err) {
      // エラーハンドリング
      let errorInfo: ApiErrorInfo;

             if (err && typeof err === 'object' && 'code' in err) {
         // APIクライアントからのエラー
         const apiError = err as ApiError;
         errorInfo = {
           code: apiError.code,
           message: apiError.message,
           details: apiError.details,
           timestamp: apiError.timestamp,
           ...(apiError.requestId && { requestId: apiError.requestId }),
         };
      } else if (err instanceof Error) {
        // 標準エラー
        errorInfo = {
          code: 'CLIENT_ERROR',
          message: err.message,
          timestamp: new Date().toISOString(),
        };
      } else {
        // 不明なエラー
        errorInfo = {
          code: 'UNKNOWN_ERROR',
          message: 'An unknown error occurred',
          timestamp: new Date().toISOString(),
        };
      }

      setError(errorInfo);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [validateFileId, getCachedData, setCachedData]);

  // エラーのクリア
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // データのクリア
  const clearData = useCallback((): void => {
    setData(null);
    setError(null);
    setRateLimitInfo(null);
  }, []);

  // リトライ機能
  const retry = useCallback(async (): Promise<void> => {
    if (lastRequest.current) {
      await fetchFigmaFile(lastRequest.current.fileId, lastRequest.current.options);
    }
  }, [fetchFigmaFile]);

  return { 
    data, 
    loading, 
    error, 
    rateLimitInfo,
    fetchFigmaFile,
    clearError,
    clearData,
    retry,
  };
};
