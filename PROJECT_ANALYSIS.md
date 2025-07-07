# 📊 Project Template Analysis

## 🎯 Project Overview

**Project Template** is a Next.js-based web application that serves as an art book sharing service with integrated Figma Dev Mode MCP (Model Context Protocol) server capabilities. The project combines a social media-like platform for sharing visual content with advanced design system integration.

## 🏗️ Architecture & Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: Custom component library with Storybook integration
- **State Management**: Zustand for client-side state
- **Authentication**: NextAuth.js
- **Font**: Noto Sans JP + Roboto Mono

### Backend & Services
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **API**: Next.js API Routes
- **Figma Integration**: Custom MCP server for Figma webhook handling

### Development Tools
- **Component Development**: Storybook v8.6.14
- **Version Management**: mise (Node.js, pnpm)
- **Testing**: Playwright
- **Build**: Webpack 5
- **Deployment**: Vercel

## 📁 Project Structure

```
project-template/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── (auth)/       # Authentication pages
│   │   ├── (me)/         # User profile pages
│   │   ├── api/          # API routes
│   │   └── figma-test/   # Figma integration testing
│   ├── components/       # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility libraries (Firebase, etc.)
│   ├── pages/           # Pages router (for API routes)
│   ├── store/           # Zustand state management
│   ├── stories/         # Storybook stories
│   └── types/           # TypeScript type definitions
├── public/              # Static assets
├── .storybook/          # Storybook configuration
├── docs/                # Documentation
└── scripts/             # Build/deployment scripts
```

## 🎨 Design System

### Design Philosophy
- **Figma-First**: All designs originate from Figma
- **Token-Based**: Custom CSS variables for consistency
- **Component-Driven**: Modular, reusable components
- **Accessibility**: Built-in a11y support

### Color System
```css
/* Core Colors */
--surface
--on-surface  
--outline
--surface-tint
--error
--on-error

/* Brand Colors */
--project-template-blue-70
--project-template-blue-50
```

### Spacing System
```css
--space-4    /* 4px */
--space-8    /* 8px */
--space-12   /* 12px */
--space-16   /* 16px */
--space-24   /* 24px */
--space-32   /* 32px */
--space-48   /* 48px */
--space-64   /* 64px */
```

### Typography
```css
--font-size-large + --line-height-large
--font-size-medium + --line-height-medium  
--font-size-small + --line-height-small
```

## 🔧 Key Components

### UI Components
- **AuthForm**: Authentication forms with validation
- **Button**: Primary, secondary, and variant buttons
- **TextField**: Form inputs with validation states
- **ImageCropper**: Image editing functionality
- **PostGridView**: Content grid layout
- **FAB**: Floating action button
- **IconButton**: Icon-based interactions
- **Switch/Checkbox**: Form controls
- **TagDeleteButton**: Tag management UI

### Layout Components
- **PostPageWrapper**: Page container with consistent styling
- **FixedBottomContainer**: Bottom navigation/actions
- **Backdrop**: Modal/overlay backgrounds
- **Divider**: Visual separators

## 📊 Data Models

### BookPost Interface
```typescript
interface BookPost {
  id: string;
  imageUrls: string[];
  title: string;
  comment: string;
  tags?: string[];
  userId: string;
  createdAt?: any; // Firestore Timestamp
}
```

### Firebase Collections
- **posts**: User-generated art book posts
- **users**: User profile information
- **collections**: User collections/favorites

## 🔗 Figma Integration

### MCP Server Features
- **Webhook Handling**: Processes Figma file update events
- **API Access**: Fetches Figma node data via REST API
- **Signature Verification**: Secure webhook validation
- **Event Processing**: Handles various Figma event types

### Integration Points
- `/api/figma-mcp` endpoint for webhooks
- Environment variables for Figma tokens
- Real-time design sync capabilities

## 🚀 Development Workflow

### Prerequisites
```bash
# Install mise
brew install mise

# Install dependencies
mise install
pnpm install
```

### Available Scripts
```bash
pnpm dev          # Development server
pnpm build        # Production build
pnpm start        # Production server
pnpm lint         # ESLint
pnpm storybook    # Component development
```

### Environment Variables
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Figma Integration
FIGMA_WEBHOOK_SECRET=
FIGMA_PERSONAL_ACCESS_TOKEN=
```

## 🎯 Core Features

### User Features
- **Authentication**: Firebase Auth with Google integration
- **Post Creation**: Multi-image upload with cropping
- **Content Sharing**: Public/private post sharing
- **Tagging System**: Categorization and discovery
- **User Profiles**: Personal galleries and collections

### Admin Features
- **Content Management**: Post moderation capabilities
- **Analytics**: User engagement tracking
- **Design Sync**: Real-time Figma integration

### Technical Features
- **Responsive Design**: Mobile-first approach
- **Performance**: Optimized image handling
- **SEO**: Next.js built-in optimization
- **Security**: Firebase security rules

## 📈 Development Guidelines

### Code Quality
- TypeScript strict mode enabled
- ESLint configuration for consistency
- Component-first architecture
- Comprehensive Storybook coverage

### Design Implementation Rules
- **Figma Fidelity**: Pixel-perfect implementation required
- **Token Usage**: Only use predefined design tokens
- **No Arbitrary Values**: Avoid custom CSS values
- **Component Reuse**: Prefer existing components

### Performance Considerations
- Image optimization via Next.js
- Lazy loading for large content
- Firebase query optimization
- Webpack bundle optimization

## 🔮 Future Roadmap

### Planned Features
- Enhanced Figma integration
- Advanced search and filtering
- Social features (following, likes)
- Mobile app development
- Premium subscription features

### Technical Improvements
- Migration to latest Next.js features
- Enhanced testing coverage
- Performance monitoring
- Accessibility improvements

## 🚨 Known Limitations

### Current Issues
- Limited mobile responsiveness in some components
- Basic search functionality
- No offline support
- Limited accessibility features

### Technical Debt
- Some components need refactoring
- Firebase rules need optimization
- Bundle size optimization needed
- Test coverage improvement required

## 📚 Documentation

### Available Documentation
- `README.md`: Basic setup and overview
- `README.dev.md`: Comprehensive development guide
- `DESIGN_GUIDELINE.md`: Design system documentation
- `CLAUDE.md`: AI integration guidelines

### Component Documentation
- Storybook stories for all components
- TypeScript interfaces for all props
- Usage examples in documentation

---

This analysis provides a comprehensive overview of the Project Template project structure, technologies, and implementation details. The project demonstrates a well-structured approach to building a modern web application with strong design system integration and advanced Figma connectivity.
