# AI Development Template - Documentation

## 📚 Documentation Overview

Welcome to the comprehensive documentation for the AI Development Template. This documentation provides all the information you need to understand, develop, and operate the project.

> **New!** Check out our [Documentation Index](./index.md) for a complete overview of all documentation with cross-references and our new [Search Functionality](./search.md) to quickly find what you need.

## 🚀 クイックスタート

### 新規開発者向け

1. **[プロジェクト概要](./project-overview.md)** - プロジェクトの全体像と目標
2. **[開発者ガイド](./development/developer-guide.md)** - セットアップから開発ワークフローまで
3. **[ビルドシステム](./development/build-system-and-tools.md)** - 開発ツールとビルド設定

### 既存開発者向け

- **[API ドキュメント](./api/README.md)** - API 仕様と使用例
- **[コンポーネントカタログ](./components/component-catalog.md)** - UI コンポーネント一覧
- **[ユーティリティ関数](./development/utility-functions.md)** - 共通ライブラリの使用方法

## 📖 ドキュメント構成

### 🎯 [プロジェクト概要](./project-overview.md)

プロジェクトの戦略的概要、技術スタック、ロードマップ

**主要トピック:**

- エグゼクティブサマリー
- 技術スタック詳細
- アーキテクチャ概要
- プロジェクトロードマップ

---

### 🏗 アーキテクチャ

システム設計とアーキテクチャの詳細

#### 📋 [システム概要](./architecture/system-overview.md)

- システム全体のアーキテクチャ
- 技術スタックの選定理由
- 設計原則とパターン

#### 🔄 [データフロー](./architecture/data-flow.md)

- データの流れと処理
- 状態管理パターン
- API 通信フロー

#### 🧩 [コンポーネントアーキテクチャ](./architecture/component-architecture.md)

- コンポーネント設計原則
- 階層構造と依存関係
- 再利用性の考慮

#### 🔐 [認証フロー](./architecture/authentication-flows.md)

- Firebase Authentication 統合
- セッション管理
- 権限制御システム

#### 🔌 [API 統合フロー](./architecture/api-integration-flows.md)

- 外部 API 統合パターン
- Figma API 連携
- エラーハンドリング戦略

---

### 🛠 開発ガイド

開発に必要な技術情報とガイドライン

#### 👨‍💻 [開発者ガイド](./development/developer-guide.md)

- **オンボーディング**: 環境セットアップから初回起動まで
- **開発ワークフロー**: ブランチ戦略、コードレビュー、デプロイ
- **コーディング規約**: TypeScript、React、CSS のベストプラクティス
- **トラブルシューティング**: よくある問題と解決方法

#### 🔧 [ビルドシステム](./development/build-system-and-tools.md)

- **技術スタック**: Next.js、TypeScript、Tailwind CSS の詳細
- **NPM スクリプト**: 開発、ビルド、品質チェックの全コマンド
- **設定ファイル**: 各種設定の詳細説明
- **開発ツール**: Storybook、ESLint、PostCSS の設定

#### 🧪 [テスト・品質保証](./development/testing-and-quality-assurance.md)

- **テスト戦略**: 静的型チェック、ESLint、Storybook、Semgrep
- **品質保証フレームワーク**: CI/CD、Dependabot、品質ゲート
- **コードレビューチェックリスト**: 機能性、品質、セキュリティ
- **品質メトリクス**: パフォーマンス、セキュリティ指標

#### 🪝 [カスタムフック](./development/custom-hooks.md)

- **useFigmaAPI**: Figma API 通信フック
- **useAuth**: Firebase 認証フック
- **開発ガイドライン**: フック作成のベストプラクティス
- **テストパターン**: フックのテスト方法

#### 🔨 [ユーティリティ関数](./development/utility-functions.md)

- **バリデーション**: Zod による型安全バリデーション
- **暗号化**: AES-256-GCM による機密データ保護
- **セキュリティ**: XSS、CSRF、SQL インジェクション対策
- **API クライアント**: 認証・リトライ機能付き HTTP クライアント

---

### 🔌 API ドキュメント

API 仕様と使用方法

#### 📖 [API 概要](./api/README.md)

- API 設計原則
- 認証・認可システム
- レスポンス形式

#### 📋 [OpenAPI 仕様](./api/openapi.yaml)

- 全エンドポイントの詳細仕様
- リクエスト・レスポンススキーマ
- 認証要件

#### 💡 [使用例](./api/usage-examples.md)

- 実際の API 呼び出し例
- SDK の使用方法
- エラーハンドリング例

#### ❌ [エラーハンドリング](./api/error-handling.md)

- エラーコード一覧
- エラーレスポンス形式
- 復旧手順

#### 🛡 [セキュリティ・レート制限](./api/security-and-rate-limiting.md)

- セキュリティヘッダー
- レート制限ポリシー
- API キー管理

---

### 🧩 コンポーネント

UI コンポーネントの仕様と使用方法

#### 📚 [コンポーネントカタログ](./components/component-catalog.md)

