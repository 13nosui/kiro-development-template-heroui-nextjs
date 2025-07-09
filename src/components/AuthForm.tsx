"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import { Input } from "@heroui/react";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { Divider } from "@heroui/react";
import { registerWithEmail, loginWithEmail, signInWithGoogle } from "../lib/firebase";
import { validators, ValidationError } from "../lib/validation";
import { security } from "../lib/security";

interface AuthFormProps {
  onSuccess?: () => void;
}

export default function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
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
      setLoading(false);
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
      setLoading(false);
      return;
    }

    const sanitizedEmail = emailCheck.sanitized!;
    const sanitizedPassword = passwordCheck.sanitized!;

    try {
      const result = isLogin 
        ? await loginWithEmail(sanitizedEmail, sanitizedPassword)
        : await registerWithEmail(sanitizedEmail, sanitizedPassword);

      if (result.success) {
        onSuccess?.();
      } else {
        setError(result.error || "認証に失敗しました");
      }
    } catch {
      setError("認証に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError("");
    setValidationErrors([]);

    try {
      const result = await signInWithGoogle();
      if (result.success) {
        onSuccess?.();
      } else {
        setError(result.error || "Google認証に失敗しました");
      }
    } catch {
      setError("Google認証に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // バリデーションエラーの表示用ヘルパー
  const getFieldError = (fieldName: string): string | undefined => {
    const error = validationErrors.find(err => err.field === fieldName);
    return error?.message;
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
            onChange={(e) => setEmail(security.xss.filterXSS(e.target.value))}
            required
            disabled={loading}
            isInvalid={!!getFieldError('email')}
            errorMessage={getFieldError('email')}
          />
          <Input
            type="password"
            label="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            minLength={8}
            isInvalid={!!getFieldError('password')}
            errorMessage={getFieldError('password')}
          />
          
          {!isLogin && (
            <Input
              type="password"
              label="パスワード確認"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              minLength={8}
              isInvalid={!!getFieldError('confirmPassword')}
              errorMessage={getFieldError('confirmPassword')}
            />
          )}
          
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
