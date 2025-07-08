# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Project Template** is an art book sharing service built with Next.js 14, HeroUI, and Firebase. The application allows users to share and discover art book content through a modern, accessible social platform interface powered by HeroUI's comprehensive component library.

## Key Technologies

- **Next.js 14** with App Router architecture
- **HeroUI** - Modern React component library for beautiful UIs
- **TypeScript** for type safety
- **Firebase** (Auth, Firestore, Storage) for backend services
- **NextAuth** with Google OAuth → Firebase Auth session bridging
- **Tailwind CSS** integrated with HeroUI
- **Zustand** for state management
- **Storybook** for HeroUI component development and customization
- **Playwright** for E2E testing

## Common Commands

```bash
# Development
pnpm dev                    # Start development server with HeroUI
pnpm storybook             # Start Storybook for HeroUI components

# Build & Production
pnpm build                 # Build for production
pnpm start                 # Start production server

# Quality Assurance
pnpm lint                  # Run ESLint
pnpm build-storybook       # Build Storybook
```

## Architecture Overview

### Directory Structure
- `src/app/` - Next.js App Router with grouped routes:
  - `layout.tsx` - Root layout with HeroUIProvider
  - `providers.tsx` - HeroUI theme configuration
  - `(auth)/` - Authentication pages using HeroUI forms
  - `(me)/` - User-specific pages with HeroUI layouts
  - `api/auth/` - NextAuth API routes
- `src/components/` - HeroUI-based custom components with Storybook stories
- `src/lib/` - Core utilities including Firebase configuration
- `src/store/` - Zustand state management
- `src/hooks/` - Custom React hooks
- `src/types/` - TypeScript type definitions

### Authentication Flow
The app uses a hybrid authentication system with HeroUI components:
1. NextAuth handles Google OAuth authentication using HeroUI forms
2. ID tokens are bridged to Firebase Auth for backend access
3. Session management handled through `src/lib/firebase.ts`
4. UI components use HeroUI's Button, Input, and Card components

### HeroUI Design System
- **Component Library**: Comprehensive HeroUI components for all UI elements
- **Theme System**: Centralized theme configuration in `src/app/providers.tsx`
- **Color System**: HeroUI's semantic color system (primary, secondary, success, warning, danger)
- **Size System**: Consistent sizing with sm, md, lg variants
- **Responsive Design**: Built-in responsive behavior with HeroUI components
- **Accessibility**: HeroUI's comprehensive a11y support out of the box

## Important Configuration

### HeroUI Setup
```tsx
// src/app/providers.tsx
import { HeroUIProvider } from "@heroui/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      {children}
    </HeroUIProvider>
  );
}
```

### Tailwind Integration
```js
// tailwind.config.js
const { heroui } = require("@heroui/react");

module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [heroui()],
};
```

### Firebase Services
- **Firestore**: Document database with security rules
- **Authentication**: Google OAuth integration
- **Storage**: File uploads with security rules
- **Environment Variables**: Firebase config in `.env.local`

## Development Guidelines

### HeroUI Component Usage
```tsx
// Use HeroUI components for all UI elements
import { Button, Input, Card, Avatar, Chip } from "@heroui/react";

// Prefer HeroUI props over custom styling
<Button color="primary" variant="solid" size="md">
  Action Button
</Button>

<Input
  type="email"
  label="Email"
  placeholder="Enter your email"
  variant="bordered"
  isRequired
/>

<Card className="max-w-[400px]">
  <CardBody>
    Content goes here
  </CardBody>
</Card>
```

### Styling Guidelines
- **HeroUI First**: Use HeroUI components for all UI elements
- **Props-Based Styling**: Leverage color, size, variant props instead of custom CSS
- **Theme Customization**: Use HeroUI's theme system for brand-specific styling
- **Minimal Custom CSS**: Avoid custom styling outside HeroUI's system
- **Responsive Design**: Rely on HeroUI's built-in responsive behavior

### Component Development
- All HeroUI customizations should have Storybook stories
- Use TypeScript interfaces for props
- Follow HeroUI component patterns
- Component naming: PascalCase (e.g., `CustomCard.tsx`)
- Prefer composition of HeroUI components over creating custom ones

### State Management
- Zustand for global state (see `src/store/`)
- React hooks for component-level state
- Firebase realtime updates where appropriate
- HeroUI's built-in state for component interactions

### Testing
- Storybook for HeroUI component testing and documentation
- Playwright for E2E testing
- HeroUI's accessibility features reduce need for manual a11y testing

## HeroUI Best Practices

### Component Selection
- **Forms**: Use Input, Select, Checkbox, RadioGroup, Switch
- **Navigation**: Use Navbar, Tabs, Breadcrumbs, Link
- **Data Display**: Use Card, Avatar, Chip, Table, User
- **Feedback**: Use Modal, Tooltip, Popover, Spinner
- **Actions**: Use Button for all interactive elements

### Theme Customization
```tsx
// Custom theme configuration
const customTheme = {
  extend: "dark",
  colors: {
    primary: {
      DEFAULT: "#3b82f6",
      foreground: "#ffffff",
    },
  },
};

<HeroUIProvider theme={customTheme}>
  {children}
</HeroUIProvider>
```

### Performance Optimization
- Use tree-shaking by importing only required HeroUI components
- Leverage HeroUI's optimized rendering
- Minimal custom CSS for better performance

## Security Considerations

- Firestore security rules protect user data
- Firebase Storage rules control file access
- Authentication tokens handled securely
- Environment variables for sensitive configuration
- HeroUI's built-in accessibility features improve security posture

---

When working with this codebase, prioritize using HeroUI components and follow the established patterns for a consistent, accessible, and maintainable application.
