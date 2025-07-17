#!/usr/bin/env node

/**
 * Main Documentation Generation Script
 *
 * This script orchestrates the entire documentation generation process,
 * using the AST parser, code analyzer, and diagram generator utilities.
 */

import * as path from "path";
import * as fs from "fs";
import { TypeScriptASTParser } from "./doc-generation/ast-parser";
import { CodeAnalyzer } from "./doc-generation/code-analyzer";
import { DiagramGenerator } from "./doc-generation/diagram-generator";

interface GenerationOptions {
  projectRoot?: string;
  outputDir?: string;
  generateDiagrams?: boolean;
  verbose?: boolean;
}

class DocumentationGenerator {
  private projectRoot: string;
  private outputDir: string;
  private astParser: TypeScriptASTParser;
  private codeAnalyzer: CodeAnalyzer;
  private diagramGenerator: DiagramGenerator;
  private verbose: boolean;

  constructor(options: GenerationOptions = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.outputDir =
      options.outputDir || path.join(this.projectRoot, "docs", "generated");
    this.verbose = options.verbose || false;

    // Initialize utilities
    this.astParser = new TypeScriptASTParser(this.projectRoot);
    this.codeAnalyzer = new CodeAnalyzer(this.projectRoot);
    this.diagramGenerator = new DiagramGenerator(
      path.join(this.outputDir, "diagrams")
    );

    this.log("Documentation generator initialized");
    this.log(`Project root: ${this.projectRoot}`);
    this.log(`Output directory: ${this.outputDir}`);
  }

  /**
   * Generate all documentation
   */
  public async generateAll(): Promise<void> {
    this.log("Starting documentation generation...");

    try {
      // Ensure output directory exists
      this.ensureOutputDirectory();

      // Extract data from codebase
      this.log("Extracting TypeScript definitions...");
      const astData = this.astParser.extractAll();

      this.log("Analyzing project structure...");
      const structure = await this.codeAnalyzer.analyzeProjectStructure();

      this.log("Building dependency graph...");
      const dependencyGraph = await this.codeAnalyzer.buildDependencyGraph();

      this.log("Detecting architectural patterns...");
      const patterns = await this.codeAnalyzer.detectArchitecturalPatterns();

      this.log("Analyzing security patterns...");
      const securityPatterns =
        await this.codeAnalyzer.analyzeSecurityPatterns();

      this.log("Extracting API endpoints...");
      const endpoints = await this.codeAnalyzer.extractAPIEndpoints();

      // Generate documentation files
      this.log("Generating documentation files...");
      await this.generateTypeDocumentation(
        astData.interfaces,
        astData.types,
        astData.enums
      );
      await this.generateComponentDocumentation(astData.components);
      await this.generateHookDocumentation(astData.hooks);
      await this.generateAPIDocumentation(endpoints);
      await this.generateArchitectureDocumentation(structure, patterns);
      await this.generateSecurityDocumentation(securityPatterns);

      // Generate diagrams
      this.log("Generating Mermaid diagrams...");
      const diagrams = this.diagramGenerator.generateAllDiagrams({
        structure,
        patterns,
        endpoints,
        components: astData.components,
        hooks: astData.hooks,
        interfaces: astData.interfaces,
        dependencyGraph,
        securityPatterns,
      });

      // Generate summary
      this.log("Generating documentation summary...");
      await this.generateSummary({
        structure,
        patterns,
        endpoints,
        astData,
        securityPatterns,
        diagrams,
      });

      this.log("Documentation generation completed successfully!");
      this.log(`Generated files in: ${this.outputDir}`);
    } catch (error) {
      console.error("Error generating documentation:", error);
      throw error;
    }
  }

