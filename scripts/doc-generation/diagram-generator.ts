/**
 * Mermaid Diagram Generation Utilities
 *
 * This module provides utilities for generating Mermaid diagrams from code analysis,
 * including architecture diagrams, data flow diagrams, and dependency graphs.
 */

import * as fs from "fs";
import * as path from "path";
import {
  DependencyGraph,
  ArchitecturalPattern,
  APIEndpoint,
  ProjectStructure,
  SecurityPattern,
} from "./code-analyzer";
import {
  ExtractedInterface,
  ExtractedComponent,
  ExtractedHook,
} from "./ast-parser";

export interface DiagramConfig {
  theme?: "default" | "dark" | "forest" | "neutral";
  direction?: "TB" | "TD" | "BT" | "RL" | "LR";
  maxNodes?: number;
  includeExternal?: boolean;
}

export class DiagramGenerator {
  private outputDir: string;

  constructor(outputDir: string) {
    this.outputDir = outputDir;
    this.ensureOutputDirectory();
  }

  /**
   * Generate system architecture diagram
   */
  public generateArchitectureDiagram(
    structure: ProjectStructure,
    patterns: ArchitecturalPattern[],
    config: DiagramConfig = {}
  ): string {
    const { theme = "default", direction = "TB" } = config;

    let diagram = `graph ${direction}\n`;

    // Add theme
    if (theme !== "default") {
      diagram += `    %%{init: {'theme':'${theme}'}}%%\n`;
    }

    // Define main layers
    diagram += `    subgraph "Client Layer"\n`;
    diagram += `        UI[React Components]\n`;
    diagram += `        Hooks[Custom Hooks]\n`;
    diagram += `        Context[React Context]\n`;
    diagram += `    end\n\n`;

    diagram += `    subgraph "API Layer"\n`;
    diagram += `        NextAPI[Next.js API Routes]\n`;
    diagram += `        Middleware[Security Middleware]\n`;
    diagram += `        Validation[Input Validation]\n`;
    diagram += `    end\n\n`;

    diagram += `    subgraph "Service Layer"\n`;
    diagram += `        Auth[Authentication Service]\n`;
    diagram += `        FigmaAPI[Figma API Client]\n`;
    diagram += `        Security[Security Services]\n`;
    diagram += `    end\n\n`;

    diagram += `    subgraph "External Services"\n`;
    diagram += `        Firebase[Firebase Auth/Firestore]\n`;
    diagram += `        FigmaExt[Figma API]\n`;
    diagram += `        Storage[Firebase Storage]\n`;
    diagram += `    end\n\n`;

    // Add connections
    diagram += `    UI --> Hooks\n`;
    diagram += `    Hooks --> Context\n`;
    diagram += `    Context --> NextAPI\n`;
    diagram += `    NextAPI --> Middleware\n`;
    diagram += `    Middleware --> Validation\n`;
    diagram += `    Validation --> Auth\n`;
    diagram += `    Validation --> FigmaAPI\n`;
    diagram += `    Auth --> Firebase\n`;
    diagram += `    FigmaAPI --> FigmaExt\n`;
    diagram += `    Auth --> Storage\n`;

    this.saveDiagram("architecture-overview.mmd", diagram);
    return diagram;
  }

  /**
   * Generate component hierarchy diagram
   */
  public generateComponentDiagram(
    components: ExtractedComponent[],
    config: DiagramConfig = {}
  ): string {
    const { theme = "default", direction = "TB", maxNodes = 20 } = config;

    let diagram = `graph ${direction}\n`;

    if (theme !== "default") {
      diagram += `    %%{init: {'theme':'${theme}'}}%%\n`;
    }

    // Group components by directory
    const componentGroups = this.groupComponentsByDirectory(components);

    for (const [directory, comps] of Object.entries(componentGroups)) {
      if (comps.length === 0) continue;

      const groupName = this.sanitizeId(directory);
      diagram += `    subgraph "${directory}"\n`;

      const limitedComps = comps.slice(0, maxNodes);
      for (const comp of limitedComps) {
        const compId = this.sanitizeId(comp.name);
        diagram += `        ${compId}[${comp.name}]\n`;
      }

      diagram += `    end\n\n`;
    }

    // Add relationships (simplified)
    for (const comp of components.slice(0, maxNodes)) {
      const compId = this.sanitizeId(comp.name);

      // Add styling based on component type
      if (comp.name.includes("Form")) {
        diagram += `    ${compId} --> |uses| Validation[Input Validation]\n`;
      }
      if (comp.name.includes("Auth")) {
        diagram += `    ${compId} --> |uses| Firebase[Firebase Auth]\n`;
      }
    }

    this.saveDiagram("component-hierarchy.mmd", diagram);
    return diagram;
  }

