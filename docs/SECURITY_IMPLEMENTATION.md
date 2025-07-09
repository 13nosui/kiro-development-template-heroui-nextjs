# セキュリティ実装ガイド

## 概要

このドキュメントでは、APIやフォームの入力値バリデーションの強化、XSS/インジェクション対策について説明します。

## 実装したセキュリティ機能

### 1. 入力値バリデーション

#### バリデーションライブラリ
- **zod**: TypeScript-first のスキーマバリデーション
- **validator**: 文字列バリデーション
- **DOMPurify**: HTML サニタイゼーション

#### 実装されたバリデーション

##### 共通バリデーション (`src/lib/validation.ts`)
```typescript
// 基本的なフィールド
email: メールアドレス形式チェック、長さ制限
password: 8文字以上、大文字・小文字・数字を含む
figmaFileId: Figma特有のID形式チェック
figmaNodeId: Figmaノード特有のID形式チェック
url: 安全なURL形式チェック
safeText: XSS対策済みテキスト
```

##### フォームバリデーション
```typescript
loginForm: ログイン時のバリデーション
registerForm: 新規登録時のバリデーション（パスワード確認含む）
profileUpdateForm: プロフィール更新時のバリデーション
```

##### APIバリデーション
```typescript
figmaFileRequest: Figma APIリクエスト時のバリデーション
figmaMcpRequest: Figma MCP API リクエスト時のバリデーション
authRequest: 認証リクエスト時のバリデーション
```

### 2. XSS対策

#### XSS保護機能 (`src/lib/security.ts`)
```typescript
// HTMLサニタイゼーション
sanitizeHtml(html: string): HTMLタグの危険部分を除去
escapeHtml(text: string): 特殊文字をエスケープ
removeScriptTags(input: string): <script>タグを除去
removeJavaScriptProtocol(input: string): javascript:を除去
removeEventHandlers(input: string): イベントハンドラーを除去
filterXSS(input: string): 包括的なXSSフィルタリング
```

#### 実装例
```typescript
// フォーム入力時のリアルタイムフィルタリング
onChange={(e) => setEmail(security.xss.filterXSS(e.target.value))}

// APIレスポンスのサニタイゼーション
const sanitizedResponse = {
  name: security.xss.filterXSS(data.name || ''),
};
```

### 3. SQLインジェクション対策

#### SQLインジェクション保護機能
```typescript
detectSQLInjection(input: string): SQLインジェクションパターンの検出
isSuspiciousInput(input: string): 疑わしい入力の検出
sanitizeForDatabase(input: string): データベース用のサニタイゼーション
```

#### 検出パターン
- SQL キーワード (SELECT, INSERT, UPDATE, DELETE, DROP, etc.)
- 条件式パターン (OR/AND 1=1, etc.)
- 特殊文字 (;, --, |, /*, */, etc.)
- SQLファンクション (CHAR, VARCHAR, EXEC, etc.)

### 4. CSRF対策

#### CSRF保護機能
```typescript
generateToken(): 安全なCSRFトークンを生成
validateToken(token, expectedToken): 定数時間でトークンを検証
```

#### 実装例
```typescript
// CSRFトークンの生成
const csrfToken = security.csrf.generateToken();

// トークンの検証
const isValid = security.csrf.validateToken(token, expectedToken);
```

### 5. 包括的なセキュリティチェック

#### 入力値セキュリティチェック
```typescript
isSecure(input: string): {
  secure: boolean;
  issues: string[];
}
```

#### 検出される攻撃パターン
- XSS攻撃の可能性
- SQLインジェクション攻撃の可能性
- パストラバーサル攻撃の可能性
- コマンドインジェクション攻撃の可能性
- LDAP インジェクション攻撃の可能性

### 6. APIセキュリティ

#### セキュリティヘッダー
```typescript
generateSecurityHeaders(): {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'...",
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}
```

#### レート制限
```typescript
checkRateLimit(identifier: string, limit: number, window: number): boolean
```

### 7. セキュリティログ

#### セキュリティイベントログ
```typescript
logSecurityEvent(event: {
  type: 'XSS_ATTEMPT' | 'SQL_INJECTION' | 'CSRF_ATTACK' | 'RATE_LIMIT_EXCEEDED';
  ip?: string;
  userAgent?: string;
  input?: string;
  timestamp?: Date;
})
```

