# 🔧 Semgrep エラー修正ガイド

## 🚨 問題の概要

`Unable to resolve action semgrep/semgrep-action@v2, unable to find version v2` エラーが発生していました。

## ✅ 修正内容

### 1. 問題の原因
- `semgrep/semgrep-action@v2` が存在しない/廃止されている
- Semgrep の推奨方法が変更されている

### 2. 実施した修正

#### a) 古い設定を削除
```yaml
# 削除した設定
- name: Semgrep Security Scan (Enhanced)
  uses: semgrep/semgrep-action@v2
  with:
    config: >-
      p/security-audit
      p/typescript
      p/react
      p/owasp-top-ten
      p/javascript
      p/nextjs
      .semgrep.yml
    generateSarif: "1"
  env:
    SEMGREP_APP_TOKEN: ${{ secrets.SEMGREP_APP_TOKEN }}
```

#### b) 新しい Semgrep ジョブを追加
```yaml
# 新しい設定
semgrep:
  name: "🔍 Semgrep SAST Analysis"
  runs-on: ubuntu-latest
  timeout-minutes: 15
  
  container:
    image: semgrep/semgrep
  
  if: github.actor != 'dependabot[bot]'
  
  steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Run Semgrep SAST scan
      run: |
        echo "🔍 Starting Semgrep security analysis..."
        semgrep ci \
          --config p/security-audit \
          --config p/typescript \
          --config p/react \
          --config p/owasp-top-ten \
          --config p/javascript \
          --config p/nextjs \
          --config .semgrep.yml \
          --sarif \
          --output semgrep-results.sarif \
          --verbose
        echo "✅ Semgrep analysis completed"
      env:
        SEMGREP_APP_TOKEN: ${{ secrets.SEMGREP_APP_TOKEN }}
      continue-on-error: false
      timeout-minutes: 10
      
    - name: Upload SARIF results
      uses: actions/upload-artifact@v4
      if: always()
      with:
        name: semgrep-sarif-results
        path: semgrep-results.sarif
        retention-days: 30
```

### 3. 変更点の詳細

#### 利点
- ✅ **最新の推奨方法**: Semgrep 公式の推奨方法を使用
- ✅ **独立したジョブ**: 他のセキュリティチェックと分離
- ✅ **Docker イメージ**: 軽量で高速な実行
- ✅ **SARIF 出力**: セキュリティレポートの標準化
- ✅ **アーティファクト保存**: 結果の永続化

#### 主な変更
- `semgrep/semgrep-action@v2` → `semgrep/semgrep` Docker イメージ
- `uses` → `run` コマンドによる実行
- `generateSarif: "1"` → `--sarif --output` オプション
- セキュリティジョブから独立したジョブに分離

## 🔐 GitHub Secrets の設定

### 必要な Secrets

#### `SEMGREP_APP_TOKEN`
Semgrep AppSec Platform への接続に必要なトークンです。

**設定手順:**
1. [Semgrep AppSec Platform](https://semgrep.dev/app) にログイン
2. **Settings > Tokens** に移動
3. **Create new token** をクリック
4. **Agent (CI)** スコープを選択
5. トークンをコピー
6. GitHub リポジトリの **Settings > Secrets and variables > Actions** に移動
7. **New repository secret** をクリック
8. 名前: `SEMGREP_APP_TOKEN`
9. 値: コピーしたトークンを貼り付け
10. **Add secret** をクリック

### 設定確認

以下のコマンドで設定が正しいかテストできます：

```bash
# ローカルでのテスト（トークンが必要）
export SEMGREP_APP_TOKEN="your_token_here"
semgrep ci --config p/security-audit --config p/typescript
```

## 🚀 実行確認

### 1. 自動実行のタイミング
- **Pull Request**: 変更されたファイルのみスキャン
- **Push to main**: 全ファイルスキャン
- **手動実行**: GitHub Actions UI から実行可能

### 2. 結果の確認場所
- **GitHub Actions ログ**: リアルタイムの実行状況
- **Semgrep AppSec Platform**: 詳細な分析結果
- **SARIF アーティファクト**: ダウンロード可能な結果ファイル

### 3. トラブルシューティング

#### よくあるエラー
```bash
# トークンエラー
Error: SEMGREP_APP_TOKEN is not set
```
**解決方法**: GitHub Secrets でトークンを設定

```bash
# 設定ファイルエラー
Error: Could not find config file .semgrep.yml
```
**解決方法**: `.semgrep.yml` ファイルを確認（存在する場合は問題なし）

## 📊 実行結果の活用

### 1. CI/CD パイプラインでの活用
- セキュリティ問題を早期発見
- コードレビューでの自動チェック
- 継続的なセキュリティ監視

### 2. 開発ワークフローでの活用
- PR作成時の自動スキャン
- セキュリティ問題の即座な通知
- 開発者への教育効果

## 🎯 次のステップ

1. **設定確認**: GitHub Secrets の設定を確認
2. **テスト実行**: 修正後の初回実行を確認
3. **結果確認**: Semgrep AppSec Platform での結果確認
4. **チーム共有**: 修正内容をチームに共有

---

**📝 修正日**: 2024年12月  
**🔧 修正者**: Background Agent  
**📋 ステータス**: 完了