- **基本コンポーネント**: Button、Input、Card など
- **複合コンポーネント**: AuthForm、PomodoroTimer など
- **レイアウトコンポーネント**: Header、Sidebar、Footer
- **使用例とプロパティ**: 各コンポーネントの詳細仕様

---

### 🔐 セキュリティ

セキュリティ実装と運用ガイド

#### 🏛 [セキュリティアーキテクチャ](./security/security-architecture.md)

- **多層防御戦略**: 入力検証、認証、暗号化、監視
- **脅威モデル**: STRIDE による脅威分析
- **セキュリティ制御**: 技術的・管理的・物理的制御
- **コンプライアンス**: GDPR、SOC2 対応

#### 🛡 [セキュリティ実装](./SECURITY_IMPLEMENTATION.md)

- 具体的なセキュリティ実装手順
- セキュリティテストの実行方法
- 脆弱性対応プロセス

#### 🚨 [セキュリティ運用](./SECURITY_OPERATIONS.md)

- インシデント対応手順
- セキュリティ監視体制
- 定期的なセキュリティ評価

---

### 📊 型定義・データモデル

TypeScript 型定義とデータ構造

#### 📋 [型定義カタログ](./types/type-definitions-catalog.md)

- **基本型**: User、Profile、Settings など
- **API 型**: Request、Response、Error など
- **UI 型**: Props、State、Event など
- **ユーティリティ型**: 汎用的な型定義

#### 🗃 [データモデル・スキーマ](./types/data-models-and-schemas.md)

- **Firebase データモデル**: Firestore コレクション構造
- **バリデーションスキーマ**: Zod スキーマ定義
- **API スキーマ**: OpenAPI データモデル
- **型関係図**: データ間の関係性

---

### 🚀 デプロイメント

本番環境への展開と運用

#### 🌐 [環境・デプロイメント](./deployment/environment-and-deployment.md)

- **環境構成**: 開発、ステージング、本番環境
- **デプロイメント戦略**: Vercel、Firebase、CDN
- **環境変数管理**: セキュアな設定管理
- **監視・ログ**: パフォーマンス監視とエラー追跡

---

### 📝 テンプレート・ガイド

開発支援ドキュメント

#### 🤖 [AI 実装ルール](./AI_IMPLEMENTATION_RULES.md)

- AI 機能実装のガイドライン
- ベストプラクティス
- セキュリティ考慮事項

#### 🔄 [リファクタリングガイド](./REFACTORING_GUIDE.md)

- コードリファクタリングの手順
- 品質改善のアプローチ
- 技術的負債の解消

#### 💻 [Claude コマンドガイド](./CLAUDE_CODE_SLASH_COMMANDS_GUIDE.md)

- Claude AI との効率的な開発方法
- コマンド一覧と使用例

#### 🔑 [GitHub Secrets ガイド](./github-secrets-guide.md)

- GitHub Actions での機密情報管理
- セキュアな CI/CD 設定

## 🔍 ドキュメント検索

### カテゴリ別検索

#### 🚀 **はじめに**

- [プロジェクト概要](./project-overview.md) - 全体像の理解
- [開発者ガイド](./development/developer-guide.md) - 開発環境セットアップ
- [ビルドシステム](./development/build-system-and-tools.md) - ツールと設定

#### 🏗 **アーキテクチャ・設計**

- [システム概要](./architecture/system-overview.md)
- [コンポーネントアーキテクチャ](./architecture/component-architecture.md)
- [データフロー](./architecture/data-flow.md)
- [認証フロー](./architecture/authentication-flows.md)
- [API 統合フロー](./architecture/api-integration-flows.md)

#### 💻 **開発・実装**

- [カスタムフック](./development/custom-hooks.md)
- [ユーティリティ関数](./development/utility-functions.md)
- [コンポーネントカタログ](./components/component-catalog.md)
- [型定義カタログ](./types/type-definitions-catalog.md)

#### 🔌 **API・統合**

- [API 概要](./api/README.md)
- [OpenAPI 仕様](./api/openapi.yaml)
- [使用例](./api/usage-examples.md)
- [エラーハンドリング](./api/error-handling.md)

#### 🔐 **セキュリティ**

- [セキュリティアーキテクチャ](./security/security-architecture.md)
- [セキュリティ実装](./SECURITY_IMPLEMENTATION.md)
- [セキュリティ運用](./SECURITY_OPERATIONS.md)

#### 🧪 **テスト・品質**

- [テスト・品質保証](./development/testing-and-quality-assurance.md)
- [リファクタリングガイド](./REFACTORING_GUIDE.md)

#### 🚀 **デプロイ・運用**

- [環境・デプロイメント](./deployment/environment-and-deployment.md)
- [GitHub Secrets ガイド](./github-secrets-guide.md)

### キーワード検索

#### 🔧 **技術スタック**

