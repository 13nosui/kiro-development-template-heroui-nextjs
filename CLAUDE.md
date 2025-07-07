# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Project Template** is an art book sharing service built with Next.js 14 and Firebase. The application allows users to share and discover art book content through a social platform interface.

## Key Technologies

- **Next.js 14** with App Router architecture
- **TypeScript** for type safety
- **Firebase** (Auth, Firestore, Storage) for backend services
- **NextAuth** with Google OAuth → Firebase Auth session bridging
- **Tailwind CSS** with comprehensive design token system
- **Zustand** for state management
- **Storybook** for component development
- **Playwright** for E2E testing

## Common Commands

```bash
# Development
npm run dev                  # Start development server
npm run storybook           # Start Storybook on port 6006

# Build & Production
npm run build               # Build for production
npm run start               # Start production server

# Quality Assurance
npm run lint                # Run ESLint
npm run build-storybook     # Build Storybook
```

## Architecture Overview

### Directory Structure
- `src/app/` - Next.js App Router with grouped routes:
  - `(auth)/` - Authentication pages (login, register, verify)
  - `(me)/` - User-specific pages (home, mypage, settings)
  - `api/auth/` - NextAuth API routes
- `src/components/` - Reusable UI components with Storybook stories
- `src/lib/` - Core utilities including Firebase configuration
- `src/store/` - Zustand state management
- `src/hooks/` - Custom React hooks
- `src/types/` - TypeScript type definitions

### Authentication Flow
The app uses a hybrid authentication system:
1. NextAuth handles Google OAuth authentication
2. ID tokens are bridged to Firebase Auth for backend access
3. Session management handled through `src/lib/firebase.ts`

### Design System
- CSS custom properties defined in `src/app/globals.css`
- Design tokens for colors (`--color-*`), spacing (`--space-*`), and typography
- Tailwind CSS with custom configuration using CSS variables
- Mobile-first responsive design (max-width: 480px)
- Comprehensive component library documented in Storybook

## Important Configuration

### Firebase Services
- **Firestore**: Document database with security rules
- **Authentication**: Google OAuth integration
- **Storage**: File uploads with security rules
- **Environment Variables**: Firebase config in `.env.local`

### Figma Integration
- Figma Dev Mode MCP server at `/api/figma-mcp`
- Webhook integration for design-to-code workflow
- Requires `FIGMA_WEBHOOK_SECRET` and `FIGMA_PERSONAL_ACCESS_TOKEN` in environment

## Development Guidelines

### Styling
- Use CSS custom properties: `text-[var(--on-surface)]`
- Follow design tokens defined in `globals.css`
- Prefer Tailwind utilities over custom CSS
- Reference `DESIGN_GUIDELINE.md` for comprehensive styling rules

### Components
- All components should have Storybook stories
- Use TypeScript interfaces for props
- Follow existing patterns in `src/components/`
- Component naming: PascalCase (e.g., `PostCard.tsx`)

### State Management
- Zustand for global state (see `src/store/`)
- React hooks for component-level state
- Firebase realtime updates where appropriate

### Testing
- Storybook for component testing and documentation
- Playwright for E2E testing
- No unit testing framework currently configured

## Security Considerations

- Firestore security rules protect user data
- Firebase Storage rules control file access
- Authentication tokens handled securely
- Environment variables for sensitive configuration
