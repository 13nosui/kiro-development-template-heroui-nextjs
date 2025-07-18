# API Endpoints Documentation

## Overview

This document provides comprehensive documentation for all REST API endpoints in the AI Development Template. The application uses Next.js API routes to provide secure, validated endpoints for external integrations and client-side functionality.

## Table of Contents

1. [API Architecture](#api-architecture)
2. [Authentication & Security](#authentication--security)
3. [Figma API Endpoints](#figma-api-endpoints)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Request/Response Formats](#requestresponse-formats)

## API Architecture

The application uses Next.js API routes with the following structure:

- **App Router API Routes:** `/src/app/api/` - Modern Next.js 13+ API routes
- **Pages API Routes:** `/src/pages/api/` - Legacy Next.js API routes for compatibility

### Security Layers

All API endpoints implement multiple security layers:

1. **Input Validation:** Zod schema validation for all inputs
2. **XSS Protection:** Input and output sanitization using DOMPurify
3. **SQL Injection Protection:** Pattern detection and input sanitization
4. **CSRF Protection:** Token validation for state-changing operations
5. **Rate Limiting:** Request throttling to prevent abuse
6. **Security Headers:** Comprehensive security headers on all responses

### Common Response Headers

All API responses include the following security headers:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
Referrer-Policy: strict-origin-when-cross-origin
X-Request-ID: {unique-request-id}
```

## Authentication & Security

### Environment Variables

The following environment variables are required for API functionality:

- `FIGMA_ACCESS_TOKEN` or `FIGMA_PERSONAL_ACCESS_TOKEN`: Figma API access token
- `FIGMA_WEBHOOK_SECRET`: Secret for Figma webhook signature verification
- `NEXT_PUBLIC_FIREBASE_*`: Firebase configuration variables

### Security Validation

All endpoints perform the following security checks:

1. **Input Validation:** Schema-based validation using Zod
2. **Security Sanitization:** XSS and injection attack prevention
3. **Request Logging:** Security events are logged for monitoring
4. **Error Handling:** Secure error responses without sensitive information exposure

## Figma API Endpoints

### GET /api/figma/[fileId]

Retrieves Figma file information by file ID.

**Path:** `/api/figma/{fileId}`

**Method:** `GET`

**Authentication:** Server-side Figma token (no client authentication required)

#### Parameters

| Parameter | Type   | Location | Required | Description                                 |
| --------- | ------ | -------- | -------- | ------------------------------------------- |
| `fileId`  | string | Path     | Yes      | Figma file ID (alphanumeric, max 100 chars) |

#### Request Example

```http
GET /api/figma/abc123def456 HTTP/1.1
Host: your-domain.com
Accept: application/json
```

#### Response Schema

**Success Response (200):**

```typescript
interface FigmaFileResponse {
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
```

**Success Example:**

```json
{
  "name": "Design System Components",
  "lastModified": "2024-01-15T10:30:00Z",
  "version": "1.2.3",
  "document": {
    "id": "0:1",
    "name": "Page 1",
    "type": "CANVAS"
  },
  "metadata": {
    "timestamp": "2024-01-15T10:35:00Z",
    "requestId": "figma_1705312500000_abc123",
    "status": "success"
  }
}
```

#### Error Responses

**Validation Error (400):**

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

**Security Error (400):**

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
  "requestId": "figma_1705312500000_abc123"
}
```

**Server Error (500):**

```json
{
  "error": "Internal server error",
  "code": "INTERNAL_ERROR",
  "timestamp": "2024-01-15T10:35:00Z",
  "requestId": "figma_1705312500000_abc123"
}
```

#### Response Headers

```http
HTTP/1.1 200 OK
Content-Type: application/json
X-Request-ID: figma_1705312500000_abc123
Cache-Control: private, max-age=300
X-Rate-Limit-Remaining: 99
X-Rate-Limit-Reset: 1705312800
X-Rate-Limit-Limit: 100
Access-Control-Allow-Origin: https://your-domain.com
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
```

#### Validation Rules

- `fileId` must match pattern: `/^[A-Za-z0-9_-]+$/`
- `fileId` length must be between 1 and 100 characters
- Input undergoes XSS and injection attack validation
- All output is sanitized before response

#### Supported HTTP Methods

- `GET`: Retrieve file information
- `OPTIONS`: CORS preflight (automatic)
- `POST`, `PUT`, `DELETE`, `PATCH`: Not allowed (405 Method Not Allowed)

### GET /api/figma-mcp

Figma MCP (Model Context Protocol) endpoint for retrieving specific node information.

**Path:** `/api/figma-mcp`

**Method:** `GET`

**Authentication:** Server-side Figma token (no client authentication required)

#### Query Parameters

| Parameter | Type   | Required | Description                                             |
| --------- | ------ | -------- | ------------------------------------------------------- |
| `fileId`  | string | Yes      | Figma file ID (alphanumeric, max 100 chars)             |
| `nodeId`  | string | Yes      | Figma node ID (alphanumeric with colons, max 100 chars) |

#### Request Example

```http
GET /api/figma-mcp?fileId=abc123def456&nodeId=1:2 HTTP/1.1
Host: your-domain.com
Accept: application/json
```

#### Response Schema

**Success Response (200):**

The response structure depends on the Figma API response for the specific node. All string values are sanitized for XSS protection.

```typescript
interface FigmaMcpResponse {
  // Dynamic structure based on Figma API response
  // All string values are XSS-filtered
  [key: string]: unknown;
}
```

#### Error Responses

**Missing Parameters (400):**

```json
{
  "error": "Missing fileId or nodeId parameters"
}
```

**Configuration Error (500):**

```json
{
  "error": "Figma access token not configured. Please set FIGMA_ACCESS_TOKEN or FIGMA_PERSONAL_ACCESS_TOKEN environment variable.",
  "debug": {
    "figmaAccessToken": "not set",
    "figmaPersonalToken": "not set"
  }
}
```

#### Validation Rules

- `fileId` must match pattern: `/^[A-Za-z0-9_-]+$/`
- `nodeId` must match pattern: `/^[A-Za-z0-9:_-]+$/`
- Both parameters have maximum length of 100 characters
- Input undergoes comprehensive security validation
- Response data is recursively sanitized for XSS protection

### POST /api/figma-mcp

Figma webhook endpoint for receiving Figma events.

**Path:** `/api/figma-mcp`

**Method:** `POST`

**Authentication:** Webhook signature verification using `FIGMA_WEBHOOK_SECRET`

#### Headers

| Header              | Required | Description                           |
| ------------------- | -------- | ------------------------------------- |
| `X-Figma-Signature` | Yes      | HMAC-SHA256 signature of request body |
| `Content-Type`      | Yes      | `application/json`                    |

#### Request Body

The request body structure depends on the Figma webhook event type:

```typescript
interface FigmaWebhookEvent {
  event_type: string;
  // Additional fields depend on event type
  [key: string]: unknown;
}
```

#### Request Example

```http
POST /api/figma-mcp HTTP/1.1
Host: your-domain.com
Content-Type: application/json
X-Figma-Signature: sha256=abc123...

{
  "event_type": "FILE_UPDATE",
  "file_key": "abc123def456",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Response Schema

**Success Response (200):**

```json
{
  "message": "ファイル更新イベントを受信しました"
}
```

**Default Response (200):**

```json
{
  "message": "Figma MCPサーバーが動作しています。"
}
```

#### Error Responses

**Invalid Signature (401):**

```json
{
  "error": "Invalid signature"
}
```

**Configuration Error (500):**

```json
{
  "error": "Figma webhook secret not configured. Please set FIGMA_WEBHOOK_SECRET environment variable."
}
```

#### Signature Verification

The webhook signature is verified using HMAC-SHA256:

```typescript
function verifySignature(req: NextApiRequest, secret: string): boolean {
  const signature = req.headers["x-figma-signature"];
  if (!signature || !secret) return false;

  const hmac = crypto.createHmac("sha256", secret);
  const body =
    typeof req.body === "string" ? req.body : JSON.stringify(req.body);
  hmac.update(body);
  const digest = hmac.digest("hex");

  return signature === digest;
}
```

## Error Handling

### Standard Error Response Format

All API endpoints use a consistent error response format:

```typescript
interface ErrorResponse {
  error: string; // Human-readable error message
  code?: string; // Machine-readable error code
  details?: unknown; // Additional error details (validation errors, etc.)
  timestamp: string; // ISO 8601 timestamp
  requestId?: string; // Unique request identifier for tracking
}
```

### Error Codes

| Code                 | HTTP Status | Description                                |
| -------------------- | ----------- | ------------------------------------------ |
| `VALIDATION_ERROR`   | 400         | Input validation failed                    |
| `SECURITY_ERROR`     | 400         | Security validation failed                 |
| `METHOD_NOT_ALLOWED` | 405         | HTTP method not supported                  |
| `API_ERROR`          | 500         | External API error                         |
| `INTERNAL_ERROR`     | 500         | Internal server error                      |
| `HTTP_*`             | Various     | HTTP status code errors (e.g., `HTTP_404`) |

### Security Event Logging

Security violations are automatically logged with the following information:

```typescript
interface SecurityEvent {
  type: "XSS_ATTEMPT" | "SQL_INJECTION" | "CSRF_ATTACK" | "RATE_LIMIT_EXCEEDED";
  ip?: string; // Client IP address
  userAgent?: string; // Client user agent
  input?: string; // Suspicious input (sanitized for logging)
  timestamp?: Date; // Event timestamp
}
```

## Rate Limiting

### Default Limits

- **Figma API endpoints:** 100 requests per hour per IP
- **Rate limit headers:** Included in all responses when available

### Rate Limit Headers

```http
X-Rate-Limit-Remaining: 99
X-Rate-Limit-Reset: 1705312800
X-Rate-Limit-Limit: 100
```

### Rate Limit Exceeded Response

```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "timestamp": "2024-01-15T10:35:00Z",
  "requestId": "req_1705312500000_abc123"
}
```

## Request/Response Formats

### Content Types

- **Request:** `application/json`
- **Response:** `application/json`

### Character Encoding

- **UTF-8** encoding for all text content

### Request ID Tracking

All requests receive a unique request ID for tracking:

- **Format:** `{prefix}_{timestamp}_{random}`
- **Header:** `X-Request-ID`
- **Usage:** Include in error reports and support requests

### Caching

- **Figma file data:** 5 minutes private cache
- **Cache headers:** `Cache-Control: private, max-age=300`

### CORS Configuration

- **Allowed Origins:** Configured based on request origin
- **Allowed Methods:** `GET, OPTIONS`
- **Allowed Headers:** `Content-Type, Authorization, X-Requested-With`
- **Credentials:** Supported for authenticated requests

## Development and Testing

### Environment Setup

1. Set required environment variables:

   ```bash
   FIGMA_ACCESS_TOKEN=your_figma_token
   FIGMA_WEBHOOK_SECRET=your_webhook_secret
   ```

2. Test endpoints using curl:
   ```bash
   curl -X GET "http://localhost:3000/api/figma/your_file_id" \
        -H "Accept: application/json"
   ```

### Security Testing

All endpoints should be tested for:

1. **Input validation:** Invalid parameters and formats
2. **XSS protection:** Script injection attempts
3. **SQL injection:** Database query manipulation attempts
4. **Rate limiting:** Excessive request patterns
5. **Authentication:** Unauthorized access attempts

### Monitoring

Monitor the following metrics:

- **Request volume:** Requests per endpoint per time period
- **Error rates:** 4xx and 5xx response percentages
- **Response times:** Average and 95th percentile latencies
- **Security events:** XSS attempts, injection attempts, rate limit violations
