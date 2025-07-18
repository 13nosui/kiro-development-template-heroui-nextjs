#!/usr/bin/env tsx

/**
 * Documentation Completeness Validator
 *
 * This script validates the completeness of documentation against requirements
 * and ensures all cross-references are properly maintained.
 */

import fs from "fs";
import path from "path";
import { glob } from "glob";

interface RequirementMapping {
  id: string;
  description: string;
  documentationFiles: string[];
  status: "complete" | "partial" | "missing";
}

interface ValidationResult {
  totalRequirements: number;
  completedRequirements: number;
  partialRequirements: number;
  missingRequirements: number;
  requirementMappings: RequirementMapping[];
  crossReferenceIssues: string[];
  missingDocumentation: string[];
}

class DocumentationCompletenessValidator {
  private docsDir: string;
  private requirementsFile: string;
  private requirements: RequirementMapping[] = [];
  private allDocFiles: string[] = [];
  private crossReferenceIssues: string[] = [];
  private missingDocumentation: string[] = [];

  constructor(
    docsDir: string = "docs",
    requirementsFile: string = ".kiro/specs/project-documentation/requirements.md"
  ) {
    this.docsDir = docsDir;
    this.requirementsFile = requirementsFile;
  }

  /**
   * Run the validation
   */
  async validate(): Promise<ValidationResult> {
    console.log("🔍 Validating documentation completeness...");

    // Collect all documentation files
    await this.collectDocumentationFiles();

    // Parse requirements
    await this.parseRequirements();

    // Map requirements to documentation
    await this.mapRequirementsToDocumentation();

    // Validate cross-references
    await this.validateCrossReferences();

    // Check for missing documentation
    await this.checkForMissingDocumentation();

    // Generate validation result
    const result = this.generateValidationResult();

    // Print summary
    this.printSummary(result);

    return result;
  }

  /**
   * Collect all documentation files
   */
  private async collectDocumentationFiles(): Promise<void> {
    const pattern = path.join(this.docsDir, "**/*.md");
    this.allDocFiles = await glob(pattern);
    console.log(`📁 Found ${this.allDocFiles.length} documentation files`);
  }

  /**
   * Parse requirements from the requirements file
   */
  private async parseRequirements(): Promise<void> {
    try {
      const content = fs.readFileSync(this.requirementsFile, "utf-8");

      // Extract requirements using regex
      const requirementRegex =
        /### Requirement (\d+)\s+\*\*User Story:\*\* (.+?)\s+#### Acceptance Criteria([\s\S]+?)(?=### Requirement|$)/g;
      let match;

      while ((match = requirementRegex.exec(content)) !== null) {
        const id = match[1];
        const description = match[2];
        const criteriaText = match[3];

        // Extract individual criteria
        const criteriaRegex = /\d+\.\s+WHEN.+?THEN.+?SHALL.+?$/gm;
        const criteria = criteriaText.match(criteriaRegex) || [];

        this.requirements.push({
          id,
          description,
          documentationFiles: [],
          status: "missing",
        });
      }

      console.log(
        `📋 Extracted ${this.requirements.length} requirements from ${this.requirementsFile}`
      );
    } catch (error) {
      console.error(`❌ Error parsing requirements: ${error}`);
      throw error;
    }
  }

