/**
 * Code Analysis Utilities
 *
 * This module provides utilities for analyzing code patterns, dependencies,
 * and architectural decisions in the codebase.
 */

import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";

// Analysis result interfaces
export interface ProjectStructure {
  directories: DirectoryInfo[];
  files: FileInfo[];
  totalFiles: number;
  totalLines: number;
  languages: LanguageStats[];
}

export interface DirectoryInfo {
  name: string;
  path: string;
  fileCount: number;
  subdirectories: string[];
  purpose?: string;
}

export interface FileInfo {
  name: string;
  path: string;
  extension: string;
  size: number;
  lines: number;
  language: string;
  imports: string[];
  exports: string[];
}

export interface LanguageStats {
  language: string;
  fileCount: number;
  lineCount: number;
  percentage: number;
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
}

export interface DependencyNode {
  id: string;
  name: string;
  type: "component" | "hook" | "utility" | "service" | "type";
  filePath: string;
}

export interface DependencyEdge {
  from: string;
  to: string;
  type: "import" | "extends" | "implements" | "uses";
}

export interface ArchitecturalPattern {
  name: string;
  description: string;
  files: string[];
  confidence: number;
  examples: string[];
}

export interface SecurityPattern {
  type:
    | "validation"
    | "sanitization"
    | "authentication"
    | "authorization"
    | "encryption";
  description: string;
  files: string[];
  implementation: string;
}

export interface APIEndpoint {
  method: string;
  path: string;
  filePath: string;
  handler: string;
  middleware: string[];
  authentication: boolean;
  validation: boolean;
  documentation?: string;
}

export class CodeAnalyzer {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * Analyze the overall project structure
   */
  public async analyzeProjectStructure(): Promise<ProjectStructure> {
    const files = await this.getAllFiles();
    const directories = await this.getDirectoryStructure();
    const languageStats = this.calculateLanguageStats(files);

    const totalLines = files.reduce((sum, file) => sum + file.lines, 0);

    return {
      directories,
      files,
      totalFiles: files.length,
      totalLines,
      languages: languageStats,
    };
  }

  /**
   * Build dependency graph for the project
   */
  public async buildDependencyGraph(): Promise<DependencyGraph> {
    const files = await this.getAllFiles();
    const nodes: DependencyNode[] = [];
    const edges: DependencyEdge[] = [];

    for (const file of files) {
      // Create node for each file
      const nodeId = this.getNodeId(file.path);
      const nodeType = this.determineNodeType(file);

      nodes.push({
        id: nodeId,
        name: path.basename(file.name, file.extension),
        type: nodeType,
        filePath: file.path,
      });

      // Create edges for imports
      for (const importPath of file.imports) {
        const targetId = this.resolveImportPath(importPath, file.path);
        if (targetId) {
          edges.push({
            from: nodeId,
            to: targetId,
            type: "import",
          });
        }
      }
    }

    return { nodes, edges };
  }

  /**
   * Detect architectural patterns in the codebase
   */
  public async detectArchitecturalPatterns(): Promise<ArchitecturalPattern[]> {
    const patterns: ArchitecturalPattern[] = [];

    // Detect MVC pattern
    const mvcPattern = await this.detectMVCPattern();
    if (mvcPattern) patterns.push(mvcPattern);

    // Detect Repository pattern
    const repositoryPattern = await this.detectRepositoryPattern();
    if (repositoryPattern) patterns.push(repositoryPattern);

    // Detect Provider pattern
    const providerPattern = await this.detectProviderPattern();
    if (providerPattern) patterns.push(providerPattern);

    // Detect HOC pattern
    const hocPattern = await this.detectHOCPattern();
    if (hocPattern) patterns.push(hocPattern);

    // Detect Custom Hook pattern
    const hookPattern = await this.detectCustomHookPattern();
    if (hookPattern) patterns.push(hookPattern);

    return patterns;
  }

