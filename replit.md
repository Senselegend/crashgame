# CrashGame - Demo Mode

## Overview

CrashGame is a browser-based multiplier betting game where players predict when a flying rocket will crash. Players set their bet amount and auto-stop multiplier, then watch as the multiplier increases in real-time until the rocket crashes at a random point. The goal is to cash out before the crash to secure winnings based on the current multiplier.

This is a demo application using virtual credits (no real money) with full game mechanics, animations, and statistics tracking.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom game-themed color variables
- **State Management**: React hooks with local storage persistence
- **Routing**: Wouter for lightweight client-side routing
- **Animations**: Canvas-based rocket flight animation with real-time multiplier visualization

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript with ES modules
- **Database**: Drizzle ORM configured for PostgreSQL (ready for implementation)
- **Storage**: Currently using in-memory storage with interface for easy database migration
- **API**: RESTful endpoints under `/api` prefix (skeleton implemented)

### Key Technologies
- **React Query**: For server state management and caching
- **Zod**: Schema validation for type-safe data handling
- **Canvas API**: Custom game visualization and animations
- **Crypto API**: Cryptographically secure random number generation for fair gameplay
- **Local Storage**: Client-side persistence of game state and user data

## Key Components

### Game Engine (`useGameState` hook)
- **Game Logic**: Implements exponential multiplier formula: `e^(0.0001 * t) * (1 - house_edge)`
- **RNG System**: Uses Web Crypto API for secure random crash point generation
- **Auto-Stop Mechanism**: Configurable multipliers from x1.01 to x50.00
- **Statistics Tracking**: Win rate, max multiplier, net profit, total games played
- **Bonus Systems**: Daily bonus, level progression, insurance for consecutive losses

### Canvas Animation System
- **Real-time Rendering**: 60fps game loop with rocket movement and multiplier curve
- **Visual Effects**: Gradient trails, particle effects, explosion animations
- **Responsive Design**: Adapts to different screen sizes and orientations
- **Performance Optimized**: Efficient rendering with proper cleanup

### User Interface Components
- **GameControls**: Bet amount input, auto-stop configuration, preset buttons
- **GameHistory**: Last 20 games with color-coded win/loss indicators
- **GameStats**: Real-time statistics display with win rate and profit tracking
- **Toast Notifications**: User feedback for game events and bonuses

### Schema Design
```typescript
// Shared schemas for type safety
- GameResult: Individual game outcome data
- UserData: Player balance, level, wagered amounts
- UserStats: Aggregated performance metrics
- GameState: Current game session state
```

## Data Flow

1. **Game Initialization**: Load user data from localStorage, initialize game state
2. **Game Start**: Generate secure random crash point, start multiplier calculation loop
3. **Real-time Updates**: Update multiplier every 100ms, render canvas animation
4. **Auto-Stop Logic**: Check if current multiplier reaches user's target
5. **Game End**: Calculate winnings/losses, update statistics, save to localStorage
6. **State Persistence**: All game data persists across browser sessions

## External Dependencies

### Core Dependencies
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI components for accessibility
- **drizzle-orm**: Type-safe database queries
- **@neondatabase/serverless**: PostgreSQL driver for serverless environments
- **zod**: Runtime type validation
- **wouter**: Lightweight React router

### UI Dependencies
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Conditional styling utility
- **cmdk**: Command palette component
- **embla-carousel-react**: Carousel component

### Development Dependencies
- **vite**: Fast build tool and dev server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for Node.js

## Deployment Strategy

### Development
- **Command**: `npm run dev`
- **Port**: 5000 (configurable)
- **Features**: Hot reload, error overlay, source maps

### Production Build
- **Client**: Vite builds optimized bundle to `dist/public`
- **Server**: esbuild bundles Express server to `dist/index.js`
- **Assets**: Static files served from build directory

### Replit Configuration
- **Modules**: nodejs-20, web, postgresql-16
- **Autoscale**: Configured for automatic scaling
- **Port Mapping**: Internal 5000 → External 80

### Database Setup
The application is configured for PostgreSQL with Drizzle ORM:
- Database URL required in environment variables
- Migration files generated in `./migrations`
- Schema defined in `./shared/schema.ts`
- Push schema with `npm run db:push`

## Changelog

```
Changelog:
- June 23, 2025. Initial setup
- June 23, 2025. Fixed graph curve to properly follow rocket movement
- June 23, 2025. Changed rocket icon to UFO (🛸) 
- June 23, 2025. Added PostgreSQL database with user and game history tables
- June 23, 2025. Implemented hybrid storage (database with memory fallback)
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```