  /**
   * Map requirements to documentation files
   */
  private async mapRequirementsToDocumentation(): Promise<void> {
    // Define keywords for each requirement to search for in documentation
    const requirementKeywords: Record<string, string[]> = {
      "1": [
        "architecture",
        "system design",
        "component",
        "relationship",
        "dependency",
        "technology stack",
        "design pattern",
      ],
      "2": [
        "api",
        "endpoint",
        "rest",
        "http",
        "request",
        "response",
        "authentication",
        "error handling",
      ],
      "3": [
        "typescript",
        "interface",
        "type",
        "enum",
        "data model",
        "schema",
        "inheritance",
      ],
      "4": [
        "data flow",
        "diagram",
        "mermaid",
        "state management",
        "api call",
        "authentication flow",
      ],
      "5": [
        "security",
        "configuration",
        "authentication",
        "cors",
        "middleware",
        "environment",
        "firebase",
      ],
      "6": [
        "component",
        "hook",
        "props",
        "state",
        "usage example",
        "hierarchy",
        "reusability",
      ],
      "7": [
        "build",
        "deployment",
        "npm script",
        "ci/cd",
        "environment",
        "development workflow",
        "linting",
      ],
    };

    // For each documentation file, check content against requirement keywords
    for (const docFile of this.allDocFiles) {
      try {
        const content = fs.readFileSync(docFile, "utf-8").toLowerCase();

        for (const req of this.requirements) {
          const keywords = requirementKeywords[req.id];
          if (!keywords) continue;

          // Check if file contains keywords related to this requirement
          const matchCount = keywords.filter((keyword) =>
            content.includes(keyword.toLowerCase())
          ).length;
          const matchRatio = matchCount / keywords.length;

          if (matchRatio > 0.5) {
            req.documentationFiles.push(docFile);
          }
        }
      } catch (error) {
        console.error(`❌ Error processing file ${docFile}: ${error}`);
      }
    }

    // Update requirement status based on documentation coverage
    for (const req of this.requirements) {
      if (req.documentationFiles.length >= 3) {
        req.status = "complete";
      } else if (req.documentationFiles.length > 0) {
        req.status = "partial";
      } else {
        req.status = "missing";
      }
    }
  }

  /**
   * Validate cross-references between documentation files
   */
  private async validateCrossReferences(): Promise<void> {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

    for (const docFile of this.allDocFiles) {
      try {
        const content = fs.readFileSync(docFile, "utf-8");
        const docDir = path.dirname(docFile);
        let match;

        while ((match = linkRegex.exec(content)) !== null) {
          const linkText = match[1];
          const linkPath = match[2];

          // Skip external links and anchors
          if (linkPath.startsWith("http") || linkPath.startsWith("#")) {
            continue;
          }

          // Resolve relative path
          let targetPath = linkPath;
          if (linkPath.startsWith("./") || linkPath.startsWith("../")) {
            targetPath = path.resolve(docDir, linkPath);
          } else if (!linkPath.startsWith("/")) {
            targetPath = path.resolve(docDir, linkPath);
          }

          // Remove anchor part if present
          const [filePart] = targetPath.split("#");

          // Check if target file exists
          if (!fs.existsSync(filePart)) {
            this.crossReferenceIssues.push(
              `Broken link in ${docFile}: [${linkText}](${linkPath}) -> File not found`
            );
          }
        }
      } catch (error) {
        console.error(
          `❌ Error checking cross-references in ${docFile}: ${error}`
        );
      }
    }
  }

  /**
   * Check for missing documentation based on expected files
   */
  private async checkForMissingDocumentation(): Promise<void> {
    // Define expected documentation files
    const expectedFiles = [
      "docs/index.md",
      "docs/README.md",
      "docs/search.md",
      "docs/project-overview.md",
      "docs/architecture/system-overview.md",
      "docs/architecture/component-architecture.md",
      "docs/architecture/data-flow.md",
      "docs/architecture/authentication-flows.md",
      "docs/architecture/api-integration-flows.md",
      "docs/development/developer-guide.md",
      "docs/development/build-system-and-tools.md",
      "docs/development/custom-hooks.md",
      "docs/development/utility-functions.md",
      "docs/development/testing-and-quality-assurance.md",
      "docs/api/README.md",
      "docs/api/openapi.yaml",
      "docs/api/usage-examples.md",
      "docs/api/error-handling.md",
      "docs/api/security-and-rate-limiting.md",
      "docs/components/component-catalog.md",
      "docs/security/security-architecture.md",
      "docs/types/type-definitions-catalog.md",
      "docs/types/data-models-and-schemas.md",
      "docs/deployment/environment-and-deployment.md",
    ];

    for (const expectedFile of expectedFiles) {
      if (!fs.existsSync(expectedFile)) {
        this.missingDocumentation.push(expectedFile);
      }
    }
  }

