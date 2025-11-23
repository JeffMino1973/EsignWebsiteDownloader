# Website Downloader Application

## Overview

This is a website downloader utility application that allows users to download complete websites including HTML, CSS, JavaScript, and images. The application provides a clean interface for submitting URLs, tracking download progress in real-time, and organizing downloaded files into convenient ZIP archives. Built with a focus on clarity and efficiency, it features a Linear-inspired minimal design system with Material Design feedback principles.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- Path aliases configured for clean imports (`@/`, `@shared/`, `@assets/`)

**State Management & Data Fetching:**
- TanStack Query (React Query) for server state management and caching
- Polling mechanism implemented for real-time download progress updates (2-second intervals for active downloads)
- Query invalidation pattern for optimistic UI updates after mutations

**UI Component System:**
- Shadcn UI component library with Radix UI primitives for accessibility
- Tailwind CSS for utility-first styling with custom design tokens
- CVA (Class Variance Authority) for component variant management
- Custom design system based on Linear's minimal aesthetic with spacious layouts and clear visual hierarchy

**Design Tokens:**
- Inter font family (Google Fonts) for all typography
- Comprehensive color system with HSL values supporting light/dark modes
- Consistent spacing scale (2, 4, 8, 12, 16) using Tailwind units
- Custom border radius values (sm: 3px, md: 6px, lg: 9px)

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript for type-safe API development
- RESTful API design pattern
- ESM (ES Modules) for modern JavaScript module system

**Data Storage:**
- In-memory storage implementation (MemStorage class) as the default storage layer
- Abstract IStorage interface allowing for future database implementations
- Drizzle ORM configured for PostgreSQL with schema definitions ready
- File system storage for downloaded assets in `/downloads` directory

**Download Service:**
- Asynchronous download processing with background job execution
- Cheerio for HTML parsing and resource extraction
- Axios for HTTP requests with 30-second timeout
- Archiver for ZIP file creation
- Active download tracking to prevent duplicate jobs
- Error handling with status updates (pending, downloading, completed, error)

**API Endpoints:**
- `GET /api/downloads` - Retrieve all download jobs
- `POST /api/downloads` - Create new download job
- `GET /api/downloads/:id` - Get specific download details
- `GET /api/downloads/:id/zip` - Download ZIP file (implied from routes)
- `DELETE /api/downloads/:id` - Remove download job (implied from mutations)

### Data Models

**Download Schema:**
- URL validation using Zod
- Status tracking (pending, downloading, completed, error)
- Progress metrics (totalFiles, downloadedFiles, fileSize)
- Timestamps (createdAt, completedAt)
- File structure stored as JSONB for hierarchical display
- Error message storage for failed downloads

**User Schema:**
- Basic authentication structure defined (username, password)
- UUID primary keys with PostgreSQL `gen_random_uuid()`

### Development & Deployment

**Development Environment:**
- Replit integration with custom plugins for runtime error overlay
- Hot Module Replacement (HMR) via Vite
- TypeScript compilation with strict mode enabled
- Request logging middleware with response time tracking

**Build Process:**
- Client build: Vite bundles React application to `dist/public`
- Server build: esbuild bundles Node.js server to `dist/index.js`
- Production mode uses compiled bundles with NODE_ENV=production

**Database Migrations:**
- Drizzle Kit configured for schema migrations
- Migration files stored in `/migrations` directory
- Push command available for direct schema synchronization

## External Dependencies

### Core Libraries
- **React Ecosystem:** react, react-dom (UI rendering)
- **TanStack Query:** Server state management and caching
- **Wouter:** Lightweight routing (alternative to React Router)

### UI & Styling
- **Radix UI:** Comprehensive set of accessible component primitives
- **Tailwind CSS:** Utility-first CSS framework
- **shadcn/ui:** Pre-built component patterns
- **Lucide React:** Icon library
- **date-fns:** Date formatting and manipulation

### Backend Services
- **Express:** HTTP server framework
- **Drizzle ORM:** Type-safe database toolkit
- **@neondatabase/serverless:** PostgreSQL driver for Neon serverless
- **Cheerio:** Server-side HTML parsing (jQuery-like API)
- **Axios:** HTTP client for making web requests
- **Archiver:** ZIP file creation

### Development Tools
- **TypeScript:** Type checking and compilation
- **Vite:** Build tool and dev server
- **esbuild:** Fast JavaScript bundler
- **tsx:** TypeScript execution for development

### Validation & Forms
- **Zod:** Schema validation library
- **React Hook Form:** Form state management
- **@hookform/resolvers:** Zod resolver for React Hook Form

### Database (Configured but Optional)
- **PostgreSQL:** Relational database (via Neon serverless driver)
- **Drizzle ORM:** Schema definition and query building
- Note: Application currently uses in-memory storage but is structured to support PostgreSQL