  private async generateTypeDocumentation(
    interfaces: any[],
    types: any[],
    enums: any[]
  ): Promise<void> {
    const content = `# TypeScript Type Definitions

## Interfaces (${interfaces.length})

${interfaces
  .map(
    (iface) => `
### ${iface.name}

**File:** \`${path.relative(this.projectRoot, iface.filePath)}\`
**Line:** ${iface.location.line}
**Exported:** ${iface.exported ? "Yes" : "No"}

${iface.documentation ? `**Description:** ${iface.documentation}\n` : ""}

**Properties:**
${iface.properties
  .map(
    (prop: any) => `
- \`${prop.name}${prop.optional ? "?" : ""}: ${prop.type}\`${
      prop.documentation ? ` - ${prop.documentation}` : ""
    }
`
  )
  .join("")}

${iface.extends ? `**Extends:** ${iface.extends.join(", ")}\n` : ""}
`
  )
  .join("\n---\n")}

## Type Aliases (${types.length})

${types
  .map(
    (type) => `
### ${type.name}

**File:** \`${path.relative(this.projectRoot, type.filePath)}\`
**Line:** ${type.location.line}
**Exported:** ${type.exported ? "Yes" : "No"}

${type.documentation ? `**Description:** ${type.documentation}\n` : ""}

\`\`\`typescript
type ${type.name} = ${type.definition};
\`\`\`
`
  )
  .join("\n---\n")}

## Enums (${enums.length})

${enums
  .map(
    (enumDef) => `
### ${enumDef.name}

**File:** \`${path.relative(this.projectRoot, enumDef.filePath)}\`
**Line:** ${enumDef.location.line}
**Exported:** ${enumDef.exported ? "Yes" : "No"}

${enumDef.documentation ? `**Description:** ${enumDef.documentation}\n` : ""}

**Members:**
${enumDef.members
  .map(
    (member: any) => `
- \`${member.name}${member.value ? ` = ${member.value}` : ""}\`${
      member.documentation ? ` - ${member.documentation}` : ""
    }
`
  )
  .join("")}
`
  )
  .join("\n---\n")}
`;

    await this.writeFile("types.md", content);
  }

  private async generateComponentDocumentation(
    components: any[]
  ): Promise<void> {
    const content = `# React Components

## Overview

This document contains documentation for all React components in the project.

**Total Components:** ${components.length}

## Components

${components
  .map(
    (comp) => `
### ${comp.name}

**File:** \`${path.relative(this.projectRoot, comp.filePath)}\`
**Line:** ${comp.location.line}
**Exported:** ${comp.exported ? "Yes" : "No"}

${comp.documentation ? `**Description:** ${comp.documentation}\n` : ""}

${
  comp.props
    ? `
**Props Interface:** \`${comp.props.name}\`

**Props:**
${comp.props.properties
  .map(
    (prop: any) => `
- \`${prop.name}${prop.optional ? "?" : ""}: ${prop.type}\`${
      prop.documentation ? ` - ${prop.documentation}` : ""
    }
`
  )
  .join("")}
`
    : "**Props:** Not defined or inferred"
}

**Usage Example:**
\`\`\`tsx
import { ${comp.name} } from '${path
      .relative(this.projectRoot, comp.filePath)
      .replace(/\.(tsx?|jsx?)$/, "")}';

<${comp.name} />
\`\`\`
`
  )
  .join("\n---\n")}
`;

    await this.writeFile("components.md", content);
  }

  private async generateHookDocumentation(hooks: any[]): Promise<void> {
    const content = `# Custom React Hooks

## Overview

This document contains documentation for all custom React hooks in the project.

**Total Hooks:** ${hooks.length}

## Hooks

${hooks
  .map(
    (hook) => `
### ${hook.name}

**File:** \`${path.relative(this.projectRoot, hook.filePath)}\`
**Line:** ${hook.location.line}
**Exported:** ${hook.exported ? "Yes" : "No"}

${hook.documentation ? `**Description:** ${hook.documentation}\n` : ""}

**Parameters:**
${
  hook.parameters.length > 0
    ? hook.parameters
        .map(
          (param: any) => `
- \`${param.name}${param.optional ? "?" : ""}: ${param.type}\`${
            param.defaultValue ? ` = ${param.defaultValue}` : ""
          }
`
        )
        .join("")
    : "None"
}

