"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import { Input } from "@heroui/react";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { Divider } from "@heroui/react";
import { registerWithEmail, loginWithEmail, signInWithGoogle } from "../lib/firebase";

interface AuthFormProps {
  onSuccess?: () => void;
}

export default function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = isLogin 
        ? await loginWithEmail(email, password)
        : await registerWithEmail(email, password);

      if (result.success) {
        onSuccess?.();
      } else {
        setError(result.error || "認証に失敗しました");
      }
    } catch (err) {
      setError("認証に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await signInWithGoogle();
      if (result.success) {
        onSuccess?.();
      } else {
        setError(result.error || "Google認証に失敗しました");
      }
    } catch (err) {
      setError("Google認証に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-col gap-2">
        <h1 className="text-xl font-bold">
          {isLogin ? "ログイン" : "アカウント作成"}
        </h1>
        <p className="text-sm text-gray-600">
          {isLogin ? "アカウントにログインしてください" : "新しいアカウントを作成してください"}
        </p>
      </CardHeader>
      <CardBody className="space-y-4">
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <Input
            type="email"
            label="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <Input
            type="password"
            label="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            minLength={6}
          />
          
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          
          <Button
            type="submit"
            color="primary"
            isLoading={loading}
            className="w-full"
          >
            {isLogin ? "ログイン" : "アカウント作成"}
          </Button>
        </form>

        <Divider />

        <Button
          onClick={handleGoogleAuth}
          variant="bordered"
          isLoading={loading}
          className="w-full"
        >
          Googleでログイン
        </Button>

        <Divider />

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-blue-600 hover:underline"
            disabled={loading}
          >
            {isLogin ? "アカウントを作成" : "既存のアカウントでログイン"}
          </button>
        </div>
      </CardBody>
    </Card>
  );
}
