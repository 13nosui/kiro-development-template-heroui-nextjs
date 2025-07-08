# セキュリティガイドライン

このドキュメントでは、本プロジェクトに実装されているセキュリティ対策と推奨事項について説明します。

## 🔒 実装済みセキュリティ対策

### 1. 認証・認可システム

#### Firebase Authentication強化
- **メール認証必須**: 新規ユーザーはメール認証が必要
- **パスワード強度チェック**: 8文字以上、大文字・小文字・数字・特殊文字を含む
- **入力値サニタイゼーション**: XSS攻撃を防ぐための入力値処理
- **セキュアなエラーハンドリング**: 詳細なエラー情報の漏洩を防止

```typescript
// 使用例
import { registerWithEmail, loginWithEmail } from '@/lib/firebase';

const result = await registerWithEmail(email, password);
if (result.success) {
  // 成功処理
} else {
  // エラーハンドリング
  console.error(result.error);
}
```

### 2. Firebase Security Rules

#### Firestore Rules
- **認証済みユーザーのみアクセス**: すべての読み取り操作で認証が必要
- **メール認証チェック**: 書き込み操作にはメール認証が必須
- **データバリデーション**: 
  - 文字列長制限（タイトル: 100文字、コンテンツ: 5000文字）
  - ファイルサイズ制限（1MB以下）
  - XSS攻撃防止のための文字列チェック
- **所有者チェック**: ユーザーは自分のデータのみ操作可能

#### Storage Rules
- **ユーザー別フォルダ制限**: `/users/{userId}/` 以下は所有者のみアクセス
- **ファイル形式制限**: 画像ファイル（JPEG、PNG、WebP）のみ許可
- **ファイルサイズ制限**: 10MB以下
- **パブリックフォルダ**: 読み取りのみ許可、書き込みは管理者限定

### 3. API セキュリティ

#### レート制限
- **Figma API**: 1分間に30リクエスト
- **認証API**: 1分間に5リクエスト
- **一般API**: 1分間に60リクエスト
- **IP別制限**: クライアントIPアドレス単位で制限

#### 入力値検証
```typescript
import { sanitizeInput, validateEmail } from '@/lib/security';

// 入力値のサニタイゼーション
const cleanInput = sanitizeInput(userInput);

// メールアドレス検証
if (!validateEmail(email)) {
  return { error: 'Invalid email format' };
}
```

### 4. Next.js セキュリティ設定

#### セキュリティヘッダー
- **Content Security Policy (CSP)**: XSS攻撃防止
- **X-Frame-Options**: クリックジャッキング防止
- **X-Content-Type-Options**: MIME スニッフィング防止
- **Strict-Transport-Security (HSTS)**: HTTPS強制
- **Referrer-Policy**: リファラー情報の制御

#### ミドルウェア保護
- **認証チェック**: 保護されたルートへのアクセス制御
- **CSRF Protection**: Cross-Site Request Forgery 攻撃防止
- **セキュリティログ**: アクセスログの記録

### 5. 環境変数とシークレット管理

#### 環境変数テンプレート
```bash
# .env.local の例
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIGMA_ACCESS_TOKEN=your_figma_token
ENCRYPTION_KEY=your_32_character_encryption_key
```

## 🛡️ セキュリティベストプラクティス

### 開発者向け

1. **環境変数の管理**
   - `.env.local` ファイルをGitにコミットしない
   - 本番環境では環境変数を適切に設定する
   - APIキーは定期的にローテーションする

2. **コード品質**
   - 型安全性を保つ（TypeScript使用）
   - ESLintルールに従う
   - セキュリティテストを実施する

3. **依存関係の管理**
   ```bash
   # 脆弱性チェック
   npm audit
   
   # 依存関係の更新
   npm update
   ```

### デプロイ時

1. **HTTPS の強制**
   - すべての通信をHTTPS経由で行う
   - HTTP から HTTPS へのリダイレクト設定

2. **セキュリティヘッダーの設定**
   - CDN レベルでのセキュリティヘッダー追加
   - CSP の厳格化

3. **監視とログ**
   - セキュリティイベントの監視
   - 異常なアクセスパターンの検出
   - ログの定期的な監査

## 🚨 セキュリティインシデント対応

### 検出したセキュリティ問題の報告

1. **内部チーム**: 開発チームに即座に報告
2. **外部報告**: セキュリティ研究者向けの連絡先設定
3. **対応手順**: インシデント対応プランの策定

### 定期的な対策

1. **月次**: 依存関係の脆弱性スキャン
2. **四半期**: セキュリティ設定の見直し
3. **年次**: セキュリティ監査の実施

## 📋 セキュリティチェックリスト

### 新機能開発時

- [ ] 入力値バリデーション実装
- [ ] 認証・認可チェック追加
- [ ] レート制限の設定
- [ ] エラーハンドリングの実装
- [ ] セキュリティテストの実施

### デプロイ前

- [ ] 環境変数の確認
- [ ] セキュリティヘッダーの設定
- [ ] Firebase Rules の更新
- [ ] 脆弱性スキャンの実行
- [ ] HTTPS 設定の確認

## 🔧 設定ファイル

### 主要なセキュリティ設定ファイル

- `next.config.js`: セキュリティヘッダー設定
- `firestore.rules`: Firestoreセキュリティルール
- `storage.rules`: Firebase Storageセキュリティルール  
- `src/middleware.ts`: Next.jsミドルウェア
- `src/lib/security.ts`: セキュリティユーティリティ関数

## 📚 参考資料

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Headers](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## 📞 連絡先

セキュリティに関する質問や報告は、開発チームまでお問い合わせください。

---

**注意**: このドキュメントは定期的に更新されます。最新版を確認してください。
