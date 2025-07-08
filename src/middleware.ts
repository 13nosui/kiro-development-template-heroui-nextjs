import { NextRequest, NextResponse } from 'next/server';
import { getClientIP, checkRateLimit } from '@/lib/security';

// 保護されたルートの定義
const PROTECTED_ROUTES = [
  '/api/figma',
  '/dashboard',
  '/profile',
  '/admin'
];

// 認証が必要なAPIルート
const AUTH_REQUIRED_API_ROUTES = [
  '/api/figma',
  '/api/user',
  '/api/posts',
  '/api/upload'
];

// パブリックルート（認証不要）
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/about',
  '/contact'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // グローバルセキュリティヘッダーの追加
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // HTTPSリダイレクト（本番環境）
  if (process.env.NODE_ENV === 'production' && 
      request.headers.get('x-forwarded-proto') !== 'https') {
    return NextResponse.redirect(
      new URL(`https://${request.headers.get('host')}${pathname}`, request.url)
    );
  }

  // APIルートのレート制限
  if (pathname.startsWith('/api/')) {
    const clientIP = getClientIP(request);
    
    // APIルート別のレート制限
    let rateLimit;
    
    if (pathname.startsWith('/api/figma')) {
      // Figma API: より厳しい制限
      rateLimit = checkRateLimit(`api-figma:${clientIP}`, 20, 60000); // 1分間に20リクエスト
    } else if (pathname.startsWith('/api/auth')) {
      // 認証API: 厳しい制限
      rateLimit = checkRateLimit(`api-auth:${clientIP}`, 5, 60000); // 1分間に5リクエスト
    } else {
      // その他のAPI: 標準制限
      rateLimit = checkRateLimit(`api-general:${clientIP}`, 60, 60000); // 1分間に60リクエスト
    }
    
    if (!rateLimit.allowed) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': '60',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }
    
    // レート制限ヘッダーを追加
    response.headers.set('X-RateLimit-Limit', '60');
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString());
  }

  // 認証チェック（簡易版 - 実際の実装ではJWTトークンを検証）
  const authToken = request.cookies.get('auth-token');
  const sessionToken = request.cookies.get('session-token');
  
  // 保護されたAPIルートの認証チェック
  if (AUTH_REQUIRED_API_ROUTES.some(route => pathname.startsWith(route))) {
    if (!authToken || !sessionToken) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }

  // 保護されたページルートの認証チェック
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route)) && 
      !PUBLIC_ROUTES.includes(pathname)) {
    if (!authToken || !sessionToken) {
      // 認証ページにリダイレクト
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // CSRF Protection（POST、PUT、DELETE リクエスト）
  if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
    const csrfToken = request.headers.get('x-csrf-token');
    const sessionCSRF = request.cookies.get('csrf-token');
    
    if (!csrfToken || !sessionCSRF || csrfToken !== sessionCSRF.value) {
      return new NextResponse(
        JSON.stringify({ error: 'CSRF token validation failed' }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }

  // セキュリティログ記録（開発環境以外）
  if (process.env.NODE_ENV !== 'development') {
    const logData = {
      timestamp: new Date().toISOString(),
      ip: getClientIP(request),
      method: request.method,
      path: pathname,
      userAgent: request.headers.get('user-agent'),
      authenticated: !!authToken
    };
    
    // 実際の実装では、これをログサービスに送信
    console.log('Security Log:', JSON.stringify(logData));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
