import { NextRequest, NextResponse } from "next/server";
import { validators, createValidationErrorResponse } from "../../../../lib/validation";
import { security } from "../../../../lib/security";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const accessToken = process.env.FIGMA_ACCESS_TOKEN;
  const { fileId } = await params;

  // セキュリティヘッダーの設定
  const securityHeaders = security.api.generateSecurityHeaders();

  if (!accessToken) {
    return NextResponse.json(
      { error: "Figma access token not configured" },
      { status: 500, headers: securityHeaders }
    );
  }

  // パラメータのバリデーション
  const validationResult = validators.figmaFileRequest({ fileId });
  if (!validationResult.success) {
    security.logger.logSecurityEvent({
      type: 'XSS_ATTEMPT',
      input: fileId,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || '',
    });
    
    return NextResponse.json(
      createValidationErrorResponse(validationResult.errors!),
      { status: 400, headers: securityHeaders }
    );
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
    
    return NextResponse.json(
      createValidationErrorResponse(securityCheck.errors!),
      { status: 400, headers: securityHeaders }
    );
  }

  const sanitizedFileId = securityCheck.sanitized!;

  try {
    const response = await fetch(`https://api.figma.com/v1/files/${sanitizedFileId}`, {
      headers: {
        "X-Figma-Token": accessToken,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // レスポンスデータのサニタイゼーション
    const sanitizedResponse = {
      name: security.xss.filterXSS(data.name || ''),
    };

    return NextResponse.json(sanitizedResponse, { 
      status: 200, 
      headers: securityHeaders 
    });
  } catch {
    // セキュアなエラーログ処理
    security.logger.logSecurityEvent({
      type: 'XSS_ATTEMPT',
      input: 'Figma API request failed',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || '',
    });
    
    return NextResponse.json(
      { error: "Failed to fetch Figma data" },
      { status: 500, headers: securityHeaders }
    );
  }
}