  /**
   * Generate data flow diagram
   */
  public generateDataFlowDiagram(
    endpoints: APIEndpoint[],
    hooks: ExtractedHook[],
    config: DiagramConfig = {}
  ): string {
    const { theme = "default" } = config;

    let diagram = `sequenceDiagram\n`;

    if (theme !== "default") {
      diagram += `    %%{init: {'theme':'${theme}'}}%%\n`;
    }

    // Define participants
    diagram += `    participant U as User\n`;
    diagram += `    participant C as Component\n`;
    diagram += `    participant H as Hook\n`;
    diagram += `    participant API as API Route\n`;
    diagram += `    participant V as Validation\n`;
    diagram += `    participant S as Security\n`;
    diagram += `    participant EXT as External API\n\n`;

    // Generate common flow patterns
    diagram += `    U->>C: User Interaction\n`;
    diagram += `    C->>H: Call Custom Hook\n`;
    diagram += `    H->>API: HTTP Request\n`;
    diagram += `    API->>V: Validate Input\n`;
    diagram += `    V->>S: Security Check\n`;
    diagram += `    S->>API: Sanitized Data\n`;
    diagram += `    API->>EXT: External API Call\n`;
    diagram += `    EXT-->>API: Response\n`;
    diagram += `    API->>S: Sanitize Response\n`;
    diagram += `    S-->>API: Clean Data\n`;
    diagram += `    API-->>H: API Response\n`;
    diagram += `    H-->>C: Processed Data\n`;
    diagram += `    C-->>U: Updated UI\n`;

    this.saveDiagram("data-flow.mmd", diagram);
    return diagram;
  }

  /**
   * Generate authentication flow diagram
   */
  public generateAuthFlowDiagram(config: DiagramConfig = {}): string {
    const { theme = "default" } = config;

    let diagram = `sequenceDiagram\n`;

    if (theme !== "default") {
      diagram += `    %%{init: {'theme':'${theme}'}}%%\n`;
    }

    diagram += `    participant U as User\n`;
    diagram += `    participant AF as AuthForm\n`;
    diagram += `    participant AC as AuthContext\n`;
    diagram += `    participant FB as Firebase\n`;
    diagram += `    participant SEC as Security\n\n`;

    diagram += `    U->>AF: Enter credentials\n`;
    diagram += `    AF->>SEC: Validate & sanitize input\n`;
    diagram += `    SEC-->>AF: Validation result\n`;
    diagram += `    AF->>FB: Authenticate user\n`;
    diagram += `    FB-->>AF: Auth result\n`;
    diagram += `    AF->>AC: Update auth state\n`;
    diagram += `    AC-->>U: Redirect to dashboard\n`;

    this.saveDiagram("auth-flow.mmd", diagram);
    return diagram;
  }

