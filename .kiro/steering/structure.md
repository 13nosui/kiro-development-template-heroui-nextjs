# Project Structure

## Root Directory Organization

```
├── .kiro/                    # Kiro AI assistant configuration
├── .claude/                  # Claude AI commands and context
├── docs/                     # Comprehensive project documentation
├── src/                      # Source code
├── public/                   # Static assets
├── scripts/                  # Build and utility scripts
├── .storybook/              # Storybook configuration
└── issues/                   # Project issues and tasks
```

## Source Code Structure (`src/`)

```
src/
├── app/                     # Next.js App Router
│   ├── layout.tsx          # Root layout with HeroUI provider
│   ├── page.tsx            # Home page
│   ├── providers.tsx       # HeroUI and other providers
│   ├── globals.css         # Global styles
│   └── api/                # API routes
├── components/             # Reusable UI components
├── lib/                    # Utilities and configurations
│   ├── firebase.ts         # Firebase initialization
│   ├── auth-context.tsx    # Authentication context
│   ├── security.ts         # Security utilities
│   └── validation.ts       # Zod schemas
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
├── stories/                # Storybook stories
└── pages/                  # Legacy pages (if needed)
```

## Key Configuration Files

- **`package.json`** - Dependencies and scripts
- **`next.config.js`** - Next.js configuration with security headers
- **`tailwind.config.js`** - Tailwind CSS with HeroUI integration
- **`tsconfig.json`** - TypeScript configuration with strict settings
- **`eslint.config.mjs`** - ESLint configuration
- **`.cursorrules`** - Development guidelines and AI instructions

## Documentation Structure (`docs/`)

- **`api/`** - API documentation and OpenAPI specs
- **`architecture/`** - System architecture and design docs
- **`components/`** - Component documentation
- **`development/`** - Developer guides and best practices
- **`security/`** - Security implementation guides
- **`types/`** - Type definitions and data models

## Component Organization

### HeroUI Component Usage

- Always prefer HeroUI components over custom implementations
- Use Material UI Icons for consistent iconography
- Follow HeroUI's variant, size, and color prop patterns

### File Naming Conventions

- **Components**: PascalCase (e.g., `AuthForm.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useFigmaAPI.ts`)
- **Utilities**: camelCase (e.g., `api-client.ts`)
- **Types**: PascalCase interfaces/types (e.g., `UserProfile`)

### Import Organization

```typescript
// External libraries
import { Button, Input } from "@heroui/react";
import { Settings } from "@mui/icons-material";

// Internal utilities
import { validateEmail } from "@/lib/validation";

// Local components
import { AuthForm } from "./AuthForm";
```

## Environment Configuration

- **`.env.example`** - Template for environment variables
- **`.env`** - Local development environment (not in production)
- **`.env.local`** - Local overrides (gitignored)

## Security & Quality

- **`.semgrep.yml`** - Security scanning configuration
- **`scripts/security-check.js`** - Custom security validation
- **`scripts/validate-env.js`** - Environment variable validation

## Build Outputs

- **`.next/`** - Next.js build output (gitignored)
- **`dist/`** - Distribution files (gitignored)
- **`storybook-static/`** - Storybook build output (gitignored)