  /**
   * Analyze security patterns and implementations
   */
  public async analyzeSecurityPatterns(): Promise<SecurityPattern[]> {
    const patterns: SecurityPattern[] = [];

    // Detect validation patterns
    const validationPattern = await this.detectValidationPattern();
    if (validationPattern) patterns.push(validationPattern);

    // Detect sanitization patterns
    const sanitizationPattern = await this.detectSanitizationPattern();
    if (sanitizationPattern) patterns.push(sanitizationPattern);

    // Detect authentication patterns
    const authPattern = await this.detectAuthenticationPattern();
    if (authPattern) patterns.push(authPattern);

    // Detect authorization patterns
    const authzPattern = await this.detectAuthorizationPattern();
    if (authzPattern) patterns.push(authzPattern);

    return patterns;
  }

  /**
   * Extract API endpoints from the codebase
   */
  public async extractAPIEndpoints(): Promise<APIEndpoint[]> {
    const endpoints: APIEndpoint[] = [];

    // Find Next.js API routes
    const apiFiles = await glob("src/app/api/**/route.ts", {
      cwd: this.projectRoot,
    });
    const pageApiFiles = await glob("src/pages/api/**/*.ts", {
      cwd: this.projectRoot,
    });

    for (const file of [...apiFiles, ...pageApiFiles]) {
      const filePath = path.join(this.projectRoot, file);
      const content = fs.readFileSync(filePath, "utf-8");

      const extractedEndpoints = this.extractEndpointsFromFile(
        content,
        filePath
      );
      endpoints.push(...extractedEndpoints);
    }

    return endpoints;
  }

  private async getAllFiles(): Promise<FileInfo[]> {
    const files: FileInfo[] = [];
    const patterns = [
      "src/**/*.{ts,tsx,js,jsx}",
      "*.{ts,tsx,js,jsx,json,md}",
      "scripts/**/*.{ts,js}",
      ".storybook/**/*.{ts,js}",
    ];

    for (const pattern of patterns) {
      const matchedFiles = await glob(pattern, {
        cwd: this.projectRoot,
        ignore: ["node_modules/**", ".next/**", "dist/**"],
      });

      for (const file of matchedFiles) {
        const filePath = path.join(this.projectRoot, file);
        const stats = fs.statSync(filePath);
        const content = fs.readFileSync(filePath, "utf-8");

        const fileInfo: FileInfo = {
          name: path.basename(file),
          path: filePath,
          extension: path.extname(file),
          size: stats.size,
          lines: content.split("\n").length,
          language: this.getLanguageFromExtension(path.extname(file)),
          imports: this.extractImports(content),
          exports: this.extractExports(content),
        };

        files.push(fileInfo);
      }
    }

    return files;
  }

  private async getDirectoryStructure(): Promise<DirectoryInfo[]> {
    const directories: DirectoryInfo[] = [];
    const srcPath = path.join(this.projectRoot, "src");

    if (fs.existsSync(srcPath)) {
      await this.analyzeDirectory(srcPath, directories);
    }

    return directories;
  }

  private async analyzeDirectory(
    dirPath: string,
    directories: DirectoryInfo[]
  ): Promise<void> {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const subdirectories: string[] = [];
    let fileCount = 0;

    for (const entry of entries) {
      if (entry.isDirectory()) {
        subdirectories.push(entry.name);
        await this.analyzeDirectory(
          path.join(dirPath, entry.name),
          directories
        );
      } else {
        fileCount++;
      }
    }

    const relativePath = path.relative(this.projectRoot, dirPath);
    const purpose = this.inferDirectoryPurpose(
      path.basename(dirPath),
      relativePath
    );

    directories.push({
      name: path.basename(dirPath),
      path: relativePath,
      fileCount,
      subdirectories,
      purpose,
    });
  }

  private calculateLanguageStats(files: FileInfo[]): LanguageStats[] {
    const languageMap = new Map<
      string,
      { fileCount: number; lineCount: number }
    >();
    const totalLines = files.reduce((sum, file) => sum + file.lines, 0);

    for (const file of files) {
      const existing = languageMap.get(file.language) || {
        fileCount: 0,
        lineCount: 0,
      };
      languageMap.set(file.language, {
        fileCount: existing.fileCount + 1,
        lineCount: existing.lineCount + file.lines,
      });
    }

    return Array.from(languageMap.entries()).map(([language, stats]) => ({
      language,
      fileCount: stats.fileCount,
      lineCount: stats.lineCount,
      percentage: (stats.lineCount / totalLines) * 100,
    }));
  }

