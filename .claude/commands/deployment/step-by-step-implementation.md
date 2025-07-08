---
description: "HeroUIベース段階的実装ガイド - Check running対策"
allowed-tools: ["FileSystem", "Bash"]
---

# HeroUIベース段階的実装ガイド

$ARGUMENTS をHeroUIベースで段階的に実装し、Check running で止まらないようにします。

## Step 1: タスク分析（必須）

```bash
echo "🔍 Task Analysis: $ARGUMENTS"
echo "1. 要件を3-5個のステップに分解"
echo "2. 各ステップの依存関係を確認"
echo "3. 最初のステップを特定"
echo ""
echo "分解されたステップ:"
echo "□ Step 1: [最初の小さなステップ]"
echo "□ Step 2: [2番目のステップ]"
echo "□ Step 3: [3番目のステップ]"
echo ""
echo "続行しますか？ (y/N)"
```

## Step 2: 最小実装

**第 1 段階**: 最小限の動作する実装

- UI 要素の基本構造のみ
- スタイリングは最小限
- ロジックは簡素化

**確認項目:**

- [ ] TypeScript エラーなし
- [ ] 基本的な表示確認
- [ ] コンソールエラーなし

```bash
# 第1段階完了確認
npm run type-check
npm run dev
echo "基本表示が確認できたら次のステップに進みます"
```

## Step 3: 段階的機能追加

**各機能を個別に追加:**

1. 1 つの機能を追加
2. 動作確認
3. 問題なければ次の機能へ

**追加順序（推奨）:**

1. 基本 UI
2. スタイリング
3. バリデーション
4. API 連携
5. エラーハンドリング
6. テスト

## Step 4: 品質確認

**各ステップ後に実行:**

```bash
# 基本チェック
npm run lint:fix
npm run type-check

# ビルド確認
npm run build

# テスト実行（既存のテストが影響を受けていないか）
npm run test
```

## 実装例: HeroUIベースログイン機能

### Step 1: 基本フォーム

```tsx
// HeroUIコンポーネントを使用した最小限の構造
import { Input, Button, Card, CardBody } from "@heroui/react";

export function LoginForm() {
  return (
    <Card className="max-w-md mx-auto">
      <CardBody className="space-y-4">
        <Input type="email" label="Email" />
        <Input type="password" label="Password" />
        <Button color="primary" fullWidth>
          Login
        </Button>
      </CardBody>
    </Card>
  );
}
```

### Step 2: バリデーション追加

```tsx
// HeroUI + React Hook Form連携
import { Input, Button, Card, CardBody } from "@heroui/react";
import { useForm } from "react-hook-form";

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log(data); // まずはログ出力のみ
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardBody className="space-y-4">
        <Input
          type="email"
          label="Email"
          isInvalid={!!errors.email}
          errorMessage={errors.email?.message}
          {...register("email", { required: "Email is required" })}
        />
        <Input
          type="password"
          label="Password"
          isInvalid={!!errors.password}
          errorMessage={errors.password?.message}
          {...register("password", { required: "Password is required" })}
        />
        <Button color="primary" fullWidth onPress={handleSubmit(onSubmit)}>
          Login
        </Button>
      </CardBody>
    </Card>
  );
}
```

### Step 3: Firebase Auth連携

```tsx
// Firebase Auth + HeroUI連携
import { Button } from "@heroui/react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

const onSubmit = async (data) => {
  try {
    await signInWithEmailAndPassword(auth, data.email, data.password);
  } catch (error) {
    console.error(error); // エラーハンドリングは次ステップ
  }
};
```

### Step 4: UX改善

```tsx
// ローディング状態 + エラー表示
import { Button, Alert } from "@heroui/react";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardBody className="space-y-4">
        {error && (
          <Alert color="danger" title="Error">
            {error}
          </Alert>
        )}
        {/* ... inputs ... */}
        <Button 
          color="primary" 
          fullWidth 
          isLoading={isLoading}
          onPress={handleSubmit(onSubmit)}
        >
          Login
        </Button>
      </CardBody>
    </Card>
  );
}
```

## トラブルシューティング

### Check running で止まった場合

1. **即座に中断**: Ctrl + C
2. **小さなタスクに再分割**: より細かいステップに分ける
3. **状態を確認**: `git status` で変更を確認
4. **段階的リセット**: 問題のある変更を一時的に戻す

### 推奨する分割サイズ

- **ファイル変更**: 1-3 ファイルまで
- **行数変更**: 1 ファイルあたり 50 行以下
- **実装時間**: 1 ステップあたり 10-15 分以内

## 成功パターン

```
User: "ユーザープロフィール編集機能を実装してください"
Claude: "この機能を以下の4ステップに分けて実装します：
1. プロフィール表示コンポーネントの作成（編集機能なし）
2. 編集フォームの基本UI追加
3. バリデーションとデータ更新機能
4. エラーハンドリングとUX改善

まず第1ステップから始めますか？"
```
