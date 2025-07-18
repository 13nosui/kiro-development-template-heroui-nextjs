# Documentation Search

Use this page to search through all documentation content.

## Search Interface

<div class="search-container">
  <input type="text" id="doc-search" placeholder="Search documentation..." />
  <button id="search-button">Search</button>
  <div id="search-results"></div>
</div>

<script>
// Documentation search functionality
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('doc-search');
  const searchButton = document.getElementById('search-button');
  const resultsContainer = document.getElementById('search-results');
  
  // Documentation index for search
  const docIndex = [
    { title: "Project Overview", path: "project-overview.md", keywords: ["overview", "introduction", "summary", "roadmap", "technology stack"] },
    { title: "Developer Guide", path: "development/developer-guide.md", keywords: ["setup", "installation", "onboarding", "workflow", "development"] },
    { title: "Build System & Tools", path: "development/build-system-and-tools.md", keywords: ["build", "npm", "scripts", "tools", "configuration"] },
    { title: "System Overview", path: "architecture/system-overview.md", keywords: ["architecture", "system", "design", "structure"] },
    { title: "Component Architecture", path: "architecture/component-architecture.md", keywords: ["components", "design", "structure", "hierarchy"] },
    { title: "Data Flow", path: "architecture/data-flow.md", keywords: ["data", "flow", "state", "management"] },
    { title: "Authentication Flows", path: "architecture/authentication-flows.md", keywords: ["auth", "authentication", "login", "firebase"] },
    { title: "API Integration Flows", path: "architecture/api-integration-flows.md", keywords: ["api", "integration", "figma", "external"] },
    { title: "Custom Hooks", path: "development/custom-hooks.md", keywords: ["hooks", "react", "custom", "useFigmaAPI", "useAuth"] },
    { title: "Utility Functions", path: "development/utility-functions.md", keywords: ["utilities", "functions", "helpers", "validation", "security"] },
    { title: "Testing & Quality Assurance", path: "development/testing-and-quality-assurance.md", keywords: ["testing", "qa", "quality", "tests"] },
    { title: "API Overview", path: "api/README.md", keywords: ["api", "endpoints", "rest", "services"] },
    { title: "OpenAPI Specification", path: "api/openapi.yaml", keywords: ["openapi", "swagger", "api", "specification"] },
    { title: "API Usage Examples", path: "api/usage-examples.md", keywords: ["api", "examples", "usage", "code"] },
    { title: "Error Handling", path: "api/error-handling.md", keywords: ["errors", "handling", "exceptions", "troubleshooting"] },
    { title: "Security & Rate Limiting", path: "api/security-and-rate-limiting.md", keywords: ["security", "rate limiting", "throttling", "protection"] },
    { title: "Component Catalog", path: "components/component-catalog.md", keywords: ["components", "ui", "interface", "react"] },
    { title: "Security Architecture", path: "security/security-architecture.md", keywords: ["security", "architecture", "protection", "threats"] },
    { title: "Type Definitions Catalog", path: "types/type-definitions-catalog.md", keywords: ["types", "typescript", "interfaces", "definitions"] },
    { title: "Data Models & Schemas", path: "types/data-models-and-schemas.md", keywords: ["models", "schemas", "data", "structures"] },
    { title: "Environment & Deployment", path: "deployment/environment-and-deployment.md", keywords: ["deployment", "environment", "production", "staging"] },
    { title: "GitHub Secrets Guide", path: "github-secrets-guide.md", keywords: ["github", "secrets", "ci", "cd"] },
    { title: "AI Implementation Rules", path: "AI_IMPLEMENTATION_RULES.md", keywords: ["ai", "implementation", "rules", "guidelines"] },
    { title: "Refactoring Guide", path: "REFACTORING_GUIDE.md", keywords: ["refactoring", "code", "improvement", "technical debt"] },
    { title: "Claude Command Guide", path: "CLAUDE_CODE_SLASH_COMMANDS_GUIDE.md", keywords: ["claude", "ai", "commands", "slash"] }
  ];
  
  // Search function
  function performSearch(query) {
    if (!query) {
      resultsContainer.innerHTML = '<p>Please enter a search term</p>';
      return;
    }
    
    query = query.toLowerCase();
    const results = docIndex.filter(item => {
      return item.title.toLowerCase().includes(query) || 
             item.keywords.some(keyword => keyword.toLowerCase().includes(query));
    });
    
    displayResults(results, query);
  }
  
  // Display search results
  function displayResults(results, query) {
    if (results.length === 0) {
      resultsContainer.innerHTML = `<p>No results found for "${query}"</p>`;
      return;
    }
    
    let html = `<h3>Search Results for "${query}"</h3><ul>`;
    results.forEach(item => {
      html += `<li><a href="#/${item.path}">${item.title}</a></li>`;
    });
    html += '</ul>';
    
    resultsContainer.innerHTML = html;
  }
  
  // Event listeners
  searchButton.addEventListener('click', () => {
    performSearch(searchInput.value);
  });
  
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch(searchInput.value);
    }
  });
});
</script>

<style>
.search-container {
  margin: 20px 0;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 5px;
}

#doc-search {
  width: 70%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

#search-button {
  padding: 10px 15px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-left: 10px;
}

#search-results {
  margin-top: 20px;
}

#search-results ul {
  list-style-type: none;
  padding: 0;
}

#search-results li {
  margin: 10px 0;
  padding: 10px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

#search-results a {
  color: #4285f4;
  text-decoration: none;
  font-weight: bold;
}

#search-results a:hover {
  text-decoration: underline;
}
</style>

## Search Tips

- Use specific keywords for more accurate results
- Search for technology names like "React", "TypeScript", or "Firebase"
- Search for concepts like "authentication", "components", or "deployment"
- Use partial words to find more results

## Popular Searches

- [Authentication](search.md?q=authentication)
- [Components](search.md?q=components)
- [API](search.md?q=api)
- [Security](search.md?q=security)
- [TypeScript](search.md?q=typescript)
- [Deployment](search.md?q=deployment)

## Can't Find What You're Looking For?

If you can't find the information you need:

1. Check the [Documentation Index](index.md) for a complete list of documentation
2. Review the [Project Overview](project-overview.md) for high-level information
3. Consult the [Developer Guide](development/developer-guide.md) for common development tasks
4. Submit a documentation request through GitHub Issues