  private getLanguageFromExtension(ext: string): string {
    const languageMap: Record<string, string> = {
      ".ts": "TypeScript",
      ".tsx": "TypeScript React",
      ".js": "JavaScript",
      ".jsx": "JavaScript React",
      ".json": "JSON",
      ".md": "Markdown",
      ".css": "CSS",
      ".scss": "SCSS",
      ".html": "HTML",
    };

    return languageMap[ext] || "Unknown";
  }

  private extractImports(content: string): string[] {
    const imports: string[] = [];
    const importRegex = /import\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    return imports;
  }

  private extractExports(content: string): string[] {
    const exports: string[] = [];
    const exportRegex =
      /export\s+(?:default\s+)?(?:const|let|var|function|class|interface|type|enum)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    let match;

    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }

    return exports;
  }

  private getNodeId(filePath: string): string {
    return path
      .relative(this.projectRoot, filePath)
      .replace(/[/\\]/g, "_")
      .replace(/\.[^.]+$/, "");
  }

  private determineNodeType(file: FileInfo): DependencyNode["type"] {
    if (file.path.includes("components") || file.extension === ".tsx")
      return "component";
    if (file.path.includes("hooks") || file.name.startsWith("use"))
      return "hook";
    if (file.path.includes("lib") || file.path.includes("utils"))
      return "utility";
    if (file.path.includes("services") || file.path.includes("api"))
      return "service";
    if (file.path.includes("types") || file.name.includes("types"))
      return "type";
    return "utility";
  }

  private resolveImportPath(
    importPath: string,
    fromFile: string
  ): string | null {
    // Simplified import resolution - would need more sophisticated logic
    if (importPath.startsWith(".")) {
      const resolved = path.resolve(path.dirname(fromFile), importPath);
      return this.getNodeId(resolved);
    }
    return null;
  }

  private inferDirectoryPurpose(
    dirName: string,
    relativePath: string
  ): string | undefined {
    const purposeMap: Record<string, string> = {
      components: "React components and UI elements",
      hooks: "Custom React hooks",
      lib: "Utility libraries and helper functions",
      utils: "Utility functions and helpers",
      services: "Business logic and external service integrations",
      types: "TypeScript type definitions",
      api: "API routes and endpoints",
      pages: "Next.js pages and routing",
      app: "Next.js app directory structure",
      styles: "CSS and styling files",
      public: "Static assets and public files",
      scripts: "Build and utility scripts",
      docs: "Documentation files",
      tests: "Test files and test utilities",
      __tests__: "Test files",
      stories: "Storybook stories",
    };

    return purposeMap[dirName];
  }

  private async detectMVCPattern(): Promise<ArchitecturalPattern | null> {
    const hasModels =
      (await this.hasDirectory("models")) || (await this.hasDirectory("types"));
    const hasViews =
      (await this.hasDirectory("components")) ||
      (await this.hasDirectory("pages"));
    const hasControllers =
      (await this.hasDirectory("api")) || (await this.hasDirectory("services"));

    if (hasModels && hasViews && hasControllers) {
      return {
        name: "Model-View-Controller (MVC)",
        description:
          "Separation of concerns with models, views, and controllers",
        files: [],
        confidence: 0.8,
        examples: [
          "Types/Models in types/",
          "Views in components/",
          "Controllers in api/",
        ],
      };
    }

    return null;
  }

  private async detectRepositoryPattern(): Promise<ArchitecturalPattern | null> {
    const files = await glob("**/*repository*.{ts,js}", {
      cwd: this.projectRoot,
    });
    if (files.length > 0) {
      return {
        name: "Repository Pattern",
        description: "Data access abstraction layer",
        files,
        confidence: 0.9,
        examples: files.slice(0, 3),
      };
    }
    return null;
  }

  private async detectProviderPattern(): Promise<ArchitecturalPattern | null> {
    const files = await glob("**/*{provider,context}*.{ts,tsx}", {
      cwd: this.projectRoot,
    });
    if (files.length > 0) {
      return {
        name: "Provider Pattern",
        description: "React Context providers for state management",
        files,
        confidence: 0.9,
        examples: files.slice(0, 3),
      };
    }
    return null;
  }

  private async detectHOCPattern(): Promise<ArchitecturalPattern | null> {
    const files = await glob("**/*{hoc,with}*.{ts,tsx}", {
      cwd: this.projectRoot,
    });
    if (files.length > 0) {
      return {
        name: "Higher-Order Component (HOC)",
        description: "Component composition pattern",
        files,
        confidence: 0.8,
        examples: files.slice(0, 3),
      };
    }
    return null;
  }

  private async detectCustomHookPattern(): Promise<ArchitecturalPattern | null> {
    const files = await glob("**/use*.{ts,tsx}", { cwd: this.projectRoot });
    if (files.length > 0) {
      return {
        name: "Custom Hooks Pattern",
        description: "Reusable stateful logic with custom React hooks",
        files,
        confidence: 0.95,
        examples: files.slice(0, 3),
      };
    }
    return null;
  }

  private async detectValidationPattern(): Promise<SecurityPattern | null> {
    const files = await glob("**/*{validation,validator}*.{ts,js}", {
      cwd: this.projectRoot,
    });
    if (files.length > 0) {
      return {
        type: "validation",
        description: "Input validation using Zod schemas and custom validators",
        files,
        implementation:
          "Zod schema validation with custom validation functions",
      };
    }
    return null;
  }

  private async detectSanitizationPattern(): Promise<SecurityPattern | null> {
    const files = await glob("**/*{security,sanitiz}*.{ts,js}", {
      cwd: this.projectRoot,
    });
    if (files.length > 0) {
      return {
        type: "sanitization",
        description: "Input sanitization and XSS protection",
        files,
        implementation: "DOMPurify and custom sanitization functions",
      };
    }
    return null;
  }

  private async detectAuthenticationPattern(): Promise<SecurityPattern | null> {
    const files = await glob("**/*{auth,firebase}*.{ts,tsx}", {
      cwd: this.projectRoot,
    });
    if (files.length > 0) {
      return {
        type: "authentication",
        description: "Firebase Authentication with email/password and OAuth",
        files,
        implementation: "Firebase Auth with React Context",
      };
    }
    return null;
  }

  private async detectAuthorizationPattern(): Promise<SecurityPattern | null> {
    const files = await glob("**/*{auth,permission,role}*.{ts,tsx}", {
      cwd: this.projectRoot,
    });
    if (files.length > 0) {
      return {
        type: "authorization",
        description: "Role-based access control and permissions",
        files,
        implementation: "Context-based authorization checks",
      };
    }
    return null;
  }

  private extractEndpointsFromFile(
    content: string,
    filePath: string
  ): APIEndpoint[] {
    const endpoints: APIEndpoint[] = [];
    const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

    for (const method of methods) {
      const regex = new RegExp(`export\\s+async\\s+function\\s+${method}`, "g");
      if (regex.test(content)) {
        const path = this.extractPathFromApiFile(filePath);
        endpoints.push({
          method,
          path,
          filePath,
          handler: `${method} handler`,
          middleware: this.extractMiddleware(content),
          authentication: this.hasAuthentication(content),
          validation: this.hasValidation(content),
        });
      }
    }

    return endpoints;
  }

  private extractPathFromApiFile(filePath: string): string {
    // Convert file path to API route path
    const relativePath = path.relative(this.projectRoot, filePath);
    let apiPath = relativePath
      .replace(/^src\/(app\/api|pages\/api)/, "")
      .replace(/\/route\.(ts|js)$/, "")
      .replace(/\.(ts|js)$/, "");

    // Handle dynamic routes
    apiPath = apiPath.replace(/\[([^\]]+)\]/g, ":$1");

    return apiPath || "/";
  }

  private extractMiddleware(content: string): string[] {
    const middleware: string[] = [];

    if (content.includes("cors")) middleware.push("CORS");
    if (content.includes("auth")) middleware.push("Authentication");
    if (content.includes("validation")) middleware.push("Validation");
    if (content.includes("security")) middleware.push("Security");

    return middleware;
  }

  private hasAuthentication(content: string): boolean {
    return (
      content.includes("auth") ||
      content.includes("token") ||
      content.includes("user")
    );
  }

  private hasValidation(content: string): boolean {
    return (
      content.includes("validation") ||
      content.includes("validator") ||
      content.includes("zod")
    );
  }

  private async hasDirectory(dirName: string): Promise<boolean> {
    const dirPath = path.join(this.projectRoot, "src", dirName);
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  }
}
