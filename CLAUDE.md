# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UnidevFront is an Angular 19 application with Server-Side Rendering (SSR) support. The project uses Angular's standalone components architecture and is configured for both client-side and server-side rendering with prerendering enabled.

## Development Commands

### Development Server
- `npm start` or `ng serve` - Start development server at http://localhost:4200/
- `ng serve --host 0.0.0.0` - Serve on all network interfaces

### Building
- `npm run build` or `ng build` - Production build (default configuration)
- `ng build --configuration development` - Development build
- `npm run watch` - Development build with file watching

### Testing
- `npm test` or `ng test` - Run unit tests with Karma
- No e2e framework is currently configured

### Server-Side Rendering
- `npm run serve:ssr:UnidevFront` - Serve the SSR version from built files
- The SSR server runs on port 4000 by default (configurable via PORT env variable)

## Architecture

### Core Structure
- **Standalone Components**: Uses Angular's standalone component architecture (no NgModules)
- **SSR Configuration**: Full server-side rendering with Express.js backend
- **Styling**: SCSS is configured as the default style preprocessor
- **TypeScript**: Strict mode enabled with comprehensive compiler options

### Key Files
- `src/app/app.config.ts` - Main application configuration with providers
- `src/app/app.config.server.ts` - Server-specific configuration 
- `src/app/app.routes.ts` - Routing configuration (currently empty)
- `src/server.ts` - Express server for SSR with CommonEngine
- `src/main.server.ts` - Server-side bootstrap
- `src/main.ts` - Client-side bootstrap

### SSR Implementation
The application uses Angular's SSR with:
- Express.js server handling requests
- CommonEngine for server-side rendering
- Static file serving from `/browser` directory
- Client hydration with event replay enabled

### TypeScript Configuration
- Strict mode enabled with additional strict checks
- ES2022 target with bundler module resolution
- Angular-specific compiler options for strict templates and injection

## Code Generation

Use Angular CLI schematics for consistent code generation:
- `ng generate component [name]` - Generate new components (SCSS styles by default)
- `ng generate --help` - List all available schematics
- Components use `app-` prefix as defined in angular.json

## Build Configuration

### Production Build
- Bundle budgets: 500kB warning, 1MB error for initial bundles
- Component style budgets: 4kB warning, 8kB error
- Output hashing enabled for cache busting

### Development Build  
- No optimization for faster builds
- Source maps enabled
- License extraction disabled

## Project Architecture Structure

The project follows a domain-driven architecture with clear separation of concerns:

### Directory Structure

```
src/app/
├── core/                    # Singleton services, interceptors, and guards
│   ├── services/           # Global services (auth.service.ts)
│   ├── interceptors/       # HTTP interceptors (auth.interceptor.ts)
│   └── guards/            # Route guards (auth.guard.ts)
├── shared/                 # Reusable components and utilities
│   ├── components/        # Generic UI components (button, modal, table)
│   ├── models/           # Shared data models and interfaces
│   ├── pipes/            # Custom pipes
│   └── directives/       # Custom directives
├── features/              # Feature modules organized by domain
│   ├── users/            # User management domain
│   │   ├── pages/        # User-related pages/views
│   │   ├── components/   # User-specific components
│   │   └── services/     # User-related API services
│   ├── products/         # Product management domain
│   └── dashboard/        # Dashboard domain
└── environments/         # Environment configurations
```

### Architecture Principles

#### Core Module (`src/app/core/`)
- Contains singleton services loaded once during app initialization
- Authentication service with JWT token management
- HTTP interceptors for automatic token attachment
- Route guards for protecting authenticated routes
- Export barrel file: `src/app/core/index.ts`

#### Shared Module (`src/app/shared/`)
- Reusable UI components with no business logic
- Common data models and interfaces
- Utility pipes and directives
- Example: `ButtonComponent` with variants, sizes, and loading states
- Export barrel file: `src/app/shared/index.ts`

#### Feature Modules (`src/app/features/`)
- Domain-specific functionality organized by business context
- Each feature contains:
  - `pages/` - Route components representing full pages
  - `components/` - Feature-specific child components
  - `services/` - Domain-specific API services
- Example: Users feature with list page, user service for CRUD operations
- Export barrel files: `src/app/features/[feature]/index.ts`

#### Environment Configuration
- Development environment: `src/environments/environment.ts`
  - API URL: `http://localhost:3000/api`
  - Logging enabled, analytics disabled
- Production environment: `src/environments/environment.prod.ts`
  - API URL: `https://api.yourdomain.com/api`
  - Logging disabled, analytics enabled

### Development Guidelines

- Use standalone components architecture (no NgModules)
- Import specific exports from barrel files for cleaner imports
- Feature services should handle domain-specific API calls
- Shared components should be generic and reusable
- Core services should be application-wide singletons
- Environment variables should be used for configuration

## Animations with Anime.js

The project includes Anime.js for powerful, performant animations throughout the application.

### Animation Service

The `AnimationService` (`src/app/core/services/animation.service.ts`) provides a comprehensive set of pre-built animation methods:

#### Basic Animations
- `fadeIn()` / `fadeOut()` - Opacity transitions
- `slideInUp()` / `slideInDown()` / `slideInLeft()` / `slideInRight()` - Slide animations
- `scaleIn()` / `scaleOut()` - Scale transitions
- `rotateIn()` - Rotation animations

#### Interactive Animations
- `bounce()` - Bounce effect
- `shake()` - Shake effect (useful for errors)
- `pulse()` - Continuous pulse animation
- `buttonHover()` / `buttonHoverOut()` - Button hover states

#### Advanced Animations
- `staggerFadeIn()` - Staggered animations for multiple elements
- `pageEnter()` / `pageExit()` - Page transition animations
- `loadingSpinner()` - Loading spinner animation
- `custom()` - Custom animation with full Anime.js configuration
- `createTimeline()` - Timeline-based sequential animations

### Usage Examples

#### In Components
```typescript
import { AnimationService } from '../core/services/animation.service';

constructor(private animationService: AnimationService) {}

// Simple fade in
this.animationService.fadeIn('.my-element', 800);

// Staggered animation for lists
this.animationService.staggerFadeIn('.list-item', 100);

// Custom animation
this.animationService.custom({
  targets: '.custom-element',
  translateX: [0, 100],
  rotate: '1turn',
  duration: 1000,
  easing: 'easeInOutSine'
});
```

#### Automatic Component Animations
- **ButtonComponent**: Includes hover effects and click animations (can be disabled with `[animate]="false"`)
- **LoaderComponent**: Automatic spinning animation with fade-in message
- **User List**: Page enter animations, staggered row animations, error shake effects

### Animation Guidelines

- Use the AnimationService instead of direct Anime.js imports for consistency
- Apply `opacity: 0` initial styles for fade-in animations
- Use `setTimeout()` when animating elements that are conditionally rendered
- Disable animations on disabled/loading states
- Consider performance on mobile devices - use shorter durations if needed

### Installation Details

- **Library**: `animejs` v4.1.3
- **TypeScript Types**: `@types/animejs` v3.1.13
- **Service Location**: `src/app/core/services/animation.service.ts`
- **Import**: `import { AnimationService } from '../core/services/animation.service';`