  /**
   * Generate API endpoint diagram
   */
  public generateAPIEndpointDiagram(
    endpoints: APIEndpoint[],
    config: DiagramConfig = {}
  ): string {
    const { theme = "default", direction = "TB" } = config;

    let diagram = `graph ${direction}\n`;

    if (theme !== "default") {
      diagram += `    %%{init: {'theme':'${theme}'}}%%\n`;
    }

    // Group endpoints by base path
    const endpointGroups = this.groupEndpointsByPath(endpoints);

    for (const [basePath, eps] of Object.entries(endpointGroups)) {
      const groupId = this.sanitizeId(basePath);
      diagram += `    subgraph "${basePath}"\n`;

      for (const endpoint of eps) {
        const endpointId = this.sanitizeId(
          `${endpoint.method}_${endpoint.path}`
        );
        const methodColor = this.getMethodColor(endpoint.method);
        diagram += `        ${endpointId}["${endpoint.method} ${endpoint.path}"]\n`;
        diagram += `        ${endpointId} --> |${methodColor}| Handler${endpointId}[Handler]\n`;

        if (endpoint.authentication) {
          diagram += `        Handler${endpointId} --> Auth[Authentication]\n`;
        }
        if (endpoint.validation) {
          diagram += `        Handler${endpointId} --> Validation[Validation]\n`;
        }
      }

      diagram += `    end\n\n`;
    }

    this.saveDiagram("api-endpoints.mmd", diagram);
    return diagram;
  }

  /**
   * Generate dependency graph diagram
   */
  public generateDependencyDiagram(
    dependencyGraph: DependencyGraph,
    config: DiagramConfig = {}
  ): string {
    const { theme = "default", direction = "TB", maxNodes = 30 } = config;

    let diagram = `graph ${direction}\n`;

    if (theme !== "default") {
      diagram += `    %%{init: {'theme':'${theme}'}}%%\n`;
    }

    // Limit nodes to prevent overcrowding
    const limitedNodes = dependencyGraph.nodes.slice(0, maxNodes);
    const nodeIds = new Set(limitedNodes.map((n) => n.id));

    // Add nodes with styling based on type
    for (const node of limitedNodes) {
      const nodeId = this.sanitizeId(node.id);
      const shape = this.getNodeShape(node.type);
      const color = this.getNodeColor(node.type);

      diagram += `    ${nodeId}${shape}\n`;
      diagram += `    ${nodeId} --> |${color}| ${nodeId}\n`;
    }

    // Add edges (only for nodes that exist)
    const limitedEdges = dependencyGraph.edges.filter(
      (edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to)
    );

    for (const edge of limitedEdges.slice(0, 50)) {
      // Limit edges too
      const fromId = this.sanitizeId(edge.from);
      const toId = this.sanitizeId(edge.to);
      diagram += `    ${fromId} --> |${edge.type}| ${toId}\n`;
    }

    this.saveDiagram("dependency-graph.mmd", diagram);
    return diagram;
  }

  /**
   * Generate security architecture diagram
   */
  public generateSecurityDiagram(
    securityPatterns: SecurityPattern[],
    config: DiagramConfig = {}
  ): string {
    const { theme = "default", direction = "TB" } = config;

    let diagram = `graph ${direction}\n`;

    if (theme !== "default") {
      diagram += `    %%{init: {'theme':'${theme}'}}%%\n`;
    }

    diagram += `    subgraph "Security Layers"\n`;
    diagram += `        Input[User Input]\n`;
    diagram += `        Validation{Input Validation}\n`;
    diagram += `        Sanitization[XSS Protection]\n`;
    diagram += `        Authentication[Firebase Auth]\n`;
    diagram += `        Authorization[Access Control]\n`;
    diagram += `        Processing[Request Processing]\n`;
    diagram += `    end\n\n`;

    diagram += `    Input --> Validation\n`;
    diagram += `    Validation -->|Valid| Sanitization\n`;
    diagram += `    Validation -->|Invalid| Reject[Reject Request]\n`;
    diagram += `    Sanitization --> Authentication\n`;
    diagram += `    Authentication -->|Authenticated| Authorization\n`;
    diagram += `    Authentication -->|Unauthenticated| Reject\n`;
    diagram += `    Authorization -->|Authorized| Processing\n`;
    diagram += `    Authorization -->|Unauthorized| Reject\n`;

    // Add security pattern implementations
    for (const pattern of securityPatterns) {
      const patternId = this.sanitizeId(pattern.type);
      diagram += `    ${patternId}[${pattern.type}]\n`;
    }

    this.saveDiagram("security-architecture.mmd", diagram);
    return diagram;
  }

