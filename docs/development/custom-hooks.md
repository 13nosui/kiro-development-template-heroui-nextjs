# カスタム React フック

## 概要

このプロジェクトでは、再利用可能なロジックを提供するカスタム React フックを実装しています。これらのフックは、状態管理、API 通信、認証などの共通機能を抽象化し、コンポーネント間での一貫した実装を可能にします。

## フック一覧

### 1. useFigmaAPI

Figma API との通信を管理するカスタムフック。キャッシュ機能、エラーハンドリング、レート制限管理を含む包括的な API クライアント機能を提供します。

#### 基本的な使用法

```typescript
import { useFigmaAPI } from "../hooks/useFigmaAPI";

function FigmaComponent() {
  const {
    data,
    loading,
    error,
    rateLimitInfo,
    fetchFigmaFile,
    clearError,
    clearData,
    retry,
  } = useFigmaAPI();

  const handleFetch = async () => {
    await fetchFigmaFile("your-figma-file-id");
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data && <div>{data.name}</div>}
      <button onClick={handleFetch}>Fetch Figma File</button>
    </div>
  );
}
```

#### 型定義

```typescript
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

interface FetchOptions {
  useCache?: boolean;
  timeout?: number;
  skipValidation?: boolean;
}
```

#### 主な機能

##### キャッシュ機能

```typescript
// キャッシュを使用してデータを取得（デフォルト）
await fetchFigmaFile("file-id");

// キャッシュを無効にして最新データを取得
await fetchFigmaFile("file-id", { useCache: false });
```

##### エラーハンドリング

```typescript
const { error, clearError, retry } = useFigmaAPI();

// エラー情報の表示
if (error) {
  console.log(`Error Code: ${error.code}`);
  console.log(`Message: ${error.message}`);
  console.log(`Timestamp: ${error.timestamp}`);
}

// エラーのクリア
const handleClearError = () => {
  clearError();
};

// リトライ機能
const handleRetry = async () => {
  await retry();
};
```

##### レート制限管理

```typescript
const { rateLimitInfo } = useFigmaAPI();

if (rateLimitInfo) {
  console.log(`Remaining requests: ${rateLimitInfo.remaining}`);
  console.log(`Rate limit reset: ${new Date(rateLimitInfo.reset * 1000)}`);
  console.log(`Rate limit: ${rateLimitInfo.limit}`);
}
```

##### カスタムタイムアウト

```typescript
// 30秒のタイムアウトを設定
await fetchFigmaFile("file-id", { timeout: 30000 });
```

#### 内部実装の特徴

- **メモリキャッシュ**: 5 分間のキャッシュで API 呼び出しを最適化
- **自動クリーンアップ**: 期限切れキャッシュの定期削除
- **入力値検証**: Figma ファイル ID の形式チェック
- **リトライ機能**: 最後のリクエストを再実行
- **レート制限対応**: API 制限情報の追跡と表示

#### 使用例

##### 基本的なファイル取得

```typescript
function BasicFigmaViewer() {
  const { data, loading, error, fetchFigmaFile } = useFigmaAPI();

  useEffect(() => {
    fetchFigmaFile("abc123def456ghi789jkl012");
  }, [fetchFigmaFile]);

  return (
    <div>
      {loading && <p>Loading Figma file...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && (
        <div>
          <h2>{data.name}</h2>
          <p>Last modified: {data.lastModified}</p>
          <p>Version: {data.version}</p>
        </div>
      )}
    </div>
  );
}
```

##### エラーハンドリングとリトライ

```typescript
function RobustFigmaViewer() {
  const { data, loading, error, fetchFigmaFile, clearError, retry } =
    useFigmaAPI();

  const handleFetch = async (fileId: string) => {
    try {
      await fetchFigmaFile(fileId);
    } catch (err) {
      console.error("Failed to fetch Figma file:", err);
    }
  };

  return (
    <div>
      {error && (
        <div className="error-panel">
          <p>Error: {error.message}</p>
          <button onClick={retry}>Retry</button>
          <button onClick={clearError}>Clear Error</button>
        </div>
      )}

      {data && (
        <div className="figma-data">
          <h2>{data.name}</h2>
          {data.document && (
            <div>
              <h3>Document Info</h3>
              <p>ID: {data.document.id}</p>
              <p>Name: {data.document.name}</p>
              <p>Type: {data.document.type}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### 2. useAuth

Firebase Authentication を使用した認証状態管理フック。ユーザーの認証状態、ローディング状態、エラー処理を統合的に管理します。

#### 基本的な使用法

```typescript
import { useAuth } from "../lib/auth-context";

function AuthenticatedComponent() {
  const { user, loading, error, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.email}!</p>
          <button onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <div>Please sign in</div>
      )}
    </div>
  );
}
```

#### 型定義

```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
}
```

#### 主な機能

##### 認証状態の監視

```typescript
const { user, loading } = useAuth();

// ユーザーがログインしているかチェック
if (user) {
  console.log("User is authenticated:", user.email);
  console.log("User ID:", user.uid);
} else {
  console.log("User is not authenticated");
}
```

##### ログアウト機能

```typescript
const { signOut } = useAuth();

const handleSignOut = async () => {
  try {
    await signOut();
    console.log("Successfully signed out");
  } catch (error) {
    console.error("Sign out failed:", error);
  }
};
```

##### エラーハンドリング

```typescript
const { error } = useAuth();