**Returns:** \`${hook.returnType}\`

${
  hook.dependencies.length > 0
    ? `**Dependencies:** ${hook.dependencies.join(", ")}\n`
    : ""
}

**Usage Example:**
\`\`\`tsx
import { ${hook.name} } from '${path
      .relative(this.projectRoot, hook.filePath)
      .replace(/\.(tsx?|jsx?)$/, "")}';

const result = ${hook.name}(${hook.parameters
      .map((p: any) => p.name)
      .join(", ")});
\`\`\`
`
  )
  .join("\n---\n")}
`;

    await this.writeFile("hooks.md", content);
  }

  private async generateAPIDocumentation(endpoints: any[]): Promise<void> {
    const content = `# API Endpoints

## Overview

This document contains documentation for all REST API endpoints in the project.

**Total Endpoints:** ${endpoints.length}

## Endpoints

${endpoints
  .map(
    (endpoint) => `
### ${endpoint.method} ${endpoint.path}

**File:** \`${path.relative(this.projectRoot, endpoint.filePath)}\`
**Handler:** ${endpoint.handler}

${endpoint.documentation ? `**Description:** ${endpoint.documentation}\n` : ""}

**Authentication Required:** ${endpoint.authentication ? "Yes" : "No"}
**Validation:** ${endpoint.validation ? "Yes" : "No"}

${
  endpoint.middleware.length > 0
    ? `**Middleware:** ${endpoint.middleware.join(", ")}\n`
    : ""
}

**Example Request:**
\`\`\`bash
curl -X ${endpoint.method} \\
  -H "Content-Type: application/json" \\
  ${endpoint.authentication ? '-H "Authorization: Bearer <token>" \\' : ""}
  http://localhost:3000${endpoint.path}
\`\`\`
`
  )
  .join("\n---\n")}
`;

    await this.writeFile("api-endpoints.md", content);
  }

  private async generateArchitectureDocumentation(
    structure: any,
    patterns: any[]
  ): Promise<void> {
    const content = `# System Architecture

## Project Structure

**Total Files:** ${structure.totalFiles}
**Total Lines of Code:** ${structure.totalLines.toLocaleString()}

### Language Distribution

${structure.languages
  .map(
    (lang: any) => `
- **${lang.language}:** ${
      lang.fileCount
    } files (${lang.lineCount.toLocaleString()} lines, ${lang.percentage.toFixed(
      1
    )}%)
`
  )
  .join("")}

### Directory Structure

${structure.directories
  .map(
    (dir: any) => `
#### ${dir.name}
- **Path:** \`${dir.path}\`
- **Files:** ${dir.fileCount}
- **Subdirectories:** ${dir.subdirectories.length}
${dir.purpose ? `- **Purpose:** ${dir.purpose}` : ""}
`
  )
  .join("\n")}

## Architectural Patterns

**Detected Patterns:** ${patterns.length}

