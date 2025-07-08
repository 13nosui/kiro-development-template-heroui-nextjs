import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIP, sanitizeInput, createSecureErrorResponse } from "@/lib/security";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const accessToken = process.env.FIGMA_ACCESS_TOKEN;
  const { fileId } = await params;
  
  // レート制限チェック
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(`figma-api:${clientIP}`, 30, 60000); // 1分間に30リクエスト
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '30',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString()
        }
      }
    );
  }

  // 環境変数チェック
  if (!accessToken) {
    console.error('Figma access token not configured');
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503 }
    );
  }

  // 入力値バリデーション
  const sanitizedFileId = sanitizeInput(fileId);
  if (!sanitizedFileId || !/^[a-zA-Z0-9-_]+$/.test(sanitizedFileId)) {
    return NextResponse.json(
      { error: "Invalid file ID format" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`https://api.figma.com/v1/files/${sanitizedFileId}`, {
      headers: {
        "X-Figma-Token": accessToken,
        "User-Agent": "SecureApp/1.0", // ユーザーエージェントを明示
      },
      // タイムアウト設定
      signal: AbortSignal.timeout(10000) // 10秒でタイムアウト
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "File not found" },
          { status: 404 }
        );
      }
      
      if (response.status === 403) {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        );
      }
      
      throw new Error(`Figma API error: ${response.status}`);
    }

    const data = await response.json();
    
    // レスポンスデータのサニタイゼーション
    const sanitizedResponse = {
      name: sanitizeInput(data.name || 'Untitled'),
      // 必要な情報のみ返す
    };
    
    return NextResponse.json(sanitizedResponse, {
      headers: {
        'X-RateLimit-Limit': '30',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
        'Cache-Control': 'private, max-age=300', // 5分間キャッシュ
      }
    });
  } catch (error) {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const secureError = createSecureErrorResponse(error, isDevelopment);
    
    return NextResponse.json(
      secureError,
      { status: 500 }
    );
  }
}
