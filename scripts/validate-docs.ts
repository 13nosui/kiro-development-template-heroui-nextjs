#!/usr/bin/env tsx

/**
 * ドキュメント検証スクリプト
 *
 * このスクリプトは以下の検証を行います：
 * - ドキュメントファイルの存在確認
 * - 内部リンクの検証
 * - 外部リンクの検証（オプション）
 * - Markdown構文の検証
 * - 目次の整合性チェック
 * - コード例の構文チェック
 */

import fs from "fs";
import path from "path";
import { glob } from "glob";

interface ValidationResult {
  file: string;
  errors: string[];
  warnings: string[];
}

interface ValidationSummary {
  totalFiles: number;
  validFiles: number;
  filesWithErrors: number;
  filesWithWarnings: number;
  totalErrors: number;
  totalWarnings: number;
  results: ValidationResult[];
}

class DocumentValidator {
  private docsDir: string;
  private results: ValidationResult[] = [];
  private allFiles: Set<string> = new Set();
  private existingFiles: Set<string> = new Set();

  constructor(docsDir: string = "docs") {
    this.docsDir = docsDir;
  }

  /**
   * メイン検証処理
   */
  async validate(): Promise<ValidationSummary> {
    console.log("🔍 ドキュメント検証を開始します...\n");

    // ドキュメントファイルの収集
    await this.collectFiles();

    // 各ファイルの検証
    for (const file of this.allFiles) {
      await this.validateFile(file);
    }

    // 結果の集計
    const summary = this.generateSummary();
    this.printSummary(summary);

    return summary;
  }

  /**
   * ドキュメントファイルの収集
   */
  private async collectFiles(): Promise<void> {
    const pattern = path.join(this.docsDir, "**/*.md");
    const files = await glob(pattern);

    for (const file of files) {
      const relativePath = path.relative(process.cwd(), file);
      this.allFiles.add(relativePath);

      if (fs.existsSync(file)) {
        this.existingFiles.add(relativePath);
      }
    }

    console.log(
      `📁 ${this.allFiles.size} 個のドキュメントファイルを発見しました`
    );
  }

