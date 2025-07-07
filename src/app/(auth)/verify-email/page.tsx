"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { sendEmailVerification, reload } from "firebase/auth";
import Button from "@/components/Button";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!auth) {
      router.push("/register/email");
      return;
    }
    const user = auth.currentUser;
    if (!user) {
      router.push("/register/email");
      return;
    }

    // 既にメール認証済みの場合
    if (user.emailVerified) {
      setIsVerified(true);
      return;
    }

    // 認証状態の変更を監視
    const interval = setInterval(async () => {
      if (auth && auth.currentUser) {
        await reload(auth.currentUser);
        if (auth.currentUser.emailVerified) {
          setIsVerified(true);
          clearInterval(interval);
          // 3秒後にホーム画面に遷移
          setTimeout(() => {
            router.push("/home");
          }, 3000);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [router]);

  const handleResendEmail = async () => {
    if (!auth) return;
    const user = auth.currentUser;
    if (!user) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await sendEmailVerification(user);
      setSuccess("認証メールを再送信しました。");
    } catch (error) {
      console.error("メール再送信エラー:", error);
      setError("メールの再送信に失敗しました。しばらく後でお試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <div className="w-full max-w-[480px] flex flex-col items-center p-[24px]">
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold mb-4">メール認証完了！</h1>
            <p className="text-gray-600 mb-8">
              メールアドレスの認証が完了しました。
              <br />
              まもなくホーム画面に移動します。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-hidden flex flex-col items-center">
      <div className="w-full max-w-[480px] flex flex-col items-center h-screen">
        <div className="flex flex-col w-full items-center flex-1 min-h-0 pb-[120px]">
          <div className="w-full p-[24px] flex flex-col gap-[48px]">
            <div className="text-center">
              <div className="text-6xl mb-4">📧</div>
              <h1 className="text-2xl font-bold mb-4">メール認証</h1>
              <p className="text-gray-600 mb-8">
                登録したメールアドレスに認証メールを送信しました。
                <br />
                メール内のリンクをクリックしてアカウントを有効化してください。
              </p>
              <p className="text-sm text-gray-500 mb-8">
                {auth?.currentUser?.email}
              </p>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="text-green-500 text-sm text-center bg-green-50 p-3 rounded-md">
                {success}
              </div>
            )}

            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">
                メールが届かない場合は、迷惑メールフォルダもご確認ください。
              </p>
              <Button
                variant="secondary"
                onClick={handleResendEmail}
                disabled={isLoading}
              >
                {isLoading ? "送信中..." : "認証メールを再送信"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
