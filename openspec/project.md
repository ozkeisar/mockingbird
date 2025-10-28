# Project Context

## Purpose
Mockingbird is a desktop application that helps software developers test their apps without needing a real server or backend. It provides a comprehensive API mocking solution with features like:
- Multiple responses per route for scenario testing
- Presets for quick configuration switching
- Git integration for version control of mock data
- Proxy functionality to capture and mock real API calls
- API call monitoring and logging
- GraphQL and REST API support
- Built-in API for test automation
- Docker support for CI/CD integration

## Tech Stack

### Core Technologies
- **TypeScript** - Primary language with strict mode enabled
- **Electron** - Desktop application framework (v26.2.1)
- **React 18** - UI framework with React Router for navigation
- **Node.js** - Runtime (>=14.x required)
- **Express** - Backend HTTP server

### Frontend Stack
- **Material-UI (@mui)** - Component library for consistent UI
- **Zustand** - State management (lightweight alternative to Redux)
- **Monaco Editor** - Code editor component for JSON/GraphQL editing
- **Socket.io Client** - Real-time communication with backend
- **react-window** - Virtualization for large lists (logs)
- **notistack** - Toast notifications

### Backend Stack
- **Express** - HTTP server and routing
- **Socket.io** - Real-time bi-directional communication
- **simple-git** - Git operations for version control
- **GraphQL** - GraphQL API support
- **Swagger** - API documentation generation
- **Chokidar** - File system watching
- **Morgan** - HTTP request logging
- **CORS** - Cross-origin resource sharing

### Build & Development Tools
- **Webpack 5** - Module bundler with custom configs for main/renderer/preload
- **ts-node** - TypeScript execution for scripts
- **Jest** - Testing framework with ts-jest
- **ESLint** - Code linting (extends ERB config)
- **Prettier** - Code formatting (single quotes)
- **electron-builder** - Application packaging
- **Concurrently** - Running multiple build processes

### Analytics & Monitoring
- **Amplitude** - Analytics for browser and Node.js
- **electron-log** - Logging framework

## Project Conventions

### Code Style
- **TypeScript strict mode** enabled for type safety
- **Prettier** configuration: single quotes, standard formatting
- **ESLint** extends Electron React Boilerplate (ERB) config with custom overrides:
  - Unused imports/variables enforced via TypeScript ESLint
  - No default export requirement (named exports preferred)
  - Console statements allowed
  - Parameter reassignment allowed for convenience
  - Underscores allowed in variable names
- **Naming conventions**:
  - camelCase for variables, functions, and methods
  - PascalCase for components, classes, and types
  - Hash suffix for object dictionaries (e.g., `serverHash`, `routesHash`)
  - Manager suffix for singleton service classes (e.g., `projectsManager`)

### Architecture Patterns

#### Electron Multi-Process Architecture
- **Main Process** (`src/main/`): Electron app lifecycle, window management, IPC
- **Renderer Process** (`src/renderer/`): React UI application
- **Preload Scripts**: Bridge between main and renderer for secure IPC

#### Backend Architecture (Express)
- **Routers** (`src/backend/routers/`): Express route definitions
- **Controllers** (`src/backend/controllers/`): Socket.io event handlers
- **Actions** (`src/backend/actions/`): Business logic for operations
- **Events** (`src/backend/events/`): Event emitters for real-time updates
- **Managers** (`src/backend/managers/`): Singleton services (e.g., projectsManager)
- **Utils** (`src/backend/utils/`): Shared utilities (git, logger, analytics)

#### Frontend Architecture
- **Components** (`src/renderer/components/`): React components organized by feature
  - Dialogs: Modal components for user interactions
  - Details: Detail view components for different entities
  - Shared components in root
- **State** (`src/renderer/state/`): Zustand stores for global state
- **Hooks** (`src/renderer/hooks/`): Custom React hooks
- **Screens** (`src/renderer/screens/`): Top-level page components
- **Utils** (`src/renderer/utils/`): Frontend utilities

#### Data Persistence
- **Git-based storage**: All mock data stored in Git repositories
- **JSON files**: Project configuration and mock definitions
- **File system watching**: Chokidar monitors changes for hot-reload

#### Communication Patterns
- **Socket.io**: Real-time bidirectional communication between frontend and backend
- **Express REST API**: HTTP endpoints for operations
- **IPC**: Electron inter-process communication

### Testing Strategy
- **Jest** as test runner with jsdom environment
- **React Testing Library** for component testing
- **ts-jest** for TypeScript transformation
- **Coverage**: Tests located in `__tests__` directories adjacent to source
- **Mocks**: Monaco Editor and file system mocks in `.erb/mocks/`
- Manual testing emphasized for Electron desktop features

### Git Workflow
- **Main branch**: `main` (default branch for PRs)
- **Version management**: Semantic versioning (currently v1.5.3)
- **Commit messages**: Conventional commits encouraged
- **Git integration**: Built-in Git operations via simple-git
- **Migrations**: Version migration system in `src/backend/utils/migrations/`

## Domain Context

### API Mocking Concepts
- **Routes**: API endpoints (REST or GraphQL) with configurable responses
- **Responses**: Multiple response options per route for scenario testing
- **Parents**: Organizational folders for routes
- **Presets**: Saved configurations of route/response selections
- **Servers**: Individual mock server instances with their own port and routes
- **Projects**: Top-level containers for related servers and mocks

### Mock Server Lifecycle
1. Server creation with port assignment
2. Route/response definition
3. Server start (Express server spawned)
4. Request interception and mock response serving
5. Real-time logging of requests/responses

### GraphQL Support
- Full GraphQL schema support
- Query/mutation/subscription handling
- GraphQL Playground integration

### Proxy Mode
- Captures real API requests and responses
- Automatically creates mock definitions from captured data
- Useful for quickly bootstrapping mocks from existing APIs

## Important Constraints

### Technical Constraints
- **Electron compatibility**: Code must work in both main and renderer contexts
- **Node.js version**: Minimum Node.js 14.x, npm 7.x
- **Port availability**: Mock servers require available ports (user-configurable)
- **File system access**: Requires read/write access for Git repositories
- **Git dependency**: Git must be installed on the system
- **Native dependencies**: electron-rebuild required for native modules

### Licensing Constraints
- **Dual license**: AGPLv3 for open-source, commercial license available
- **CLA required**: Contributors must agree to Contributor License Agreement

### Platform Support
- **macOS**: Primary platform (arm64 and x64)
- **Windows**: NSIS installer
- **Linux**: AppImage distribution

### Build Constraints
- **TypeScript compilation**: Must pass `npm run tsc` without errors
- **Linting**: Must pass ESLint checks
- **Webpack build**: Complex multi-config webpack setup for different targets

## External Dependencies

### Required System Dependencies
- **Git**: Required for version control features
- **Node.js/npm**: Runtime and package management

### Key External Services (Optional)
- **Amplitude**: Analytics (can be disabled)
- **Firebase**: Authentication/cloud features (optional integration)
- **GitHub**: Repository hosting and releases

### Build-time Dependencies
- **Electron Builder**: Application packaging and distribution
- **Webpack**: Module bundling with multiple configurations
- **TypeScript Compiler**: Type checking and compilation

### Runtime External APIs
- **Swagger APIs**: Can import Swagger/OpenAPI definitions
- **GraphQL endpoints**: Can proxy and mock GraphQL services
- **REST APIs**: Can proxy and mock REST services