  /**
   * 個別ファイルの検証
   */
  private async validateFile(filePath: string): Promise<void> {
    const result: ValidationResult = {
      file: filePath,
      errors: [],
      warnings: [],
    };

    try {
      // ファイル存在チェック
      if (!fs.existsSync(filePath)) {
        result.errors.push("ファイルが存在しません");
        this.results.push(result);
        return;
      }

      const content = fs.readFileSync(filePath, "utf-8");

      // 基本的な検証
      this.validateBasicStructure(content, result);
      this.validateLinks(content, result, filePath);
      this.validateCodeBlocks(content, result);
      this.validateHeaders(content, result);
      this.validateImages(content, result, filePath);
    } catch (error) {
      result.errors.push(
        `ファイル読み込みエラー: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }

    this.results.push(result);
  }

  /**
   * 基本構造の検証
   */
  private validateBasicStructure(
    content: string,
    result: ValidationResult
  ): void {
    // 空ファイルチェック
    if (content.trim().length === 0) {
      result.errors.push("ファイルが空です");
      return;
    }

    // H1ヘッダーの存在チェック
    if (!content.match(/^# .+/m)) {
      result.warnings.push("H1ヘッダー（# タイトル）が見つかりません");
    }

    // 非常に短いドキュメントの警告
    if (content.length < 100) {
      result.warnings.push("ドキュメントが非常に短いです（100文字未満）");
    }

    // 長すぎる行の検出
    const lines = content.split("\n");
    lines.forEach((line, index) => {
      if (
        line.length > 120 &&
        !line.startsWith("```") &&
        !line.includes("http")
      ) {
        result.warnings.push(
          `行 ${index + 1}: 行が長すぎます（${line.length}文字）`
        );
      }
    });
  }

  /**
   * リンクの検証
   */
  private validateLinks(
    content: string,
    result: ValidationResult,
    filePath: string
  ): void {
    // Markdownリンクの抽出
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const linkText = match[1];
      const linkUrl = match[2];

      // 空のリンクテキスト
      if (!linkText.trim()) {
        result.warnings.push(`空のリンクテキスト: ${linkUrl}`);
      }

      // 内部リンクの検証
      if (this.isInternalLink(linkUrl)) {
        this.validateInternalLink(linkUrl, result, filePath);
      }

      // 外部リンクの基本検証
      if (this.isExternalLink(linkUrl)) {
        this.validateExternalLink(linkUrl, result);
      }

      // アンカーリンクの検証
      if (linkUrl.startsWith("#")) {
        this.validateAnchorLink(linkUrl, content, result);
      }
    }
  }

  /**
   * 内部リンクかどうかの判定
   */
  private isInternalLink(url: string): boolean {
    return (
      url.startsWith("./") ||
      url.startsWith("../") ||
      (url.startsWith("/") && !url.startsWith("//")) ||
      (!url.startsWith("http") &&
        !url.startsWith("#") &&
        !url.startsWith("mailto:"))
    );
  }

  /**
   * 外部リンクかどうかの判定
   */
  private isExternalLink(url: string): boolean {
    return url.startsWith("http://") || url.startsWith("https://");
  }

  /**
   * 内部リンクの検証
   */
  private validateInternalLink(
    linkUrl: string,
    result: ValidationResult,
    currentFile: string
  ): void {
    let targetPath = linkUrl;

    // 相対パスの解決
    if (linkUrl.startsWith("./") || linkUrl.startsWith("../")) {
      const currentDir = path.dirname(currentFile);
      targetPath = path.resolve(currentDir, linkUrl);
      targetPath = path.relative(process.cwd(), targetPath);
    } else if (linkUrl.startsWith("/")) {
      targetPath = linkUrl.substring(1);
    }

    // アンカー部分を除去
    const [filePart] = targetPath.split("#");

    // ファイル存在チェック
    if (!this.existingFiles.has(filePart) && !fs.existsSync(filePart)) {
      result.errors.push(
        `内部リンクのファイルが見つかりません: ${linkUrl} -> ${filePart}`
      );
    }
  }

  /**
   * 外部リンクの基本検証
   */
  private validateExternalLink(
    linkUrl: string,
    result: ValidationResult
  ): void {
    // 基本的なURL形式チェック
    try {
      new URL(linkUrl);
    } catch {
      result.errors.push(`無効な外部リンクURL: ${linkUrl}`);
    }

    // HTTPSの推奨
    if (linkUrl.startsWith("http://") && !linkUrl.includes("localhost")) {
      result.warnings.push(`HTTPSの使用を推奨: ${linkUrl}`);
    }
  }

  /**
   * アンカーリンクの検証
   */
  private validateAnchorLink(
    linkUrl: string,
    content: string,
    result: ValidationResult
  ): void {
    const anchor = linkUrl.substring(1).toLowerCase();

    // ヘッダーからアンカーを生成
    const headers = content.match(/^#+\s+(.+)$/gm) || [];
    const validAnchors = headers.map((header) => {
      const text = header.replace(/^#+\s+/, "");
      return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    });

    if (!validAnchors.includes(anchor)) {
      result.warnings.push(`アンカーリンクが見つかりません: ${linkUrl}`);
    }
  }

  /**
   * コードブロックの検証
   */
  private validateCodeBlocks(content: string, result: ValidationResult): void {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const language = match[1];
      const code = match[2];

      // 空のコードブロック
      if (!code.trim()) {
        result.warnings.push("空のコードブロックがあります");
        continue;
      }

      // 言語指定の推奨
      if (!language) {
        result.warnings.push("コードブロックに言語指定がありません");
        continue;
      }

      // 基本的な構文チェック
      this.validateCodeSyntax(language, code, result);
    }
  }

  /**
   * コード構文の基本検証
   */
  private validateCodeSyntax(
    language: string,
    code: string,
    result: ValidationResult
  ): void {
    switch (language.toLowerCase()) {
      case "typescript":
      case "ts":
        this.validateTypeScriptCode(code, result);
        break;
      case "javascript":
      case "js":
        this.validateJavaScriptCode(code, result);
        break;
      case "json":
        this.validateJsonCode(code, result);
        break;
      case "bash":
      case "sh":
        this.validateBashCode(code, result);
        break;
    }
  }

  /**
   * TypeScriptコードの検証
   */
  private validateTypeScriptCode(code: string, result: ValidationResult): void {
    // 基本的な構文エラーチェック
    const lines = code.split("\n");

    lines.forEach((line, index) => {
      // 未閉じの括弧チェック（簡易版）
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      const openParens = (line.match(/\(/g) || []).length;
      const closeParens = (line.match(/\)/g) || []).length;

      if (openBraces !== closeBraces && line.trim() && !line.includes("//")) {
        result.warnings.push(
          `TypeScriptコード行 ${index + 1}: 括弧の不一致の可能性`
        );
      }
      if (openParens !== closeParens && line.trim() && !line.includes("//")) {
        result.warnings.push(
          `TypeScriptコード行 ${index + 1}: 丸括弧の不一致の可能性`
        );
      }
    });
  }

  /**
   * JavaScriptコードの検証
   */
  private validateJavaScriptCode(code: string, result: ValidationResult): void {
    // TypeScriptと同様の基本チェック
    this.validateTypeScriptCode(code, result);
  }

  /**
   * JSONコードの検証
   */
  private validateJsonCode(code: string, result: ValidationResult): void {
    try {
      JSON.parse(code);
    } catch (error) {
      result.errors.push(
        `JSONコードの構文エラー: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Bashコードの検証
   */
  private validateBashCode(code: string, result: ValidationResult): void {
    const lines = code.split("\n");

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // 危険なコマンドの警告
      if (trimmed.includes("rm -rf /") || trimmed.includes("sudo rm -rf")) {
        result.warnings.push(
          `Bashコード行 ${index + 1}: 危険なコマンドが含まれています`
        );
      }

      // 未定義変数の可能性
      if (
        trimmed.includes("$") &&
        !trimmed.includes("echo") &&
        !trimmed.includes("export")
      ) {
        const variables = trimmed.match(/\$\w+/g);
        if (variables) {
          result.warnings.push(
            `Bashコード行 ${index + 1}: 未定義変数の可能性: ${variables.join(
              ", "
            )}`
          );
        }
      }
    });
  }

  /**
   * ヘッダー構造の検証
   */
  private validateHeaders(content: string, result: ValidationResult): void {
    const headers = content.match(/^(#+)\s+(.+)$/gm) || [];
    let previousLevel = 0;

    headers.forEach((header, index) => {
      const level = (header.match(/^#+/) || [""])[0].length;
      const text = header.replace(/^#+\s+/, "");

      // 空のヘッダーテキスト
      if (!text.trim()) {
        result.errors.push(`ヘッダー ${index + 1}: 空のヘッダーテキスト`);
      }

      // ヘッダーレベルの飛び越しチェック
      if (previousLevel > 0 && level > previousLevel + 1) {
        result.warnings.push(
          `ヘッダー "${text}": レベルが飛び越しています (H${previousLevel} -> H${level})`
        );
      }

      // 重複ヘッダーのチェック
      const duplicates = headers.filter((h) => h === header);
      if (duplicates.length > 1) {
        result.warnings.push(`重複ヘッダー: "${text}"`);
      }

      previousLevel = level;
    });
  }

  /**
   * 画像リンクの検証
   */
  private validateImages(
    content: string,
    result: ValidationResult,
    filePath: string
  ): void {
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;

    while ((match = imageRegex.exec(content)) !== null) {
      const altText = match[1];
      const imagePath = match[2];

      // alt属性の確認
      if (!altText.trim()) {
        result.warnings.push(`画像にalt属性がありません: ${imagePath}`);
      }

      // 内部画像ファイルの存在確認
      if (!imagePath.startsWith("http")) {
        let fullPath = imagePath;

        if (imagePath.startsWith("./") || imagePath.startsWith("../")) {
          const currentDir = path.dirname(filePath);
          fullPath = path.resolve(currentDir, imagePath);
        }

        if (!fs.existsSync(fullPath)) {
          result.errors.push(`画像ファイルが見つかりません: ${imagePath}`);
        }
      }
    }
  }

  /**
   * 結果の集計
   */
  private generateSummary(): ValidationSummary {
    const totalFiles = this.results.length;
    const filesWithErrors = this.results.filter(
      (r) => r.errors.length > 0
    ).length;
    const filesWithWarnings = this.results.filter(
      (r) => r.warnings.length > 0
    ).length;
    const validFiles = totalFiles - filesWithErrors;
    const totalErrors = this.results.reduce(
      (sum, r) => sum + r.errors.length,
      0
    );
    const totalWarnings = this.results.reduce(
      (sum, r) => sum + r.warnings.length,
      0
    );

    return {
      totalFiles,
      validFiles,
      filesWithErrors,
      filesWithWarnings,
      totalErrors,
      totalWarnings,
      results: this.results,
    };
  }

  /**
   * 結果の出力
   */
  private printSummary(summary: ValidationSummary): void {
    console.log("\n📊 検証結果サマリー");
    console.log("=".repeat(50));
    console.log(`📁 総ファイル数: ${summary.totalFiles}`);
    console.log(`✅ 有効ファイル数: ${summary.validFiles}`);
    console.log(`❌ エラーありファイル数: ${summary.filesWithErrors}`);
    console.log(`⚠️  警告ありファイル数: ${summary.filesWithWarnings}`);
    console.log(`🔴 総エラー数: ${summary.totalErrors}`);
    console.log(`🟡 総警告数: ${summary.totalWarnings}`);

    // エラーの詳細表示
    if (summary.totalErrors > 0) {
      console.log("\n❌ エラー詳細:");
      console.log("-".repeat(30));

      summary.results.forEach((result) => {
        if (result.errors.length > 0) {
          console.log(`\n📄 ${result.file}:`);
          result.errors.forEach((error) => {
            console.log(`  ❌ ${error}`);
          });
        }
      });
    }

    // 警告の詳細表示（最初の10件のみ）
    if (summary.totalWarnings > 0) {
      console.log("\n⚠️  警告詳細 (最初の10件):");
      console.log("-".repeat(30));

      let warningCount = 0;
      for (const result of summary.results) {
        if (result.warnings.length > 0 && warningCount < 10) {
          console.log(`\n📄 ${result.file}:`);
          for (const warning of result.warnings) {
            if (warningCount >= 10) break;
            console.log(`  ⚠️  ${warning}`);
            warningCount++;
          }
        }
      }

      if (summary.totalWarnings > 10) {
        console.log(
          `\n... 他 ${summary.totalWarnings - 10} 件の警告があります`
        );
      }
    }

    // 結果の判定
    console.log("\n🎯 検証結果:");
    if (summary.totalErrors === 0) {
      console.log("✅ すべてのドキュメントが有効です！");
    } else {
      console.log("❌ エラーが見つかりました。修正が必要です。");
    }

    if (summary.totalWarnings > 0) {
      console.log(
        `⚠️  ${summary.totalWarnings} 件の警告があります。改善を検討してください。`
      );
    }
  }
}

/**
 * メイン実行関数
 */
async function main() {
  const validator = new DocumentValidator();
  const summary = await validator.validate();

  // 終了コードの設定
  if (summary.totalErrors > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// スクリプトが直接実行された場合のみ実行
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ 検証スクリプトでエラーが発生しました:", error);
    process.exit(1);
  });
}

export { DocumentValidator, ValidationResult, ValidationSummary };