  /**
   * Generate validation result
   */
  private generateValidationResult(): ValidationResult {
    const completedRequirements = this.requirements.filter(
      (r) => r.status === "complete"
    ).length;
    const partialRequirements = this.requirements.filter(
      (r) => r.status === "partial"
    ).length;
    const missingRequirements = this.requirements.filter(
      (r) => r.status === "missing"
    ).length;

    return {
      totalRequirements: this.requirements.length,
      completedRequirements,
      partialRequirements,
      missingRequirements,
      requirementMappings: this.requirements,
      crossReferenceIssues: this.crossReferenceIssues,
      missingDocumentation: this.missingDocumentation,
    };
  }

  /**
   * Print validation summary
   */
  private printSummary(result: ValidationResult): void {
    console.log("\n📊 Documentation Completeness Summary");
    console.log("=".repeat(50));
    console.log(`📋 Total Requirements: ${result.totalRequirements}`);
    console.log(
      `✅ Completed Requirements: ${result.completedRequirements} (${(
        (result.completedRequirements / result.totalRequirements) *
        100
      ).toFixed(1)}%)`
    );
    console.log(
      `⚠️ Partially Completed Requirements: ${result.partialRequirements} (${(
        (result.partialRequirements / result.totalRequirements) *
        100
      ).toFixed(1)}%)`
    );
    console.log(
      `❌ Missing Requirements: ${result.missingRequirements} (${(
        (result.missingRequirements / result.totalRequirements) *
        100
      ).toFixed(1)}%)`
    );
    console.log(
      `🔗 Cross-Reference Issues: ${result.crossReferenceIssues.length}`
    );
    console.log(
      `📄 Missing Documentation Files: ${result.missingDocumentation.length}`
    );

    // Print requirement details
    console.log("\n📋 Requirement Coverage Details:");
    console.log("-".repeat(30));

    for (const req of result.requirementMappings) {
      const statusEmoji =
        req.status === "complete"
          ? "✅"
          : req.status === "partial"
          ? "⚠️"
          : "❌";
      console.log(`${statusEmoji} Requirement ${req.id}: ${req.description}`);
      console.log(`   Documentation Files: ${req.documentationFiles.length}`);
      if (req.documentationFiles.length > 0) {
        req.documentationFiles.forEach((file) => {
          console.log(`   - ${file}`);
        });
      }
      console.log();
    }

    // Print cross-reference issues
    if (result.crossReferenceIssues.length > 0) {
      console.log("\n🔗 Cross-Reference Issues:");
      console.log("-".repeat(30));
      result.crossReferenceIssues.forEach((issue) => {
        console.log(`❌ ${issue}`);
      });
    }

    // Print missing documentation
    if (result.missingDocumentation.length > 0) {
      console.log("\n📄 Missing Documentation Files:");
      console.log("-".repeat(30));
      result.missingDocumentation.forEach((file) => {
        console.log(`❌ ${file}`);
      });
    }

    // Print overall assessment
    console.log("\n🎯 Overall Assessment:");
    if (
      result.completedRequirements === result.totalRequirements &&
      result.crossReferenceIssues.length === 0 &&
      result.missingDocumentation.length === 0
    ) {
      console.log("✅ Documentation is complete and accurate!");
    } else {
      console.log("⚠️ Documentation needs improvement:");
      if (result.missingRequirements > 0) {
        console.log(
          `  - ${result.missingRequirements} requirements have no documentation`
        );
      }
      if (result.partialRequirements > 0) {
        console.log(
          `  - ${result.partialRequirements} requirements have partial documentation`
        );
      }
      if (result.crossReferenceIssues.length > 0) {
        console.log(
          `  - ${result.crossReferenceIssues.length} cross-reference issues found`
        );
      }
      if (result.missingDocumentation.length > 0) {
        console.log(
          `  - ${result.missingDocumentation.length} expected documentation files are missing`
        );
      }
    }
  }
}

/**
 * Main execution function
 */
async function main() {
  const validator = new DocumentationCompletenessValidator();
  const result = await validator.validate();

  // Exit with appropriate code
  if (
    result.missingRequirements > 0 ||
    result.crossReferenceIssues.length > 0
  ) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { DocumentationCompletenessValidator, ValidationResult };