## 使用例

### APIでの使用例 (`src/app/api/figma/[fileId]/route.ts`)

```typescript
import { validators, createValidationErrorResponse } from "../../../../lib/validation";
import { security } from "../../../../lib/security";

export async function GET(request: NextRequest, { params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params;
  
  // セキュリティヘッダーの設定
  const securityHeaders = security.api.generateSecurityHeaders();
  
  // パラメータのバリデーション
  const validationResult = validators.figmaFileRequest({ fileId });
  if (!validationResult.success) {
    security.logger.logSecurityEvent({
      type: 'XSS_ATTEMPT',
      input: fileId,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
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
    // セキュリティイベントのログ
    return NextResponse.json(
      createValidationErrorResponse(securityCheck.errors!),
      { status: 400, headers: securityHeaders }
    );
  }
  
  // サニタイズされた値を使用
  const sanitizedFileId = securityCheck.sanitized!;
  
  // APIレスポンスもサニタイズ
  const sanitizedResponse = {
    name: security.xss.filterXSS(data.name || ''),
  };
  
  return NextResponse.json(sanitizedResponse, { 
    status: 200, 
    headers: securityHeaders 
  });
}
```

### フォームでの使用例 (`src/components/AuthForm.tsx`)

```typescript
import { validators, ValidationError } from "../lib/validation";
import { security } from "../lib/security";

export default function AuthForm({ onSuccess }: AuthFormProps) {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);
    
    // 入力値のバリデーション
    const formData = isLogin 
      ? { email, password }
      : { email, password, confirmPassword };
    
    const validationResult = isLogin 
      ? validators.loginForm(formData)
      : validators.registerForm(formData);
    
    if (!validationResult.success) {
      setValidationErrors(validationResult.errors || []);
      return;
    }
    
    // セキュリティチェック
    const emailCheck = security.api.validateAndSanitize(email);
    const passwordCheck = security.api.validateAndSanitize(password);
    
    if (!emailCheck.isValid || !passwordCheck.isValid) {
      security.logger.logSecurityEvent({
        type: 'XSS_ATTEMPT',
        input: `email: ${email}`,
        userAgent: navigator.userAgent,
      });
      
      setError("入力値にセキュリティ上の問題があります");
      return;
    }
    
    // サニタイズされた値を使用
    const sanitizedEmail = emailCheck.sanitized!;
    const sanitizedPassword = passwordCheck.sanitized!;
    
    // 認証処理
    const result = await loginWithEmail(sanitizedEmail, sanitizedPassword);
  };
  
  return (
    <form onSubmit={handleEmailAuth}>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(security.xss.filterXSS(e.target.value))}
        isInvalid={!!getFieldError('email')}
        errorMessage={getFieldError('email')}
      />
      {/* 他のフィールド */}
    </form>
  );
}
```

## セキュリティベストプラクティス

### 1. 入力値の処理
- すべての入力値をバリデーション
- サニタイゼーション後の値のみを使用
- レスポンスデータもサニタイズ

### 2. エラーハンドリング
- セキュリティイベントのログ記録
- 攻撃者に情報を与えない適切なエラーレスポンス
- バリデーションエラーの詳細な情報提供

### 3. セキュリティヘッダー
- 全APIエンドポイントにセキュリティヘッダーを設定
- Content Security Policy (CSP) の適切な設定
- XSS Protection の有効化

### 4. 監視とログ
- セキュリティイベントの監視
- 異常なパターンの検出
- インシデントレスポンスの準備

## 今後の改善点

### 1. 高度なセキュリティ機能
- Web Application Firewall (WAF) の導入
- より高度なレート制限
- 機械学習ベースの異常検知

### 2. 監査とコンプライアンス
- セキュリティ監査の実施
- OWASP Top 10 対応状況の確認
- 定期的なセキュリティテスト

### 3. パフォーマンス最適化
- バリデーション処理の最適化
- キャッシュ戦略の改善
- 非同期処理の活用

## 参考資料

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Zod Documentation](https://zod.dev/)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
