---
description: "HeroUIベースフルスタック機能の完全実装"
allowed-tools: ["FileSystem", "Bash", "figma"]
---

# HeroUIベースフルスタック機能完全開発

$ARGUMENTSの機能を以下のHeroUIベースフルスタック手順で実装します。

## Phase 1: 要件分析・設計
**機能仕様の整理：**
```markdown
# 機能仕様書生成
## 機能名：$ARGUMENTS

### 機能概要
[ユーザーストーリー形式で記述]

### 技術要件
- フロントエンド：Next.js App Router + HeroUI
- バックエンド：Firebase Functions（必要時）
- データベース：Firestore
- 認証：Firebase Auth
- ストレージ：Firebase Storage（必要時）

### UI/UX要件
- レスポンシブ対応：必須
- アクセシビリティ：WCAG 2.1 AA準拠
- パフォーマンス：Core Web Vitals準拠
- デザインシステム：HeroUI準拠
```

## Phase 2: データベース設計
**Firestore設計：**
```typescript
// types/firestore.ts 生成
export interface ${Feature}Document {
  id: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // 機能固有フィールド
}

export interface ${Feature}Collection {
  // コレクション構造
}
```

**セキュリティルール生成：**
```javascript
// firestore.rules 追加分
match /${collection}/{docId} {
  allow read, write: if request.auth != null 
    && request.auth.uid == resource.data.userId;
}
```

## Phase 3: APIルート実装
**Next.js API Routes：**
```typescript
// app/api/${feature}/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  // 実装
}

export async function POST(request: NextRequest) {
  // 実装
}
```

**Firebase Functions（必要時）：**
```typescript
// functions/src/${feature}.ts
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

export const on${Feature}Created = onDocumentCreated(
  '${collection}/{docId}',
  async (event) => {
    // 処理実装
  }
);
```

## Phase 4: React Hook実装
**カスタムフック生成：**
```typescript
// hooks/use${Feature}.ts
import { useState, useEffect } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

export function use${Feature}() {
  const [user] = useAuthState(auth);
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // CRUD操作関数
  const create${Feature} = async (data: CreateData) => {};
  const update${Feature} = async (id: string, data: UpdateData) => {};
  const delete${Feature} = async (id: string) => {};

  return {
    data,
    loading,
    error,
    create${Feature},
    update${Feature},
    delete${Feature}
  };
}
```

## Phase 5: HeroUI実装
**Page Component：**
```typescript
// app/${feature}/page.tsx
'use client';

import { use${Feature} } from '@/hooks/use${Feature}';
import { ${Feature}List } from '@/components/${Feature}List';
import { ${Feature}Form } from '@/components/${Feature}Form';
import { Card, CardHeader, CardBody, Spinner } from "@heroui/react";

export default function ${Feature}Page() {
  const { data, loading, error, create${Feature} } = use${Feature}();

  if (loading) return <Spinner size="lg" className="flex justify-center" />;
  if (error) return <ErrorBoundary error={error} />;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">
            ${ARGUMENTS}
          </h1>
        </CardHeader>
        <CardBody className="space-y-6">
          <${Feature}Form onSubmit={create${Feature}} />
          <${Feature}List data={data} />
        </CardBody>
      </Card>
    </div>
  );
}
```

**HeroUIベースComponent実装：**
- docs/AI_IMPLEMENTATION_RULES.md準拠
- HeroUIコンポーネントのみ使用
- TypeScript strict mode
- アクセシビリティ対応

## Phase 6: テスト実装
**Unit Tests：**
```typescript
// __tests__/${feature}.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { use${Feature} } from '@/hooks/use${Feature}';

// カスタムフックテスト
// コンポーネントテスト
// 統合テスト
```

**E2E Tests：**
```typescript
// cypress/e2e/${feature}.cy.ts
describe('${ARGUMENTS} Feature', () => {
  it('should create new ${feature}', () => {
    // E2Eテストシナリオ
  });
});
```

## Phase 7: Storybook統合
```typescript
// stories/${Feature}.stories.tsx
// 全コンポーネントのストーリー生成
// インタラクティブサンプル
// レスポンシブ確認用ストーリー
```

## Phase 8: デプロイ準備
**環境変数確認：**
```bash
# .env.local 必要変数
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
# ... その他Firebase設定
```

**ビルドテスト：**
```bash
npm run build
npm run start
```

## 完了チェックリスト
- [ ] 機能仕様書作成完了
- [ ] データベース設計完了
- [ ] APIルート実装完了
- [ ] フロントエンド実装完了
- [ ] テスト実装完了
- [ ] Storybook統合完了
- [ ] セキュリティ確認完了
- [ ] パフォーマンステスト完了
- [ ] アクセシビリティテスト完了
- [ ] デプロイテスト完了

## 実装完了報告
以下を含む完了報告を作成：
1. 実装した機能の概要
2. 作成されたファイル一覧
3. 新しく追加されたAPI仕様
4. テストカバレッジ
5. 既知の制限事項
6. 今後の改善提案
