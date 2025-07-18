# API Usage Examples and Code Snippets

## Overview

This document provides comprehensive usage examples and code snippets for the AI Development Template API. All examples include error handling, security considerations, and best practices for production use.

## Table of Contents

1. [JavaScript/TypeScript Examples](#javascripttypescript-examples)
2. [React Hook Examples](#react-hook-examples)
3. [Node.js Server Examples](#nodejs-server-examples)
4. [cURL Examples](#curl-examples)
5. [Error Handling Patterns](#error-handling-patterns)
6. [Security Best Practices](#security-best-practices)
7. [Rate Limiting Handling](#rate-limiting-handling)

## JavaScript/TypeScript Examples

### Basic Figma File Retrieval

```typescript
// Basic example with error handling
async function getFigmaFile(fileId: string): Promise<FigmaFileResponse | null> {
  try {
    const response = await fetch(`/api/figma/${fileId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error:", errorData);
      throw new Error(`HTTP ${response.status}: ${errorData.error}`);
    }

    const data: FigmaFileResponse = await response.json();
    console.log("Request ID:", response.headers.get("X-Request-ID"));

    return data;
  } catch (error) {
    console.error("Failed to fetch Figma file:", error);
    return null;
  }
}

// Usage
const fileData = await getFigmaFile("abc123def456");
if (fileData) {
  console.log("File name:", fileData.name);
  console.log("Last modified:", fileData.lastModified);
}
```

### Advanced Figma File Retrieval with Rate Limiting

```typescript
interface RateLimitInfo {
  remaining: number;
  reset: number;
  limit: number;
}

interface FigmaApiResponse {
  data: FigmaFileResponse;
  rateLimit: RateLimitInfo;
  requestId: string;
}

async function getFigmaFileWithRateLimit(
  fileId: string
): Promise<FigmaApiResponse | null> {
  try {
    const response = await fetch(`/api/figma/${fileId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    // Extract rate limit information
    const rateLimit: RateLimitInfo = {
      remaining: parseInt(
        response.headers.get("X-Rate-Limit-Remaining") || "0"
      ),
      reset: parseInt(response.headers.get("X-Rate-Limit-Reset") || "0"),
      limit: parseInt(response.headers.get("X-Rate-Limit-Limit") || "100"),
    };

    const requestId = response.headers.get("X-Request-ID") || "unknown";

    if (!response.ok) {
      const errorData = await response.json();

      // Handle rate limiting specifically
      if (response.status === 429) {
        const resetTime = new Date(rateLimit.reset * 1000);
        console.warn(
          `Rate limit exceeded. Resets at: ${resetTime.toISOString()}`
        );
        throw new Error(
          `Rate limit exceeded. Try again after ${resetTime.toISOString()}`
        );
      }

      throw new Error(`HTTP ${response.status}: ${errorData.error}`);
    }

    const data: FigmaFileResponse = await response.json();

    // Log rate limit status
    console.log(
      `Rate limit: ${rateLimit.remaining}/${rateLimit.limit} remaining`
    );

    return {
      data,
      rateLimit,
      requestId,
    };
  } catch (error) {
    console.error("Failed to fetch Figma file:", error);
    return null;
  }
}

// Usage with rate limit monitoring
const result = await getFigmaFileWithRateLimit("abc123def456");
if (result) {
  console.log("File data:", result.data);
  console.log("Rate limit info:", result.rateLimit);

  // Check if we're approaching the rate limit
  if (result.rateLimit.remaining < 10) {
    console.warn(
      "Approaching rate limit! Consider implementing backoff strategy."
    );
  }
}
```

### Figma Node Retrieval (MCP)

```typescript
interface FigmaMcpParams {
  fileId: string;
  nodeId: string;
}

async function getFigmaNode({ fileId, nodeId }: FigmaMcpParams): Promise<any> {
  try {
    const params = new URLSearchParams({
      fileId,
      nodeId,
    });

    const response = await fetch(`/api/figma-mcp?${params}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();

      // Handle specific error cases
      if (response.status === 400 && errorData.error?.includes("Missing")) {
        throw new Error("Both fileId and nodeId parameters are required");
      }

      if (response.status === 500 && errorData.error?.includes("token")) {
        throw new Error("Figma API token not configured on server");
      }

      throw new Error(`HTTP ${response.status}: ${errorData.error}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch Figma node:", error);
    throw error;
  }
}

// Usage
try {
  const nodeData = await getFigmaNode({
    fileId: "abc123def456",
    nodeId: "1:2",
  });

  console.log("Node data:", nodeData);
} catch (error) {
  console.error("Error:", error.message);
}
```

## React Hook Examples

### Custom Hook for Figma API

```typescript
import { useState, useCallback, useRef } from "react";

interface UseFigmaFileResult {
  data: FigmaFileResponse | null;
  loading: boolean;
  error: string | null;
  rateLimit: RateLimitInfo | null;
  fetchFile: (fileId: string) => Promise<void>;
  clearError: () => void;
}

export function useFigmaFile(): UseFigmaFileResult {
  const [data, setData] = useState<FigmaFileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(null);

  // Prevent multiple simultaneous requests
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchFile = useCallback(async (fileId: string) => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/figma/${fileId}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        signal: abortControllerRef.current.signal,
      });

      // Extract rate limit info
      const rateLimitInfo: RateLimitInfo = {
        remaining: parseInt(
          response.headers.get("X-Rate-Limit-Remaining") || "0"
        ),
        reset: parseInt(response.headers.get("X-Rate-Limit-Reset") || "0"),
        limit: parseInt(response.headers.get("X-Rate-Limit-Limit") || "100"),
      };
      setRateLimit(rateLimitInfo);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const fileData: FigmaFileResponse = await response.json();
      setData(fileData);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        // Request was cancelled, don't set error
        return;
      }

      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    rateLimit,
    fetchFile,
    clearError,
  };
}
```

### React Component Example

```tsx
import React, { useState } from "react";
import { useFigmaFile } from "./hooks/useFigmaFile";

interface FigmaFileViewerProps {
  initialFileId?: string;
}

export function FigmaFileViewer({ initialFileId }: FigmaFileViewerProps) {
  const [fileId, setFileId] = useState(initialFileId || "");
  const { data, loading, error, rateLimit, fetchFile, clearError } =
    useFigmaFile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fileId.trim()) {
      await fetchFile(fileId.trim());
    }
  };

  const handleRetry = () => {
    if (fileId.trim()) {
      fetchFile(fileId.trim());
    }
  };

  return (
    <div className="figma-file-viewer">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={fileId}
            onChange={(e) => setFileId(e.target.value)}
            placeholder="Enter Figma file ID"
            className="flex-1 px-3 py-2 border rounded"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !fileId.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {loading ? "Loading..." : "Fetch File"}
          </button>
        </div>
      </form>

      {/* Rate limit indicator */}
      {rateLimit && (
        <div className="mb-4 p-2 bg-gray-100 rounded text-sm">
          Rate limit: {rateLimit.remaining}/{rateLimit.limit} requests remaining
          {rateLimit.remaining < 10 && (
            <span className="text-orange-600 ml-2">⚠️ Approaching limit</span>
          )}
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded">
          <div className="flex justify-between items-start">
            <div>
              <strong className="text-red-800">Error:</strong>
              <p className="text-red-700">{error}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRetry}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm"
              >
                Retry
              </button>
              <button
                onClick={clearError}
                className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data display */}
      {data && (
        <div className="bg-green-50 border border-green-200 rounded p-4">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            {data.name}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Version:</strong> {data.version}
            </div>
            <div>
              <strong>Last Modified:</strong>{" "}
              {new Date(data.lastModified).toLocaleString()}
            </div>
            {data.document && (
              <>
                <div>
                  <strong>Document ID:</strong> {data.document.id}
                </div>
                <div>
                  <strong>Document Type:</strong> {data.document.type}
                </div>
              </>
            )}
          </div>
          <div className="mt-2 text-xs text-gray-600">
            Request ID: {data.metadata.requestId}
          </div>
        </div>
      )}
    </div>
  );
}
```

## Node.js Server Examples

### Express.js Middleware for API Calls

```typescript
import express from "express";
import axios from "axios";

interface FigmaApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

class FigmaApiClient {
  private config: FigmaApiConfig;
  private rateLimitInfo: Map<string, RateLimitInfo> = new Map();

  constructor(config: FigmaApiConfig) {
    this.config = config;
  }

  async getFigmaFile(fileId: string): Promise<FigmaFileResponse> {
    const url = `${this.config.baseUrl}/api/figma/${fileId}`;

    try {
      const response = await axios.get(url, {
        timeout: this.config.timeout,
        headers: {
          Accept: "application/json",
          "User-Agent": "Node.js-Client/1.0",
        },
      });

      // Store rate limit info
      const rateLimit: RateLimitInfo = {
        remaining: parseInt(response.headers["x-rate-limit-remaining"] || "0"),
        reset: parseInt(response.headers["x-rate-limit-reset"] || "0"),
        limit: parseInt(response.headers["x-rate-limit-limit"] || "100"),
      };
      this.rateLimitInfo.set("figma-api", rateLimit);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorData = error.response?.data;

        if (status === 429) {
          const resetTime = new Date(
            parseInt(error.response?.headers["x-rate-limit-reset"] || "0") *
              1000
          );
          throw new Error(
            `Rate limit exceeded. Resets at: ${resetTime.toISOString()}`
          );
        }

        throw new Error(
          `API Error ${status}: ${errorData?.error || error.message}`
        );
      }

      throw error;
    }
  }

  getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitInfo.get("figma-api") || null;
  }
}

// Express middleware
export function createFigmaApiMiddleware(config: FigmaApiConfig) {
  const client = new FigmaApiClient(config);

  return {
    // Middleware to add client to request
    attachClient: (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      (req as any).figmaClient = client;
      next();
    },

    // Route handler
    getFigmaFile: async (req: express.Request, res: express.Response) => {
      try {
        const { fileId } = req.params;

        if (!fileId || typeof fileId !== "string") {
          return res.status(400).json({
            error: "File ID is required",
            code: "VALIDATION_ERROR",
            timestamp: new Date().toISOString(),
          });
        }

        const client = (req as any).figmaClient as FigmaApiClient;
        const data = await client.getFigmaFile(fileId);
        const rateLimit = client.getRateLimitInfo();

        // Add rate limit headers
        if (rateLimit) {
          res.set({
            "X-Rate-Limit-Remaining": rateLimit.remaining.toString(),
            "X-Rate-Limit-Reset": rateLimit.reset.toString(),
            "X-Rate-Limit-Limit": rateLimit.limit.toString(),
          });
        }

        res.json(data);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        res.status(500).json({
          error: errorMessage,
          code: "INTERNAL_ERROR",
          timestamp: new Date().toISOString(),
        });
      }
    },
  };
}

// Usage
const app = express();
const figmaApi = createFigmaApiMiddleware({
  baseUrl: "http://localhost:3000",
  timeout: 10000,
  retryAttempts: 3,
});

app.use("/api/figma", figmaApi.attachClient);
app.get("/api/figma/:fileId", figmaApi.getFigmaFile);
```

## cURL Examples

### Basic Figma File Request

```bash
# Basic GET request
curl -X GET "http://localhost:3000/api/figma/abc123def456" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -v

# With custom headers for debugging
curl -X GET "http://localhost:3000/api/figma/abc123def456" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "User-Agent: curl-test/1.0" \
  -w "HTTP Status: %{http_code}\nTotal Time: %{time_total}s\n" \
  -v
```

### Figma MCP Request

```bash
# MCP request with query parameters
curl -X GET "http://localhost:3000/api/figma-mcp?fileId=abc123def456&nodeId=1:2" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -v

# URL-encoded parameters
curl -X GET "http://localhost:3000/api/figma-mcp" \
  -G \
  -d "fileId=abc123def456" \
  -d "nodeId=1:2" \
  -H "Accept: application/json" \
  -v
```

### Webhook Testing

```bash
# Test webhook endpoint (requires valid signature)
curl -X POST "http://localhost:3000/api/figma-mcp" \
  -H "Content-Type: application/json" \
  -H "X-Figma-Signature: sha256=your_signature_here" \
  -d '{
    "event_type": "FILE_UPDATE",
    "file_key": "abc123def456",
    "timestamp": "2024-01-15T10:30:00Z"
  }' \
  -v

# Test invalid method (should return 405)
curl -X PUT "http://localhost:3000/api/figma/abc123def456" \
  -H "Accept: application/json" \
  -v
```

## Error Handling Patterns

### Comprehensive Error Handler

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
  requestId?: string;
}

class ApiErrorHandler {
  static handle(error: unknown, context: string = "API"): ApiError {
    console.error(`[${context}] Error:`, error);

    // Handle fetch errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return {
        code: "NETWORK_ERROR",
        message: "Network connection failed",
        timestamp: new Date().toISOString(),
      };
    }

    // Handle HTTP errors
    if (error instanceof Response) {
      return {
        code: `HTTP_${error.status}`,
        message: error.statusText || "HTTP Error",
        timestamp: new Date().toISOString(),
      };
    }

    // Handle API errors
    if (error && typeof error === "object" && "code" in error) {
      const apiError = error as ApiError;
      return {
        code: apiError.code,
        message: apiError.message,
        details: apiError.details,
        timestamp: apiError.timestamp,
        requestId: apiError.requestId,
      };
    }

    // Handle generic errors
    if (error instanceof Error) {
      return {
        code: "CLIENT_ERROR",
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }

    // Handle unknown errors
    return {
      code: "UNKNOWN_ERROR",
      message: "An unknown error occurred",
      timestamp: new Date().toISOString(),
    };
  }

  static isRetryable(error: ApiError): boolean {
    const retryableCodes = [
      "NETWORK_ERROR",
      "HTTP_408", // Request Timeout
      "HTTP_429", // Too Many Requests
      "HTTP_500", // Internal Server Error
      "HTTP_502", // Bad Gateway
      "HTTP_503", // Service Unavailable
      "HTTP_504", // Gateway Timeout
    ];

    return retryableCodes.includes(error.code);
  }

  static getRetryDelay(attempt: number, error: ApiError): number {
    // Rate limiting - wait until reset time
    if (error.code === "HTTP_429" && error.details) {
      const resetTime = (error.details as any).resetTime;
      if (resetTime) {
        return Math.max(0, new Date(resetTime).getTime() - Date.now());
      }
    }

    // Exponential backoff for other errors
    return Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30 seconds
  }
}

// Usage in async function with retry logic
async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: ApiError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetchFn();
    } catch (error) {
      lastError = ApiErrorHandler.handle(error, `Attempt ${attempt + 1}`);

      // Don't retry on last attempt or non-retryable errors
      if (attempt === maxRetries || !ApiErrorHandler.isRetryable(lastError)) {
        throw lastError;
      }

      // Wait before retrying
      const delay = ApiErrorHandler.getRetryDelay(attempt, lastError);
      console.log(`Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
```

## Security Best Practices

### Input Validation

```typescript
// Client-side input validation
function validateFigmaFileId(fileId: string): {
  valid: boolean;
  error?: string;
} {
  if (!fileId || typeof fileId !== "string") {
    return { valid: false, error: "File ID is required" };
  }

  if (fileId.length > 100) {
    return { valid: false, error: "File ID is too long (max 100 characters)" };
  }

  if (!/^[A-Za-z0-9_-]+$/.test(fileId)) {
    return { valid: false, error: "File ID contains invalid characters" };
  }

  return { valid: true };
}

function validateFigmaNodeId(nodeId: string): {
  valid: boolean;
  error?: string;
} {
  if (!nodeId || typeof nodeId !== "string") {
    return { valid: false, error: "Node ID is required" };
  }

  if (nodeId.length > 100) {
    return { valid: false, error: "Node ID is too long (max 100 characters)" };
  }

  if (!/^[A-Za-z0-9:_-]+$/.test(nodeId)) {
    return { valid: false, error: "Node ID contains invalid characters" };
  }

  return { valid: true };
}

// Secure API call function
async function secureApiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Validate URL
  try {
    new URL(url, window.location.origin);
  } catch {
    throw new Error("Invalid URL");
  }

  // Add security headers
  const secureOptions: RequestInit = {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    },
    // Prevent credentials from being sent to external domains
    credentials: url.startsWith(window.location.origin)
      ? "same-origin"
      : "omit",
  };

  return fetch(url, secureOptions);
}
```

### XSS Prevention

```typescript
// HTML escaping utility
function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Safe data rendering
function renderFigmaData(data: FigmaFileResponse): string {
  return `
    <div class="figma-file">
      <h3>${escapeHtml(data.name)}</h3>
      <p>Version: ${escapeHtml(data.version)}</p>
      <p>Last Modified: ${escapeHtml(data.lastModified)}</p>
      ${
        data.document
          ? `
        <div class="document">
          <p>Document: ${escapeHtml(data.document.name)}</p>
          <p>Type: ${escapeHtml(data.document.type)}</p>
        </div>
      `
          : ""
      }
    </div>
  `;
}
```

## Rate Limiting Handling

### Rate Limit Manager

```typescript
interface RateLimitState {
  remaining: number;
  reset: number;
  limit: number;
  lastUpdate: number;
}

class RateLimitManager {
  private state: RateLimitState | null = null;
  private callbacks: Array<(state: RateLimitState) => void> = [];

  updateFromHeaders(headers: Headers): void {
    const remaining = parseInt(headers.get("X-Rate-Limit-Remaining") || "0");
    const reset = parseInt(headers.get("X-Rate-Limit-Reset") || "0");
    const limit = parseInt(headers.get("X-Rate-Limit-Limit") || "100");

    this.state = {
      remaining,
      reset,
      limit,
      lastUpdate: Date.now(),
    };

    // Notify callbacks
    this.callbacks.forEach((callback) => callback(this.state!));
  }

  getState(): RateLimitState | null {
    return this.state;
  }

  isNearLimit(threshold: number = 10): boolean {
    return this.state ? this.state.remaining <= threshold : false;
  }

  getTimeUntilReset(): number {
    if (!this.state) return 0;
    return Math.max(0, this.state.reset * 1000 - Date.now());
  }

  shouldWait(): boolean {
    return this.state ? this.state.remaining <= 0 : false;
  }

  onStateChange(callback: (state: RateLimitState) => void): () => void {
    this.callbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }
}

// Usage with automatic backoff
class RateLimitedApiClient {
  private rateLimitManager = new RateLimitManager();
  private requestQueue: Array<() => Promise<void>> = [];
  private processing = false;

  constructor() {
    // Monitor rate limit state
    this.rateLimitManager.onStateChange((state) => {
      console.log(`Rate limit: ${state.remaining}/${state.limit} remaining`);

      if (state.remaining <= 5) {
        console.warn("Approaching rate limit!");
      }
    });
  }

  async makeRequest<T>(requestFn: () => Promise<Response>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          // Check if we should wait
          if (this.rateLimitManager.shouldWait()) {
            const waitTime = this.rateLimitManager.getTimeUntilReset();
            console.log(`Rate limited. Waiting ${waitTime}ms...`);
            await new Promise((resolve) => setTimeout(resolve, waitTime));
          }

          const response = await requestFn();

          // Update rate limit info
          this.rateLimitManager.updateFromHeaders(response.headers);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          resolve(data);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.requestQueue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift()!;
      await request();

      // Add small delay between requests to be respectful
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.processing = false;
  }

  async getFigmaFile(fileId: string): Promise<FigmaFileResponse> {
    return this.makeRequest(() =>
      fetch(`/api/figma/${fileId}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
    );
  }
}

// Usage
const client = new RateLimitedApiClient();

// Multiple requests will be queued and processed with rate limiting
const files = await Promise.all([
  client.getFigmaFile("file1"),
  client.getFigmaFile("file2"),
  client.getFigmaFile("file3"),
]);
```

## Production Considerations

### Environment Configuration

```typescript
// Environment-specific configuration
interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  rateLimitThreshold: number;
  enableLogging: boolean;
}

function getApiConfig(): ApiConfig {
  const isDevelopment = process.env.NODE_ENV === "development";

  return {
    baseUrl:
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      (isDevelopment ? "http://localhost:3000" : ""),
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "10000"),
    retryAttempts: parseInt(process.env.NEXT_PUBLIC_API_RETRY_ATTEMPTS || "3"),
    rateLimitThreshold: parseInt(
      process.env.NEXT_PUBLIC_RATE_LIMIT_THRESHOLD || "10"
    ),
    enableLogging: isDevelopment,
  };
}
```

### Monitoring and Analytics

```typescript
// API usage analytics
class ApiAnalytics {
  private metrics: Map<string, number> = new Map();

  recordRequest(endpoint: string, status: number, duration: number): void {
    const key = `${endpoint}_${status}`;
    this.metrics.set(key, (this.metrics.get(key) || 0) + 1);

    // Log slow requests
    if (duration > 5000) {
      console.warn(`Slow API request: ${endpoint} took ${duration}ms`);
    }

    // Log errors
    if (status >= 400) {
      console.error(`API error: ${endpoint} returned ${status}`);
    }
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  reset(): void {
    this.metrics.clear();
  }
}

// Usage in API client
const analytics = new ApiAnalytics();

async function monitoredFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const startTime = Date.now();

  try {
    const response = await fetch(url, options);
    const duration = Date.now() - startTime;

    analytics.recordRequest(url, response.status, duration);

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    analytics.recordRequest(url, 0, duration); // 0 for network errors
    throw error;
  }
}
```

This comprehensive guide provides production-ready examples for integrating with the AI Development Template API, including proper error handling, security measures, and rate limiting strategies.
