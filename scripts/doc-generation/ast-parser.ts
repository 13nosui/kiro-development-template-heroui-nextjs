/**
 * TypeScript AST Parser for Automatic Type Extraction
 *
 * This module provides utilities for parsing TypeScript files and extracting
 * type definitions, interfaces, components, and other code structures.
 */

import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";

// Type definitions for extracted information
export interface ExtractedInterface {
  name: string;
  filePath: string;
  properties: InterfaceProperty[];
  extends?: string[];
  exported: boolean;
  documentation?: string;
  location: {
    line: number;
    column: number;
  };
}

export interface InterfaceProperty {
  name: string;
  type: string;
  optional: boolean;
  documentation?: string;
}

export interface ExtractedType {
  name: string;
  filePath: string;
  definition: string;
  exported: boolean;
  documentation?: string;
  location: {
    line: number;
    column: number;
  };
}

export interface ExtractedEnum {
  name: string;
  filePath: string;
  members: EnumMember[];
  exported: boolean;
  documentation?: string;
  location: {
    line: number;
    column: number;
  };
}

export interface EnumMember {
  name: string;
  value?: string | number;
  documentation?: string;
}

export interface ExtractedFunction {
  name: string;
  filePath: string;
  parameters: FunctionParameter[];
  returnType: string;
  exported: boolean;
  async: boolean;
  documentation?: string;
  location: {
    line: number;
    column: number;
  };
}

export interface FunctionParameter {
  name: string;
  type: string;
  optional: boolean;
  defaultValue?: string;
}

export interface ExtractedComponent {
  name: string;
  filePath: string;
  props?: ExtractedInterface;
  exported: boolean;
  documentation?: string;
  location: {
    line: number;
    column: number;
  };
}

export interface ExtractedHook {
  name: string;
  filePath: string;
  parameters: FunctionParameter[];
  returnType: string;
  dependencies: string[];
  exported: boolean;
  documentation?: string;
  location: {
    line: number;
    column: number;
  };
}

export class TypeScriptASTParser {
  private program: ts.Program;
  private checker: ts.TypeChecker;

  constructor(private projectPath: string) {
    // Create TypeScript program
    const configPath = ts.findConfigFile(
      projectPath,
      ts.sys.fileExists,
      "tsconfig.json"
    );
    if (!configPath) {
      throw new Error("Could not find tsconfig.json");
    }

    const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
    const compilerOptions = ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      path.dirname(configPath)
    );