${patterns
  .map(
    (pattern) => `
### ${pattern.name}

**Description:** ${pattern.description}
**Confidence:** ${(pattern.confidence * 100).toFixed(0)}%
**Files:** ${pattern.files.length}

**Examples:**
${pattern.examples.map((example: string) => `- \`${example}\``).join("\n")}
`
  )
  .join("\n---\n")}
`;

    await this.writeFile("architecture.md", content);
  }

  private async generateSecurityDocumentation(
    securityPatterns: any[]
  ): Promise<void> {
    const content = `# Security Implementation

## Overview

This document outlines the security measures and patterns implemented in the project.

**Security Patterns Detected:** ${securityPatterns.length}

## Security Patterns

${securityPatterns
  .map(
    (pattern) => `
### ${pattern.type.charAt(0).toUpperCase() + pattern.type.slice(1)}

**Description:** ${pattern.description}
**Implementation:** ${pattern.implementation}
**Files:** ${pattern.files.length}

**Related Files:**
${pattern.files
  .slice(0, 5)
  .map((file: string) => `- \`${file}\``)
  .join("\n")}
${pattern.files.length > 5 ? `- ... and ${pattern.files.length - 5} more` : ""}
`
  )
  .join("\n---\n")}

## Security Checklist

- [${
      securityPatterns.some((p) => p.type === "validation") ? "x" : " "
    }] Input Validation
- [${
      securityPatterns.some((p) => p.type === "sanitization") ? "x" : " "
    }] XSS Protection
- [${
      securityPatterns.some((p) => p.type === "authentication") ? "x" : " "
    }] Authentication
- [${
      securityPatterns.some((p) => p.type === "authorization") ? "x" : " "
    }] Authorization
- [${
      securityPatterns.some((p) => p.type === "encryption") ? "x" : " "
    }] Data Encryption
`;

    await this.writeFile("security.md", content);
  }

  private async generateSummary(data: any): Promise<void> {
    const content = `# Documentation Summary

Generated on: ${new Date().toISOString()}

## Project Statistics

- **Total Files:** ${data.structure.totalFiles}
- **Total Lines of Code:** ${data.structure.totalLines.toLocaleString()}
- **Components:** ${data.astData.components.length}
- **Custom Hooks:** ${data.astData.hooks.length}
- **Interfaces:** ${data.astData.interfaces.length}
- **Type Aliases:** ${data.astData.types.length}
- **Enums:** ${data.astData.enums.length}
- **API Endpoints:** ${data.endpoints.length}
- **Architectural Patterns:** ${data.patterns.length}
- **Security Patterns:** ${data.securityPatterns.length}

## Generated Documentation

### Core Documentation
- [Type Definitions](./types.md) - TypeScript interfaces, types, and enums
- [Components](./components.md) - React component documentation
- [Hooks](./hooks.md) - Custom React hooks
- [API Endpoints](./api-endpoints.md) - REST API documentation
- [Architecture](./architecture.md) - System architecture and patterns
- [Security](./security.md) - Security implementation details

### Diagrams
- [Architecture Overview](./diagrams/architecture-overview.mmd)
- [Component Hierarchy](./diagrams/component-hierarchy.mmd)
- [Data Flow](./diagrams/data-flow.mmd)
- [Authentication Flow](./diagrams/auth-flow.mmd)
- [API Endpoints](./diagrams/api-endpoints.mmd)
- [Dependency Graph](./diagrams/dependency-graph.mmd)
- [Security Architecture](./diagrams/security-architecture.mmd)
- [Type Relationships](./diagrams/type-relationships.mmd)

## Top Languages

${data.structure.languages
  .slice(0, 5)
  .map(
    (lang: any) => `
${lang.percentage.toFixed(1)}% ${lang.language} (${lang.fileCount} files)
`
  )
  .join("")}

## Key Architectural Decisions

${data.patterns
  .map(
    (pattern: any) => `
- **${pattern.name}**: ${pattern.description}
`
  )
  .join("")}

---

*This documentation was automatically generated using TypeScript AST parsing and code analysis.*
`;

    await this.writeFile("README.md", content);
  }

  private ensureOutputDirectory(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  private async writeFile(filename: string, content: string): Promise<void> {
    const filePath = path.join(this.outputDir, filename);
    fs.writeFileSync(filePath, content, "utf-8");
    this.log(`Generated: ${filename}`);
  }

  private log(message: string): void {
    if (this.verbose) {
      console.log(`[DocGen] ${message}`);
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options: GenerationOptions = {
    verbose: args.includes("--verbose") || args.includes("-v"),
    generateDiagrams: !args.includes("--no-diagrams"),
  };

  // Parse project root argument
  const rootIndex = args.findIndex((arg) => arg === "--root" || arg === "-r");
  if (rootIndex !== -1 && args[rootIndex + 1]) {
    options.projectRoot = args[rootIndex + 1];
  }

  // Parse output directory argument
  const outputIndex = args.findIndex(
    (arg) => arg === "--output" || arg === "-o"
  );
  if (outputIndex !== -1 && args[outputIndex + 1]) {
    options.outputDir = args[outputIndex + 1];
  }

  try {
    const generator = new DocumentationGenerator(options);
    await generator.generateAll();
    console.log("✅ Documentation generation completed successfully!");
  } catch (error) {
    console.error("❌ Documentation generation failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { DocumentationGenerator };
