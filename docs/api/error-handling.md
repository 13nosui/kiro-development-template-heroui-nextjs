# Error Handling Patterns and Status Codes

## Overview

This document provides comprehensive information about error handling patterns, HTTP status codes, and error response formats used throughout the AI Development Template API. All endpoints implement consistent error handling with detailed error information and security considerations.

## Table of Contents

1. [Error Response Format](#error-response-format)
2. [HTTP Status Codes](#http-status-codes)
3. [Error Categories](#error-categories)
4. [Validation Errors](#validation-errors)
5. [Security Errors](#security-errors)
6. [Rate Limiting Errors](#rate-limiting-errors)
7. [Client-Side Error Handling](#client-side-error-handling)
8. [Server-Side Error Handling](#server-side-error-handling)
9. [Error Logging and Monitoring](#error-logging-and-monitoring)

## Error Response Format

All API endpoints use a consistent error response format to ensure predictable error handling:

### Standard Error Response

```typescript
interface ErrorResponse {
  error: string; // Human-readable error message
  code?: string; // Machine-readable error code
  details?: unknown; // Additional error details (validation errors, etc.)
  timestamp: string; // ISO 8601 timestamp
  requestId?: string; // Unique request identifier for tracking
}
```

### Example Error Response

```json
{
  "error": "Invalid file ID format",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "fileId",
      "message": "ファイルIDの形式が無効です",
      "code": "invalid_string"
    }
  ],
  "timestamp": "2024-01-15T10:35:00Z",
  "requestId": "figma_1705312500000_abc123"
}
```

## HTTP Status Codes

The API uses standard HTTP status codes with specific meanings:

### Success Codes (2xx)

| Code | Status     | Description                    | Usage                                       |
| ---- | ---------- | ------------------------------ | ------------------------------------------- |
| 200  | OK         | Request successful             | Successful GET, POST, PUT, PATCH operations |
| 201  | Created    | Resource created               | Successful resource creation                |
| 204  | No Content | Request successful, no content | Successful DELETE operations                |

### Client Error Codes (4xx)

| Code | Status               | Description                              | Common Causes                                              |
| ---- | -------------------- | ---------------------------------------- | ---------------------------------------------------------- |
| 400  | Bad Request          | Invalid request format or parameters     | Validation errors, malformed JSON, missing required fields |
| 401  | Unauthorized         | Authentication required or failed        | Missing or invalid authentication credentials              |
| 403  | Forbidden            | Access denied                            | Insufficient permissions, security violations              |
| 404  | Not Found            | Resource not found                       | Invalid endpoint, non-existent resource                    |
| 405  | Method Not Allowed   | HTTP method not supported                | Using POST on GET-only endpoint                            |
| 409  | Conflict             | Resource conflict                        | Duplicate resource creation                                |
| 422  | Unprocessable Entity | Valid request format but semantic errors | Business logic validation failures                         |
| 429  | Too Many Requests    | Rate limit exceeded                      | Exceeded API rate limits                                   |

### Server Error Codes (5xx)

| Code | Status                | Description                     | Common Causes                              |
| ---- | --------------------- | ------------------------------- | ------------------------------------------ |
| 500  | Internal Server Error | Unexpected server error         | Unhandled exceptions, configuration errors |
| 502  | Bad Gateway           | Upstream server error           | External API failures (Figma API down)     |
| 503  | Service Unavailable   | Service temporarily unavailable | Maintenance mode, overloaded server        |
| 504  | Gateway Timeout       | Upstream server timeout         | External API timeouts                      |

## Error Categories

### 1. Validation Errors (400)

Validation errors occur when request data doesn't meet the required format or constraints.

#### Error Code: `VALIDATION_ERROR`

**Common Scenarios:**

- Invalid parameter formats
- Missing required fields
- Data type mismatches
- Length constraints violations

**Example Response:**

```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "fileId",
      "message": "ファイルIDの形式が無効です",
      "code": "invalid_string"
    },
    {
      "field": "nodeId",
      "message": "ノードIDは必須です",
      "code": "required"
    }
  ],
  "timestamp": "2024-01-15T10:35:00Z",
  "requestId": "req_1705312500000_abc123"
}
```

**Client Handling:**

```typescript
interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

function handleValidationError(error: ErrorResponse): Map<string, string> {
  const fieldErrors = new Map<string, string>();

  if (error.code === "VALIDATION_ERROR" && Array.isArray(error.details)) {
    error.details.forEach((detail: ValidationError) => {
      fieldErrors.set(detail.field, detail.message);
    });
  }

  return fieldErrors;
}
```

### 2. Security Errors (400)

Security errors occur when input fails security validation checks.

#### Error Code: `SECURITY_ERROR`

**Common Scenarios:**

- XSS attack attempts
- SQL injection attempts
- Malicious input patterns
- Suspicious request patterns

**Example Response:**

```json
{
  "error": "Security validation failed",
  "code": "SECURITY_ERROR",
  "details": [
    {
      "field": "input",
      "message": "XSS攻撃の可能性があります"
    }
  ],
  "timestamp": "2024-01-15T10:35:00Z",
  "requestId": "req_1705312500000_abc123"
}
```

**Security Event Logging:**

When security errors occur, the system automatically logs security events:

```typescript
interface SecurityEvent {
  type: "XSS_ATTEMPT" | "SQL_INJECTION" | "CSRF_ATTACK" | "RATE_LIMIT_EXCEEDED";
  ip?: string;
  userAgent?: string;
  input?: string;
  timestamp?: Date;
}
```

### 3. Authentication Errors (401)

Authentication errors occur when requests lack proper authentication or credentials are invalid.

#### Error Code: `AUTH_ERROR`

**Common Scenarios:**

- Missing authentication headers
- Invalid API tokens
- Expired credentials
- Webhook signature verification failures

**Example Response:**

```json
{
  "error": "Invalid signature",
  "code": "AUTH_ERROR",
  "timestamp": "2024-01-15T10:35:00Z",
  "requestId": "webhook_1705312500000_abc123"
}
```

### 4. Configuration Errors (500)

Configuration errors occur when server-side configuration is missing or invalid.

#### Error Code: `CONFIG_ERROR`

**Common Scenarios:**

- Missing environment variables
- Invalid configuration values
- Service initialization failures

**Example Response:**

```json
{
  "error": "Figma access token not configured. Please set FIGMA_ACCESS_TOKEN or FIGMA_PERSONAL_ACCESS_TOKEN environment variable.",
  "code": "CONFIG_ERROR",
  "debug": {
    "figmaAccessToken": "not set",
    "figmaPersonalToken": "not set"
  },
  "timestamp": "2024-01-15T10:35:00Z",
  "requestId": "req_1705312500000_abc123"
}
```

### 5. External API Errors (502, 504)

External API errors occur when upstream services (like Figma API) fail or timeout.

#### Error Codes: `API_ERROR`, `HTTP_*`

**Common Scenarios:**

- Figma API downtime
- Network connectivity issues
- Upstream service rate limiting
- Invalid API responses

**Example Response:**

```json
{
  "error": "Failed to fetch Figma data",
  "code": "HTTP_503",
  "details": {
    "upstreamError": "Service temporarily unavailable",
    "retryAfter": 300
  },
  "timestamp": "2024-01-15T10:35:00Z",
  "requestId": "req_1705312500000_abc123"
}
```

## Validation Errors

### Zod Schema Validation

The API uses Zod schemas for comprehensive input validation:

```typescript
// Common validation schemas
const commonSchemas = {
  figmaFileId: z
    .string()
    .min(1, "ファイルIDは必須です")
    .regex(/^[A-Za-z0-9_-]+$/, "ファイルIDの形式が無効です")
    .max(100, "ファイルIDが長すぎます"),

  figmaNodeId: z
    .string()
    .min(1, "ノードIDは必須です")
    .regex(/^[A-Za-z0-9:_-]+$/, "ノードIDの形式が無効です")
    .max(100, "ノードIDが長すぎます"),
};

// API request schemas
const apiSchemas = {
  figmaFileRequest: z.object({
    fileId: commonSchemas.figmaFileId,
  }),

  figmaMcpRequest: z.object({
    fileId: commonSchemas.figmaFileId,
    nodeId: commonSchemas.figmaNodeId,
  }),
};
```

### Validation Error Processing

```typescript
function processValidationError(zodError: z.ZodError): ValidationError[] {
  return zodError.errors.map((error) => ({
    field: error.path.join("."),
    message: error.message,
    code: error.code,
  }));
}

function createValidationErrorResponse(
  errors: ValidationError[]
): ErrorResponse {
  return {
    error: "Validation failed",
    code: "VALIDATION_ERROR",
    details: errors,
    timestamp: new Date().toISOString(),
  };
}
```

## Security Errors

### XSS Protection

The API implements comprehensive XSS protection:

```typescript
// XSS detection patterns
const xssPatterns = [
  /<script[^>]*>[\s\S]*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
];

function detectXSS(input: string): boolean {
  return xssPatterns.some((pattern) => pattern.test(input));
}

// Security validation
function validateSecurity(input: string): {
  secure: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  if (detectXSS(input)) {
    issues.push("XSS攻撃の可能性があります");
  }

  if (detectSQLInjection(input)) {
    issues.push("SQLインジェクションの可能性があります");
  }

  return {
    secure: issues.length === 0,
    issues,
  };
}
```

### SQL Injection Protection

```typescript
// SQL injection detection patterns
const sqlPatterns = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
  /(\b(OR|AND)\s+\w+\s*=\s*\w+)/i,
  /(;|\-\-|\||\/\*|\*\/)/,
];

function detectSQLInjection(input: string): boolean {
  return sqlPatterns.some((pattern) => pattern.test(input));
}
```

## Rate Limiting Errors

### Rate Limit Implementation

```typescript
interface RateLimitInfo {
  remaining: number;
  reset: number;
  limit: number;
}

// Rate limit error response
function createRateLimitError(rateLimitInfo: RateLimitInfo): ErrorResponse {
  const resetTime = new Date(rateLimitInfo.reset * 1000);

  return {
    error: `Rate limit exceeded. Try again after ${resetTime.toISOString()}`,
    code: "RATE_LIMIT_EXCEEDED",
    details: {
      limit: rateLimitInfo.limit,
      remaining: rateLimitInfo.remaining,
      resetTime: resetTime.toISOString(),
    },
    timestamp: new Date().toISOString(),
  };
}
```

### Rate Limit Headers

Rate limit information is provided in response headers:

```http
X-Rate-Limit-Remaining: 0
X-Rate-Limit-Reset: 1705312800
X-Rate-Limit-Limit: 100
```

## Client-Side Error Handling

### Comprehensive Error Handler

```typescript
class ApiErrorHandler {
  static async handleResponse(response: Response): Promise<any> {
    // Handle successful responses
    if (response.ok) {
      return await response.json();
    }

    // Parse error response
    let errorData: ErrorResponse;
    try {
      errorData = await response.json();
    } catch {
      // Fallback for non-JSON error responses
      errorData = {
        error: response.statusText || "Unknown error",
        code: `HTTP_${response.status}`,
        timestamp: new Date().toISOString(),
      };
    }

    // Handle specific error types
    switch (response.status) {
      case 400:
        throw new ValidationError(errorData);
      case 401:
        throw new AuthenticationError(errorData);
      case 403:
        throw new AuthorizationError(errorData);
      case 404:
        throw new NotFoundError(errorData);
      case 429:
        throw new RateLimitError(errorData);
      case 500:
        throw new ServerError(errorData);
      default:
        throw new ApiError(errorData);
    }
  }
}

// Custom error classes
class ApiError extends Error {
  constructor(public errorData: ErrorResponse) {
    super(errorData.error);
    this.name = "ApiError";
  }
}

class ValidationError extends ApiError {
  constructor(errorData: ErrorResponse) {
    super(errorData);
    this.name = "ValidationError";
  }

  getFieldErrors(): Map<string, string> {
    const fieldErrors = new Map<string, string>();

    if (Array.isArray(this.errorData.details)) {
      this.errorData.details.forEach((detail: any) => {
        if (detail.field && detail.message) {
          fieldErrors.set(detail.field, detail.message);
        }
      });
    }

    return fieldErrors;
  }
}

class RateLimitError extends ApiError {
  constructor(errorData: ErrorResponse) {
    super(errorData);
    this.name = "RateLimitError";
  }

  getRetryAfter(): number {
    const details = this.errorData.details as any;
    if (details?.resetTime) {
      return Math.max(0, new Date(details.resetTime).getTime() - Date.now());
    }
    return 0;
  }
}
```

### React Error Boundary

```tsx
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ApiErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service
    console.error("API Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong with the API</h2>
          {this.state.error instanceof ValidationError && (
            <div className="validation-errors">
              <h3>Validation Errors:</h3>
              <ul>
                {Array.from(this.state.error.getFieldErrors()).map(
                  ([field, message]) => (
                    <li key={field}>
                      <strong>{field}:</strong> {message}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
          {this.state.error instanceof RateLimitError && (
            <div className="rate-limit-error">
              <h3>Rate Limit Exceeded</h3>
              <p>
                Please try again in{" "}
                {Math.ceil(this.state.error.getRetryAfter() / 1000)} seconds.
              </p>
            </div>
          )}
          <details>
            <summary>Error Details</summary>
            <pre>{this.state.error?.stack}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Server-Side Error Handling

### Express.js Error Middleware

```typescript
import { Request, Response, NextFunction } from "express";

interface ApiRequest extends Request {
  requestId?: string;
}

// Error handling middleware
function errorHandler(
  error: Error,
  req: ApiRequest,
  res: Response,
  next: NextFunction
): void {
  const requestId = req.requestId || "unknown";

  // Log error
  console.error(`[${requestId}] Error:`, error);

  // Handle specific error types
  if (error instanceof ValidationError) {
    res.status(400).json({
      error: error.message,
      code: "VALIDATION_ERROR",
      details: error.details,
      timestamp: new Date().toISOString(),
      requestId,
    });
    return;
  }

  if (error instanceof AuthenticationError) {
    res.status(401).json({
      error: error.message,
      code: "AUTH_ERROR",
      timestamp: new Date().toISOString(),
      requestId,
    });
    return;
  }

  // Default error response
  res.status(500).json({
    error: "Internal server error",
    code: "INTERNAL_ERROR",
    timestamp: new Date().toISOString(),
    requestId,
  });
}

// Request ID middleware
function requestIdMiddleware(
  req: ApiRequest,
  res: Response,
  next: NextFunction
): void {
  req.requestId = `req_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
  res.setHeader("X-Request-ID", req.requestId);
  next();
}
```

### Next.js API Route Error Handling

```typescript
import { NextRequest, NextResponse } from "next/server";

function handleApiError(error: unknown, requestId: string): NextResponse {
  console.error(`[${requestId}] API Error:`, error);

  // Handle known error types
  if (error instanceof ValidationError) {
    return NextResponse.json(
      {
        error: error.message,
        code: "VALIDATION_ERROR",
        details: error.details,
        timestamp: new Date().toISOString(),
        requestId,
      },
      { status: 400 }
    );
  }

  if (error instanceof RateLimitError) {
    return NextResponse.json(
      {
        error: error.message,
        code: "RATE_LIMIT_EXCEEDED",
        timestamp: new Date().toISOString(),
        requestId,
      },
      {
        status: 429,
        headers: {
          "X-Rate-Limit-Remaining": "0",
          "X-Rate-Limit-Reset": Math.floor(Date.now() / 1000 + 3600).toString(),
        },
      }
    );
  }

  // Default error response
  return NextResponse.json(
    {
      error: "Internal server error",
      code: "INTERNAL_ERROR",
      timestamp: new Date().toISOString(),
      requestId,
    },
    { status: 500 }
  );
}

// Usage in API route
export async function GET(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  try {
    // API logic here
    const data = await processRequest(request);

    return NextResponse.json(data, {
      headers: {
        "X-Request-ID": requestId,
      },
    });
  } catch (error) {
    return handleApiError(error, requestId);
  }
}
```

## Error Logging and Monitoring

### Structured Error Logging

```typescript
interface ErrorLogEntry {
  timestamp: string;
  requestId: string;
  error: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  request: {
    method: string;
    url: string;
    headers: Record<string, string>;
    ip?: string;
    userAgent?: string;
  };
  response: {
    status: number;
    duration: number;
  };
}

class ErrorLogger {
  static log(
    error: Error,
    request: Request,
    response: Response,
    requestId: string,
    duration: number
  ): void {
    const logEntry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      requestId,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
      },
      request: {
        method: request.method,
        url: request.url,
        headers: this.sanitizeHeaders(request.headers),
        ip: request.ip,
        userAgent: request.get("User-Agent"),
      },
      response: {
        status: response.statusCode,
        duration,
      },
    };

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("API Error:", JSON.stringify(logEntry, null, 2));
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === "production") {
      this.sendToMonitoringService(logEntry);
    }
  }

  private static sanitizeHeaders(headers: any): Record<string, string> {
    const sanitized = { ...headers };

    // Remove sensitive headers
    const sensitiveHeaders = ["authorization", "x-api-key", "x-figma-token"];
    sensitiveHeaders.forEach((header) => {
      if (sanitized[header]) {
        sanitized[header] = "[REDACTED]";
      }
    });

    return sanitized;
  }

  private static sendToMonitoringService(logEntry: ErrorLogEntry): void {
    // Implementation depends on monitoring service
    // Examples: Sentry, DataDog, CloudWatch, etc.
  }
}
```

### Error Metrics Collection

```typescript
class ErrorMetrics {
  private static metrics = new Map<string, number>();

  static increment(errorCode: string): void {
    const current = this.metrics.get(errorCode) || 0;
    this.metrics.set(errorCode, current + 1);
  }

  static getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  static reset(): void {
    this.metrics.clear();
  }

  static getErrorRate(): number {
    const total = Array.from(this.metrics.values()).reduce(
      (sum, count) => sum + count,
      0
    );
    const errors = Array.from(this.metrics.entries())
      .filter(
        ([code]) => code.startsWith("HTTP_4") || code.startsWith("HTTP_5")
      )
      .reduce((sum, [, count]) => sum + count, 0);

    return total > 0 ? errors / total : 0;
  }
}
```

This comprehensive error handling documentation ensures that developers can implement robust error handling patterns and understand the complete error response structure of the AI Development Template API.