  /**
   * Generate type relationship diagram
   */
  public generateTypeRelationshipDiagram(
    interfaces: ExtractedInterface[],
    config: DiagramConfig = {}
  ): string {
    const { theme = "default", direction = "TB", maxNodes = 25 } = config;

    let diagram = `graph ${direction}\n`;

    if (theme !== "default") {
      diagram += `    %%{init: {'theme':'${theme}'}}%%\n`;
    }

    const limitedInterfaces = interfaces.slice(0, maxNodes);

    // Add interface nodes
    for (const iface of limitedInterfaces) {
      const ifaceId = this.sanitizeId(iface.name);
      diagram += `    ${ifaceId}[${iface.name}]\n`;

      // Add inheritance relationships
      if (iface.extends) {
        for (const parent of iface.extends) {
          const parentId = this.sanitizeId(parent);
          diagram += `    ${parentId} --> |extends| ${ifaceId}\n`;
        }
      }
    }

    this.saveDiagram("type-relationships.mmd", diagram);
    return diagram;
  }

  /**
   * Generate all diagrams
   */
  public generateAllDiagrams(data: {
    structure: ProjectStructure;
    patterns: ArchitecturalPattern[];
    endpoints: APIEndpoint[];
    components: ExtractedComponent[];
    hooks: ExtractedHook[];
    interfaces: ExtractedInterface[];
    dependencyGraph: DependencyGraph;
    securityPatterns: SecurityPattern[];
  }): Record<string, string> {
    const diagrams: Record<string, string> = {};

    diagrams.architecture = this.generateArchitectureDiagram(
      data.structure,
      data.patterns
    );
    diagrams.components = this.generateComponentDiagram(data.components);
    diagrams.dataFlow = this.generateDataFlowDiagram(
      data.endpoints,
      data.hooks
    );
    diagrams.authFlow = this.generateAuthFlowDiagram();
    diagrams.apiEndpoints = this.generateAPIEndpointDiagram(data.endpoints);
    diagrams.dependencies = this.generateDependencyDiagram(
      data.dependencyGraph
    );
    diagrams.security = this.generateSecurityDiagram(data.securityPatterns);
    diagrams.types = this.generateTypeRelationshipDiagram(data.interfaces);

    return diagrams;
  }

  private ensureOutputDirectory(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  private saveDiagram(filename: string, content: string): void {
    const filePath = path.join(this.outputDir, filename);
    fs.writeFileSync(filePath, content, "utf-8");
  }

  private sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9_]/g, "_").replace(/^[0-9]/, "_$&");
  }

  private groupComponentsByDirectory(
    components: ExtractedComponent[]
  ): Record<string, ExtractedComponent[]> {
    const groups: Record<string, ExtractedComponent[]> = {};

    for (const component of components) {
      const dir = path.dirname(component.filePath).split("/").pop() || "root";
      if (!groups[dir]) groups[dir] = [];
      groups[dir].push(component);
    }

    return groups;
  }

  private groupEndpointsByPath(
    endpoints: APIEndpoint[]
  ): Record<string, APIEndpoint[]> {
    const groups: Record<string, APIEndpoint[]> = {};

    for (const endpoint of endpoints) {
      const basePath = endpoint.path.split("/")[1] || "root";
      if (!groups[basePath]) groups[basePath] = [];
      groups[basePath].push(endpoint);
    }

    return groups;
  }

  private getMethodColor(method: string): string {
    const colors: Record<string, string> = {
      GET: "blue",
      POST: "green",
      PUT: "orange",
      DELETE: "red",
      PATCH: "purple",
    };
    return colors[method] || "gray";
  }

  private getNodeShape(type: string): string {
    const shapes: Record<string, string> = {
      component: "[Component]",
      hook: "((Hook))",
      utility: "{Utility}",
      service: "[[Service]]",
      type: "(Type)",
    };
    return shapes[type] || "[Node]";
  }

  private getNodeColor(type: string): string {
    const colors: Record<string, string> = {
      component: "blue",
      hook: "green",
      utility: "orange",
      service: "purple",
      type: "red",
    };
    return colors[type] || "gray";
  }
}
