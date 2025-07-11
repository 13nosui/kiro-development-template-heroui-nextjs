import { NextRequest, NextResponse } from "next/server";
import { validators } from "../../../../lib/validation";
import { security } from "../../../../lib/security";
import { createServerSideFigmaApiClient } from "../../../../lib/api-client";

// Figma APIレスポンスの型定義
interface FigmaFileResponse {
  name: string;
  lastModified: string;
  version: string;
  document?: {
    id: string;
    name: string;
    type: string;
  };
  [key: string]: unknown;
}

// エラーレスポンスの型定義
interface ErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
  timestamp: string;
  requestId?: string;
}

// 実際のAPI処理
async function handleFigmaRequest(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
): Promise<NextResponse> {
  const { fileId } = await params;
  const requestId = `figma_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    // パラメータのバリデーション
    const validationResult = validators.figmaFileRequest({ fileId });
    if (!validationResult.success) {
      security.logger.logSecurityEvent({
        type: 'XSS_ATTEMPT',
        input: fileId,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || '',
      });
      
      const errorResponse: ErrorResponse = {
        error: 'Invalid file ID format',
        code: 'VALIDATION_ERROR',
        details: validationResult.errors,
        timestamp: new Date().toISOString(),
        requestId,
      };

      return NextResponse.json(errorResponse, { status: 400 });
    }

    // 入力値のセキュリティチェック
    const securityCheck = security.api.validateAndSanitize(fileId);
    if (!securityCheck.isValid) {
      security.logger.logSecurityEvent({
        type: 'XSS_ATTEMPT',
        input: fileId,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || '',
      });
      
      const errorResponse: ErrorResponse = {
        error: 'Security validation failed',
        code: 'SECURITY_ERROR',
        details: securityCheck.errors,
        timestamp: new Date().toISOString(),
        requestId,
      };

      return NextResponse.json(errorResponse, { status: 400 });
    }

    const sanitizedFileId = securityCheck.sanitized!;

    // 統合APIクライアントを使用してFigma APIを呼び出し
    const figmaClient = createServerSideFigmaApiClient();
    const response = await figmaClient.get<FigmaFileResponse>(`/files/${sanitizedFileId}`);

    // レスポンスデータのサニタイゼーションと構造化
    const sanitizedResponse = {
      name: security.xss.filterXSS(response.data.name || 'Untitled'),
      lastModified: response.data.lastModified || new Date().toISOString(),
      version: security.xss.filterXSS(response.data.version || '1.0'),
      document: response.data.document ? {
        id: security.xss.filterXSS(response.data.document.id || ''),
        name: security.xss.filterXSS(response.data.document.name || ''),
        type: security.xss.filterXSS(response.data.document.type || 'DOCUMENT'),
      } : undefined,
      metadata: {
        timestamp: response.timestamp,
        requestId,
        status: 'success',
      }
    };

    // レート制限情報をヘッダーに追加
    const rateLimitInfo = figmaClient.getRateLimitInfo(`/files/${sanitizedFileId}`);
    const responseHeaders: Record<string, string> = {
      'X-Request-ID': requestId,
      'Cache-Control': 'private, max-age=300', // 5分間キャッシュ
    };

    if (rateLimitInfo) {
      responseHeaders['X-Rate-Limit-Remaining'] = rateLimitInfo.remaining.toString();
      responseHeaders['X-Rate-Limit-Reset'] = rateLimitInfo.reset.toString();
      responseHeaders['X-Rate-Limit-Limit'] = rateLimitInfo.limit.toString();
    }

    return NextResponse.json(sanitizedResponse, { 
      status: 200,
      headers: responseHeaders
    });

  } catch (error) {
    // エラーログの記録
    security.logger.logSecurityEvent({
      type: 'XSS_ATTEMPT',
      input: `Figma API request failed for fileId: ${fileId}`,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || '',
    });

    // エラーレスポンスの生成
    let errorResponse: ErrorResponse;

    if (error && typeof error === 'object' && 'code' in error) {
      // APIClientからのエラー
      const apiError = error as { code: string; message: string; details?: unknown };
      errorResponse = {
        error: apiError.message || 'Failed to fetch Figma data',
        code: apiError.code || 'API_ERROR',
        details: apiError.details,
        timestamp: new Date().toISOString(),
        requestId,
      };
    } else {
      // 一般的なエラー
      errorResponse = {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
        requestId,
      };
    }

    // ステータスコードの決定
    let statusCode = 500;
    if (errorResponse.code?.startsWith('HTTP_')) {
      const httpCode = parseInt(errorResponse.code.replace('HTTP_', ''));
      if (httpCode >= 400 && httpCode < 600) {
        statusCode = httpCode;
      }
    }

    return NextResponse.json(errorResponse, { 
      status: statusCode,
      headers: {
        'X-Request-ID': requestId,
      }
    });
  }
}

// CORS設定を適用したGETハンドラー
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ fileId: string }> }
): Promise<NextResponse> {
  // 実際のAPI処理を実行
  const response = await handleFigmaRequest(request, context);

  // CORSヘッダーを追加
  const origin = request.headers.get('origin');
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  return response;
}

// その他のHTTPメソッドは許可しない
export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED',
      timestamp: new Date().toISOString(),
    }, 
    { status: 405, headers: { 'Allow': 'GET' } }
  );
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED',
      timestamp: new Date().toISOString(),
    }, 
    { status: 405, headers: { 'Allow': 'GET' } }
  );
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED',
      timestamp: new Date().toISOString(),
    }, 
    { status: 405, headers: { 'Allow': 'GET' } }
  );
}

export async function PATCH(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED',
      timestamp: new Date().toISOString(),
    }, 
    { status: 405, headers: { 'Allow': 'GET' } }
  );
}
