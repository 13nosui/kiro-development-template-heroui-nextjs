# Technology Stack

## Core Framework

- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Node.js** managed via mise (see `.mise.toml`)

## UI & Styling

- **HeroUI** - Primary component library (always prefer over custom components)
- **Tailwind CSS** - Utility-first CSS framework
- **Material UI Icons** - Standard icon library
- **Framer Motion** - Animation library

## Backend & Services

- **Firebase** - Authentication, Firestore database, storage
- **Vercel** - Deployment platform

## Development Tools

- **TypeScript** - Type safety with strict configuration
- **ESLint** - Code linting with custom configuration
- **Storybook** - Component development and documentation
- **Playwright** - End-to-end testing

## Security & Quality

- **Semgrep** - Security scanning
- **npm audit** - Dependency vulnerability scanning
- **DOMPurify** - XSS protection
- **Zod** - Runtime type validation

## Common Commands

### Development

```bash
# Start development server
pnpm dev

# Start Storybook
pnpm storybook

# Type checking
pnpm type-check

# Linting
pnpm lint
pnpm lint:check
```

### Build & Deploy

```bash
# Production build
pnpm build

# Start production server
pnpm start

# Build Storybook
pnpm build-storybook
```

### Security & Quality

```bash
# Security audit
pnpm security:audit
pnpm security:scan
pnpm security:full

# Environment validation
pnpm env:validate

# Documentation generation
pnpm docs:generate
pnpm docs:validate
```

## Package Manager

- **pnpm** is the preferred package manager
- Lock file: `pnpm-lock.yaml`

## Environment Setup

- Use **mise** for Node.js version management
- Environment variables must be validated before deployment
- See `.env.example` for required variables