if (error) {
  console.error("Authentication error:", error);
}
```

#### 使用例

##### 認証ガード

```typescript
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please sign in to access this page</div>;
  }

  return <>{children}</>;
}
```

##### ユーザー情報表示

```typescript
function UserProfile() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <div className="user-profile">
      <div className="user-info">
        <h3>User Profile</h3>
        <p>Email: {user.email}</p>
        <p>UID: {user.uid}</p>
        <p>Email Verified: {user.emailVerified ? "Yes" : "No"}</p>
        {user.displayName && <p>Name: {user.displayName}</p>}
        {user.photoURL && (
          <img src={user.photoURL} alt="Profile" className="profile-image" />
        )}
      </div>

      <div className="user-actions">
        <button onClick={signOut} className="sign-out-btn">
          Sign Out
        </button>
      </div>
    </div>
  );
}
```

## フック開発ガイドライン

### 1. 命名規則

- フック名は `use` で始める
- キャメルケースを使用
- 機能を明確に表す名前を付ける

```typescript
// ✅ 良い例
export const useFigmaAPI = () => { ... };
export const useAuth = () => { ... };
export const useLocalStorage = () => { ... };

// ❌ 悪い例
export const figmaHook = () => { ... };
export const authManager = () => { ... };
```

### 2. 型定義

- フックの戻り値は明確な型を定義
- 引数の型も適切に定義
- ジェネリクスを活用して再利用性を高める

```typescript
// ✅ 良い例
interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
}

export const useApi = <T>(): UseApiResult<T> => {
  // 実装
};

// ❌ 悪い例
export const useApi = (): any => {
  // 実装
};
```

### 3. エラーハンドリング

- 適切なエラー情報を提供
- エラーの種類を区別
- ユーザーが対処可能な情報を含める

```typescript
// ✅ 良い例
interface ApiError {
  code: string;
  message: string;
  timestamp: string;
  retryable: boolean;
}

// ❌ 悪い例
const error: string = "Something went wrong";
```

### 4. パフォーマンス最適化

- `useCallback` と `useMemo` を適切に使用
- 不要な再レンダリングを防ぐ
- 重い処理は適切にメモ化

```typescript
// ✅ 良い例
export const useExpensiveCalculation = (data: Data[]) => {
  const result = useMemo(() => {
    return expensiveCalculation(data);
  }, [data]);

  const memoizedCallback = useCallback(
    (id: string) => {
      return data.find((item) => item.id === id);
    },
    [data]
  );

  return { result, findById: memoizedCallback };
};
```

### 5. 副作用の管理

- `useEffect` の依存関係を正確に指定
- クリーンアップ関数を適切に実装
- メモリリークを防ぐ

```typescript
// ✅ 良い例
export const useWebSocket = (url: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [url]);

  return socket;
};
```

## テストパターン

### 1. フックのテスト

```typescript
import { renderHook, act } from "@testing-library/react";
import { useFigmaAPI } from "../hooks/useFigmaAPI";

describe("useFigmaAPI", () => {
  test("初期状態が正しく設定される", () => {
    const { result } = renderHook(() => useFigmaAPI());

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test("fetchFigmaFile が正常に動作する", async () => {
    const { result } = renderHook(() => useFigmaAPI());

    await act(async () => {
      await result.current.fetchFigmaFile("test-file-id");
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeDefined();
  });
});
```

### 2. 認証フックのテスト

```typescript
import { renderHook } from "@testing-library/react";
import { useAuth } from "../lib/auth-context";
import { AuthProvider } from "../lib/auth-context";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe("useAuth", () => {
  test("認証状態が正しく管理される", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
  });
});
```

## ベストプラクティス

### 1. 単一責任の原則

各フックは一つの明確な責任を持つべきです。

```typescript
// ✅ 良い例 - 単一の責任
export const useFigmaAPI = () => {
  // Figma API 通信のみを担当
};

export const useAuth = () => {
  // 認証状態管理のみを担当
};

// ❌ 悪い例 - 複数の責任
export const useAppState = () => {
  // 認証、API通信、UI状態など複数を担当
};
```

### 2. 依存関係の最小化

フックの依存関係は最小限に抑えます。

```typescript
// ✅ 良い例
export const useLocalStorage = (key: string) => {
  // localStorage のみに依存
};

// ❌ 悪い例
export const useComplexState = (
  apiClient: ApiClient,
  auth: Auth,
  config: Config
) => {
  // 多くの外部依存関係
};
```

### 3. 再利用性の考慮

汎用的で再利用可能なフックを作成します。

```typescript
// ✅ 良い例 - 汎用的
export const useApi = <T>(endpoint: string) => {
  // 任意のAPIエンドポイントで使用可能
};

// ❌ 悪い例 - 特定用途に限定
export const useSpecificUserData = () => {
  // 特定のユーザーデータのみ
};
```

### 4. エラー境界の実装

フック内でのエラーを適切に処理し、アプリケーション全体に影響を与えないようにします。

```typescript
export const useSafeApi = <T>(endpoint: string) => {
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // API呼び出し
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      // エラーログの記録
      console.error("API Error:", err);
    }
  }, [endpoint]);

  return { error, fetchData };
};
```

## 今後の拡張計画

### 1. 追加予定のフック

- `useLocalStorage`: ローカルストレージの状態管理
- `useDebounce`: 入力値のデバウンス処理
- `useIntersectionObserver`: 要素の表示状態監視
- `useMediaQuery`: レスポンシブデザイン対応

### 2. 機能強化

- フックのパフォーマンス監視
- エラー報告の自動化
- テストカバレッジの向上
- ドキュメントの自動生成