- **Next.js**: [ビルドシステム](./development/build-system-and-tools.md), [開発者ガイド](./development/developer-guide.md)
- **TypeScript**: [型定義カタログ](./types/type-definitions-catalog.md), [開発者ガイド](./development/developer-guide.md)
- **React**: [コンポーネントカタログ](./components/component-catalog.md), [カスタムフック](./development/custom-hooks.md)
- **Firebase**: [認証フロー](./architecture/authentication-flows.md), [環境・デプロイメント](./deployment/environment-and-deployment.md)
- **HeroUI**: [コンポーネントカタログ](./components/component-catalog.md), [ビルドシステム](./development/build-system-and-tools.md)

#### 🛠 **開発ツール**

- **Storybook**: [ビルドシステム](./development/build-system-and-tools.md), [テスト・品質保証](./development/testing-and-quality-assurance.md)
- **ESLint**: [ビルドシステム](./development/build-system-and-tools.md), [開発者ガイド](./development/developer-guide.md)
- **Tailwind CSS**: [ビルドシステム](./development/build-system-and-tools.md), [開発者ガイド](./development/developer-guide.md)

#### 🔐 **セキュリティ**

- **認証**: [認証フロー](./architecture/authentication-flows.md), [セキュリティアーキテクチャ](./security/security-architecture.md)
- **暗号化**: [ユーティリティ関数](./development/utility-functions.md), [セキュリティアーキテクチャ](./security/security-architecture.md)
- **バリデーション**: [ユーティリティ関数](./development/utility-functions.md), [API 仕様](./api/README.md)

#### 🔌 **API・統合**

- **Figma API**: [API 統合フロー](./architecture/api-integration-flows.md), [カスタムフック](./development/custom-hooks.md)
- **REST API**: [API 概要](./api/README.md), [OpenAPI 仕様](./api/openapi.yaml)
- **エラーハンドリング**: [エラーハンドリング](./api/error-handling.md), [ユーティリティ関数](./development/utility-functions.md)

## 📊 ドキュメント統計

### 📈 カバレッジ

- **総ドキュメント数**: 25+ ファイル
- **総行数**: 10,000+ 行
- **カテゴリ数**: 8 カテゴリ
- **コード例数**: 200+ 例

### 📋 完成度

- ✅ **プロジェクト概要**: 100%
- ✅ **アーキテクチャ**: 100%
- ✅ **開発ガイド**: 100%
- ✅ **API ドキュメント**: 100%
- ✅ **コンポーネント**: 100%
- ✅ **セキュリティ**: 100%
- ✅ **型定義**: 100%
- ✅ **デプロイメント**: 100%

## 🔄 ドキュメント更新

### 更新頻度

- **メジャーリリース**: 全体見直し
- **マイナーリリース**: 新機能ドキュメント追加
- **パッチリリース**: バグ修正・改善

### 更新プロセス

1. **変更検出**: コード変更の自動検出
2. **ドキュメント更新**: 関連ドキュメントの更新
3. **レビュー**: 技術レビューと品質チェック
4. **公開**: ドキュメントサイトへの反映

### 品質保証

- **リンクチェック**: 内部・外部リンクの検証
- **コード例テスト**: サンプルコードの動作確認
- **スペルチェック**: 誤字脱字の自動検出
- **構造検証**: ドキュメント構造の一貫性チェック

## 🤝 コントリビューション

### ドキュメント改善

- **誤字脱字の修正**: 気軽に PR を作成
- **説明の改善**: より分かりやすい表現への変更
- **例の追加**: 実用的なコード例の追加
- **翻訳**: 多言語対応（将来的に）

### フィードバック

- **GitHub Issues**: バグ報告・改善提案
- **GitHub Discussions**: 質問・議論
- **Pull Requests**: 直接的な改善提案

## 📞 サポート

### 質問・相談

- **GitHub Discussions**: 一般的な質問
- **GitHub Issues**: バグ報告・機能要望
- **Discord**: リアルタイム相談（将来的に）

### 緊急時

- **セキュリティ問題**: security@example.com
- **重要なバグ**: GitHub Issues で `urgent` ラベル

---

## 🎯 次のステップ

### 新規開発者

1. **[プロジェクト概要](./project-overview.md)** を読んで全体像を把握
2. **[開発者ガイド](./development/developer-guide.md)** に従って環境をセットアップ
3. **[コンポーネントカタログ](./components/component-catalog.md)** で利用可能な UI を確認

### 既存開発者

1. **[API ドキュメント](./api/README.md)** で最新の API 仕様を確認
2. **[ユーティリティ関数](./development/utility-functions.md)** で新しいライブラリをチェック
3. **[セキュリティアーキテクチャ](./security/security-architecture.md)** でセキュリティ要件を確認

### アーキテクト・リードエンジニア

1. **[システム概要](./architecture/system-overview.md)** でアーキテクチャを理解
2. **[データフロー](./architecture/data-flow.md)** でシステム間の連携を確認
3. **[テスト・品質保証](./development/testing-and-quality-assurance.md)** で品質基準を確認

---

**Happy Coding! 🚀**

このドキュメントが AI Development Template での開発を成功に導く助けになれば幸いです。