    this.program = ts.createProgram(
      compilerOptions.fileNames,
      compilerOptions.options
    );
    this.checker = this.program.getTypeChecker();
  }

  /**
   * Extract all interfaces from TypeScript files
   */
  public extractInterfaces(): ExtractedInterface[] {
    const interfaces: ExtractedInterface[] = [];

    for (const sourceFile of this.program.getSourceFiles()) {
      if (sourceFile.isDeclarationFile) continue;
      if (sourceFile.fileName.includes("node_modules")) continue;

      ts.forEachChild(sourceFile, (node) => {
        if (ts.isInterfaceDeclaration(node)) {
          const interfaceInfo = this.extractInterfaceInfo(node, sourceFile);
          if (interfaceInfo) {
            interfaces.push(interfaceInfo);
          }
        }
      });
    }

    return interfaces;
  }

  /**
   * Extract all type aliases from TypeScript files
   */
  public extractTypes(): ExtractedType[] {
    const types: ExtractedType[] = [];

    for (const sourceFile of this.program.getSourceFiles()) {
      if (sourceFile.isDeclarationFile) continue;
      if (sourceFile.fileName.includes("node_modules")) continue;

      ts.forEachChild(sourceFile, (node) => {
        if (ts.isTypeAliasDeclaration(node)) {
          const typeInfo = this.extractTypeInfo(node, sourceFile);
          if (typeInfo) {
            types.push(typeInfo);
          }
        }
      });
    }

    return types;
  }

  /**
   * Extract all enums from TypeScript files
   */
  public extractEnums(): ExtractedEnum[] {
    const enums: ExtractedEnum[] = [];

    for (const sourceFile of this.program.getSourceFiles()) {
      if (sourceFile.isDeclarationFile) continue;
      if (sourceFile.fileName.includes("node_modules")) continue;

      ts.forEachChild(sourceFile, (node) => {
        if (ts.isEnumDeclaration(node)) {
          const enumInfo = this.extractEnumInfo(node, sourceFile);
          if (enumInfo) {
            enums.push(enumInfo);
          }
        }
      });
    }

    return enums;
  }

  /**
   * Extract all functions from TypeScript files
   */
  public extractFunctions(): ExtractedFunction[] {
    const functions: ExtractedFunction[] = [];

    for (const sourceFile of this.program.getSourceFiles()) {
      if (sourceFile.isDeclarationFile) continue;
      if (sourceFile.fileName.includes("node_modules")) continue;

      ts.forEachChild(sourceFile, (node) => {
        if (ts.isFunctionDeclaration(node)) {
          const functionInfo = this.extractFunctionInfo(node, sourceFile);
          if (functionInfo) {
            functions.push(functionInfo);
          }
        }
      });
    }

    return functions;
  }

  /**
   * Extract React components from TypeScript files
   */
  public extractComponents(): ExtractedComponent[] {
    const components: ExtractedComponent[] = [];

    for (const sourceFile of this.program.getSourceFiles()) {
      if (sourceFile.isDeclarationFile) continue;
      if (sourceFile.fileName.includes("node_modules")) continue;
      if (
        !sourceFile.fileName.includes("components") &&
        !sourceFile.fileName.includes(".tsx")
      )
        continue;

      ts.forEachChild(sourceFile, (node) => {
        if (ts.isFunctionDeclaration(node) || ts.isVariableStatement(node)) {
          const componentInfo = this.extractComponentInfo(node, sourceFile);
          if (componentInfo) {
            components.push(componentInfo);
          }
        }
      });
    }

    return components;
  }

  /**
   * Extract custom React hooks from TypeScript files
   */
  public extractHooks(): ExtractedHook[] {
    const hooks: ExtractedHook[] = [];

    for (const sourceFile of this.program.getSourceFiles()) {
      if (sourceFile.isDeclarationFile) continue;
      if (sourceFile.fileName.includes("node_modules")) continue;
      if (
        !sourceFile.fileName.includes("hooks") &&
        !sourceFile.fileName.includes("use")
      )
        continue;

      ts.forEachChild(sourceFile, (node) => {
        if (ts.isFunctionDeclaration(node)) {
          const hookInfo = this.extractHookInfo(node, sourceFile);
          if (hookInfo) {
            hooks.push(hookInfo);
          }
        }
      });
    }

    return hooks;
  }

  private extractInterfaceInfo(
    node: ts.InterfaceDeclaration,
    sourceFile: ts.SourceFile
  ): ExtractedInterface | null {
    const name = node.name.text;
    const properties: InterfaceProperty[] = [];
    const extendsClause = node.heritageClauses?.find(
      (clause) => clause.token === ts.SyntaxKind.ExtendsKeyword
    );
    const extendsTypes =
      extendsClause?.types.map((type) => type.expression.getText()) || [];

    // Extract properties
    for (const member of node.members) {
      if (ts.isPropertySignature(member) && member.name) {
        const propertyName = member.name.getText();
        const propertyType = member.type ? member.type.getText() : "any";
        const optional = !!member.questionToken;
        const documentation = this.getDocumentation(member);

        properties.push({
          name: propertyName,
          type: propertyType,
          optional,
          documentation,
        });
      }
    }

    const location = sourceFile.getLineAndCharacterOfPosition(node.getStart());
    const documentation = this.getDocumentation(node);
    const exported = this.isExported(node);

    return {
      name,
      filePath: sourceFile.fileName,
      properties,
      extends: extendsTypes.length > 0 ? extendsTypes : undefined,
      exported,
      documentation,
      location: {
        line: location.line + 1,
        column: location.character + 1,
      },
    };
  }

  private extractTypeInfo(
    node: ts.TypeAliasDeclaration,
    sourceFile: ts.SourceFile
  ): ExtractedType | null {
    const name = node.name.text;
    const definition = node.type.getText();
    const location = sourceFile.getLineAndCharacterOfPosition(node.getStart());
    const documentation = this.getDocumentation(node);
    const exported = this.isExported(node);

    return {
      name,
      filePath: sourceFile.fileName,
      definition,
      exported,
      documentation,
      location: {
        line: location.line + 1,
        column: location.character + 1,
      },
    };
  }

  private extractEnumInfo(
    node: ts.EnumDeclaration,
    sourceFile: ts.SourceFile
  ): ExtractedEnum | null {
    const name = node.name.text;
    const members: EnumMember[] = [];

    for (const member of node.members) {
      const memberName = member.name.getText();
      const memberValue = member.initializer?.getText();
      const documentation = this.getDocumentation(member);

      members.push({
        name: memberName,
        value: memberValue,
        documentation,
      });
    }

    const location = sourceFile.getLineAndCharacterOfPosition(node.getStart());
    const documentation = this.getDocumentation(node);
    const exported = this.isExported(node);

    return {
      name,
      filePath: sourceFile.fileName,
      members,
      exported,
      documentation,
      location: {
        line: location.line + 1,
        column: location.character + 1,
      },
    };
  }

  private extractFunctionInfo(
    node: ts.FunctionDeclaration,
    sourceFile: ts.SourceFile
  ): ExtractedFunction | null {
    if (!node.name) return null;

    const name = node.name.text;
    const parameters: FunctionParameter[] = [];
    const returnType = node.type?.getText() || "void";
    const isAsync = !!node.modifiers?.some(
      (mod) => mod.kind === ts.SyntaxKind.AsyncKeyword
    );

    // Extract parameters
    for (const param of node.parameters) {
      const paramName = param.name.getText();
      const paramType = param.type?.getText() || "any";
      const optional = !!param.questionToken;
      const defaultValue = param.initializer?.getText();

      parameters.push({
        name: paramName,
        type: paramType,
        optional,
        defaultValue,
      });
    }

    const location = sourceFile.getLineAndCharacterOfPosition(node.getStart());
    const documentation = this.getDocumentation(node);
    const exported = this.isExported(node);

    return {
      name,
      filePath: sourceFile.fileName,
      parameters,
      returnType,
      exported,
      async: isAsync,
      documentation,
      location: {
        line: location.line + 1,
        column: location.character + 1,
      },
    };
  }

  private extractComponentInfo(
    node: ts.Node,
    sourceFile: ts.SourceFile
  ): ExtractedComponent | null {
    // This is a simplified implementation - would need more sophisticated logic
    // to properly detect React components
    let name: string | undefined;
    let exported = false;

    if (ts.isFunctionDeclaration(node) && node.name) {
      name = node.name.text;
      exported = this.isExported(node);
    } else if (ts.isVariableStatement(node)) {
      // Handle const Component = () => {} pattern
      const declaration = node.declarationList.declarations[0];
      if (declaration && ts.isIdentifier(declaration.name)) {
        name = declaration.name.text;
        exported = this.isExported(node);
      }
    }

    if (!name || !this.isReactComponent(name, sourceFile)) {
      return null;
    }

    const location = sourceFile.getLineAndCharacterOfPosition(node.getStart());
    const documentation = this.getDocumentation(node);

    return {
      name,
      filePath: sourceFile.fileName,
      exported,
      documentation,
      location: {
        line: location.line + 1,
        column: location.character + 1,
      },
    };
  }

  private extractHookInfo(
    node: ts.FunctionDeclaration,
    sourceFile: ts.SourceFile
  ): ExtractedHook | null {
    if (!node.name) return null;

    const name = node.name.text;

    // Check if it's a hook (starts with 'use')
    if (!name.startsWith("use")) return null;

    const parameters: FunctionParameter[] = [];
    const returnType = node.type?.getText() || "any";
    const dependencies: string[] = []; // Would need more analysis to extract dependencies

    // Extract parameters
    for (const param of node.parameters) {
      const paramName = param.name.getText();
      const paramType = param.type?.getText() || "any";
      const optional = !!param.questionToken;
      const defaultValue = param.initializer?.getText();

      parameters.push({
        name: paramName,
        type: paramType,
        optional,
        defaultValue,
      });
    }

    const location = sourceFile.getLineAndCharacterOfPosition(node.getStart());
    const documentation = this.getDocumentation(node);
    const exported = this.isExported(node);

    return {
      name,
      filePath: sourceFile.fileName,
      parameters,
      returnType,
      dependencies,
      exported,
      documentation,
      location: {
        line: location.line + 1,
        column: location.character + 1,
      },
    };
  }

  private getDocumentation(node: ts.Node): string | undefined {
    const jsDocTags = ts.getJSDocTags(node);
    if (jsDocTags.length > 0) {
      return jsDocTags
        .map((tag) => tag.comment)
        .filter(Boolean)
        .join("\n");
    }

    // Try to get leading comments
    const sourceFile = node.getSourceFile();
    const fullText = sourceFile.getFullText();
    const nodeStart = node.getFullStart();
    const nodeEnd = node.getStart();
    const leadingTrivia = fullText.substring(nodeStart, nodeEnd);

    const commentMatch = leadingTrivia.match(/\/\*\*([\s\S]*?)\*\//);
    if (commentMatch) {
      return commentMatch[1]
        .split("\n")
        .map((line) => line.replace(/^\s*\*\s?/, ""))
        .join("\n")
        .trim();
    }

    return undefined;
  }

  private isExported(node: ts.Node): boolean {
    return !!node.modifiers?.some(
      (mod) => mod.kind === ts.SyntaxKind.ExportKeyword
    );
  }

  private isReactComponent(name: string, sourceFile: ts.SourceFile): boolean {
    // Simple heuristic: component names start with uppercase and file contains React imports
    if (!/^[A-Z]/.test(name)) return false;

    const sourceText = sourceFile.getFullText();
    return (
      sourceText.includes("import") &&
      (sourceText.includes("react") || sourceText.includes("React"))
    );
  }

  /**
   * Get all extracted information in a single call
   */
  public extractAll() {
    return {
      interfaces: this.extractInterfaces(),
      types: this.extractTypes(),
      enums: this.extractEnums(),
      functions: this.extractFunctions(),
      components: this.extractComponents(),
      hooks: this.extractHooks(),
    };
  }
}
