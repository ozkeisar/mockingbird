# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mockingbird is an Electron-based API mocking tool that helps developers test applications without needing real backend servers. It provides a desktop application for creating and managing mock API responses with Git-based storage.

## Technology Stack

- **Frontend**: React 18 with TypeScript, Material-UI, Zustand for state management
- **Desktop**: Electron with main/renderer process architecture
- **Backend**: Express server with Socket.IO for real-time communication
- **Build Tools**: Webpack, TypeScript, ESLint
- **Testing**: Jest with React Testing Library

## Essential Commands

```bash
# Development
npm start              # Start Electron app in development mode
npm run start:backend  # Start standalone backend server
npm run start:renderer # Start renderer process only

# Building
npm run build          # Build both main and renderer processes
npm run build:backend  # Build standalone backend server
npm run build:web      # Build web version
npm run package        # Package Electron app for distribution

# Code Quality
npm run lint           # Run ESLint on all TypeScript/JavaScript files
npm run tsc            # Run TypeScript type checking
npm test               # Run Jest tests

# Swagger
npm run generateSwagger # Generate Swagger documentation
```

## Architecture Overview

### Directory Structure

- **src/main/** - Electron main process (handles app lifecycle, native APIs, IPC)
- **src/renderer/** - React frontend application
  - **components/** - Reusable UI components
  - **screens/** - Main application screens
  - **state/** - Zustand stores for state management
  - **utils/** - Frontend utility functions
- **src/backend/** - Express server and API logic
  - **routers/** - API route handlers (project, server, routes, presets, etc.)
  - **managers/** - Business logic managers
  - **server/** - Mock server implementation
  - **events/** - Event handling system
  - **utils/** - Backend utility functions
- **src/types/** - Shared TypeScript type definitions
- **src/consts/** - Shared constants
- **.erb/** - Electron React Boilerplate build configurations

### Key Architectural Patterns

1. **Three-Process Architecture**: 
   - Main process (Electron) manages app lifecycle
   - Renderer process (React) handles UI
   - Backend process (Express) manages mock servers and data

2. **IPC Communication**: Main and renderer processes communicate via Electron IPC for file system operations and native features

3. **Socket.IO Events**: Real-time communication between backend and frontend for server status updates and API monitoring

4. **Git-Based Storage**: All mock data stored in Git repositories for version control without external servers

5. **Multiple Server Support**: Can run multiple mock servers on different ports for different projects

## Important Implementation Details

- Mock responses are stored as JSON files in Git repositories
- Each project can have multiple servers with different configurations
- Presets allow switching between different response sets
- GraphQL support includes schema introspection and mock responses
- Proxy functionality captures real API calls to generate mocks
- Built-in API monitoring shows all incoming requests in real-time

## Mock Server Architecture

### Core Components

The mock server implementation (`src/backend/server/`) consists of three main components:

1. **Server Manager (index.ts)**: 
   - Creates Express servers for each project
   - Manages server lifecycle (start/stop)
   - Routes requests to appropriate handlers
   - Integrates middleware for logging, CORS, delays

2. **Request Handler (utils.ts)**:
   - Response selection logic based on request parameters
   - Three response types: `obj` (static JSON), `func` (JavaScript function), `proxy` (forward to real server)
   - Parameter matching for conditional responses (body, query, params)
   - Cookie and header manipulation for proxy responses

3. **Logger (logger.ts)**:
   - Tracks all incoming requests and responses
   - Broadcasts logs via Socket.IO for real-time monitoring
   - Maintains request context throughout the lifecycle

### Data Model

```typescript
// Core routing structure
RouteParent {
  id: string
  type: 'Rest' | 'GraphQl'
  path: string                    // Base path like /api
  routesHash: {                   // REST routes
    [routeId]: Route {
      method: 'get' | 'post' | 'put' | 'delete' | 'patch'
      routePath: string           // Specific path like /users/:id
      activeResponseId: string    // Currently selected response
      responsesHash: {            // Multiple responses per route
        [responseId]: {
          type: 'obj' | 'func' | 'proxy'
          res?: { code, data, headers }  // For 'obj' type
          exec?: string                   // JavaScript code for 'func' type
          url?: string                    // Target URL for 'proxy' type
          blockProxy?: boolean            // Prevent proxy in forceProxy mode
        }
      }
      // Conditional response selection
      paramType?: 'body' | 'query' | 'params'
      paramKey?: string
      paramValue?: string
    }
  }
  graphQlRouteHash: {            // GraphQL routes
    [routeId]: GraphQlRoute {
      name: string               // Query/Mutation name
      type: 'Query' | 'Mutation'
      activeResponseId: string
      responsesHash: {
        [responseId]: {
          type: 'obj' | 'func' | 'proxy'
          res?: any              // GraphQL response object
          exec?: string          // Resolver function code
          url?: string           // GraphQL endpoint for proxy
          schema: string         // GraphQL schema definition
          schemaTypeName: string // Return type name
        }
      }
    }
  }
}
```

### Request Flow

1. **Incoming Request** → Logger assigns unique ID → Delay middleware (optional)
2. **Route Matching**: 
   - GraphQL routes handled first (if applicable)
   - REST routes matched by method and path
   - Conditional routes evaluated based on parameters
3. **Response Selection**:
   - Check active response for the matched route
   - If `forceProxy` enabled and response allows, forward to proxy
   - Execute response based on type (obj/func/proxy)
4. **Response Processing**:
   - Apply headers and status codes
   - Handle cookie rewriting for proxy responses
   - Log response details
5. **Fallback to Proxy**: If no route matches and proxy URL configured

### GraphQL Implementation

- **Schema Generation**: Dynamically builds GraphQL schema from route definitions
- **Resolver Mapping**: Maps GraphQL queries/mutations to response handlers
- **Nested Schemas**: Supports nested schema paths for complex APIs
- **Playground**: Includes GraphQL Playground at `/graphql/playground`
- **Type System**: Uses `scalar Any` for flexible typing, generates types from JSON schemas

### Advanced Features

1. **Response Functions**: JavaScript functions executed at runtime with access to:
   - Request object (req)
   - Response object (res)
   - Custom console that broadcasts to UI

2. **Proxy Features**:
   - Cookie domain rewriting
   - Cookie simplification (remove attributes)
   - Cookie duplication for testing
   - Header forwarding and manipulation
   - Request/response logging

3. **Server Settings**:
   ```typescript
   ServerSettings {
     port: number
     proxyBaseUrl?: string        // Fallback proxy target
     forceProxy?: boolean         // Always try proxy first
     delay?: number               // Artificial delay (ms)
     reWriteCookieDomain?: boolean
     simplifyCookies?: boolean
     duplicateCookies?: boolean
   }
   ```

### Adding New Features

To add new mock server features:

1. **New Response Types**: Extend `ResponseType` in `src/types/routes.ts`, add handler in `handleResponse()` function
2. **New Parameter Matching**: Add to `ParamType`, update `getSelectedRoute()` logic
3. **New Middleware**: Add to server initialization in `startServer()` function
4. **New GraphQL Features**: Modify `buildGraphQLData()` and schema generation
5. **New Proxy Features**: Update `buildRequestOptions()` and `updateResponseHeaders()`
6. **New Logging**: Extend `ServerLog` type and update `sendLog()` function

### Storage Structure

Mock data is stored in Git repositories with this structure:
```
project-name/
├── servers/
│   ├── server1/
│   │   ├── settings.json
│   │   └── parents/
│   │       ├── rest-api.json
│   │       └── graphql-api.json
│   └── server2/
└── presets/
    └── preset1.json
```

## Route & Response Management UI Architecture

### UI Component Hierarchy

```
Main Screen (src/renderer/screens/main/)
├── TopBar - Project selection and server controls
├── MainSideBar - Tab selection (Routes/Presets/Logs)
├── SideBar - Tree navigation for selected tab
│   ├── Server nodes
│   ├── Parent (route collection) nodes
│   └── Route/GraphQL query nodes
├── Details Panel - Main content area
│   ├── ServerDetails - Server configuration
│   ├── ParentDetails - Route collection info
│   ├── RouteDetails - REST route with responses
│   ├── GraphqlRouteDetails - GraphQL route with responses
│   ├── PresetFolderDetails - Preset folder management
│   └── PresetDetails - Individual preset configuration
├── DevTools - Console and API monitoring
└── BottomBar - Status information
```

### State Management (Zustand)

The UI uses two main stores:

1. **GeneralStore** (`src/renderer/state/general/`):
   ```typescript
   {
     // Navigation state
     selectedTab: 'routes' | 'presets' | 'logs' | null
     selectedType: 'route' | 'preset' | null
     selectedRouteId: string | null
     selectedParentId: string | null
     selectedServerName: string | null
     
     // Server state
     isServerUp: boolean
     host: string | null
     
     // App state
     appSettings: AppSettings
     projectsNameList: string[]
   }
   ```

2. **ProjectStore** (`src/renderer/state/project/`):
   ```typescript
   {
     activeProjectName: string | null
     serversHash: ServersHash  // All servers and their routes
     presetFoldersHash: PresetsFolderHash
     projectSettings: ProjectSettings
     
     // Git state
     currentBranch: string
     branches: string[]
     hasDiffs: boolean
     isGitInit: boolean
   }
   ```

### Route Management Components

1. **RouteDialog** (`src/renderer/components/dialogs/routeDialog/`):
   - Create/edit REST routes
   - Configure method, path, parameters
   - Set conditional response matching (body/query/params)

2. **RouteDetails** (`src/renderer/components/details/routeDetails/`):
   - Display selected route information
   - List all responses for the route
   - Switch active response
   - Add/edit/delete responses
   - Show route URL for testing

3. **ResponseDialog** (`src/renderer/components/dialogs/responseDialog/`):
   - Create/edit responses
   - Three response types:
     - **Object**: Static JSON with status code and headers
     - **Function**: JavaScript code with req/res access
     - **Proxy**: Forward to specific URL
   - Real-time validation (JSON syntax, JS syntax, URL format)
   - Monaco editor for code/JSON editing
   - BlockProxy option to prevent proxy in forceProxy mode

4. **ResponseDetails** (`src/renderer/components/details/routeDetails/responseDetails/`):
   - Display response content with syntax highlighting
   - Visual indicator for active response
   - Quick actions: edit, delete, set active

### GraphQL Management Components

1. **GraphqlRouteDialog** (`src/renderer/components/dialogs/graphqlRouteDialog/`):
   - Create/edit GraphQL queries and mutations
   - Define resolver name and type

2. **GraphqlResponseDialog** (`src/renderer/components/dialogs/graphqlResponseDialog/`):
   - Schema definition editor
   - Response data configuration
   - Function resolver support

3. **GraphqlRouteDetails** (`src/renderer/components/details/graphqlRouteDetails/`):
   - Display GraphQL route with schema
   - Manage multiple responses
   - Schema visualization

### Data Flow Patterns

1. **Route Selection Flow**:
   ```
   SideBar (tree click) 
   → setSelectedRoute (GeneralStore)
   → Details component renders based on selection
   → Fetch route data from ProjectStore.serversHash
   ```

2. **Response Update Flow**:
   ```
   ResponseDialog (save)
   → useResponseActions hook
   → Socket.IO event (UPDATE_ROUTES_FILE)
   → Backend updates file
   → Socket.IO broadcast
   → ProjectStore.updateRoute
   → UI re-renders
   ```

3. **Real-time Updates**:
   - All changes emit Socket.IO events to backend
   - Backend broadcasts changes to all connected clients
   - Stores update via Socket.IO listeners
   - React components re-render automatically via Zustand

### Custom Hooks

1. **useSelectedRoute**: Derives current route from stores
2. **useSelectedPreset**: Derives current preset from stores
3. **useRouteActions**: CRUD operations for routes
4. **useResponseActions**: CRUD operations for responses
5. **useResizeElement**: Handle panel resizing

### UI Interaction Patterns

1. **Tree Navigation**:
   - Expandable tree structure for servers/parents/routes
   - Search/filter functionality
   - Visual indicators for route methods (GET, POST, etc.)
   - Icons for GraphQL vs REST

2. **Response Management**:
   - Multiple responses per route
   - Active response highlighting
   - Drag-and-drop support (planned)
   - Quick switching between responses

3. **Editor Integration**:
   - Monaco editor for code/JSON
   - Syntax validation on-the-fly
   - Auto-formatting
   - Theme support (VSCode dark)

4. **Preset System**:
   - Save current server state as preset
   - Apply presets to quickly switch configurations
   - Folder organization for presets
   - Preset validation before deletion

### Adding New UI Features

To add new route/response management features:

1. **New Response Type**:
   - Add type to `ResponseType` in types
   - Update `ResponseDialog` with new UI controls
   - Add rendering logic to `ResponseDetails`
   - Update validation in dialog's `useEffect`

2. **New Route Features**:
   - Extend `Route` interface in types
   - Update `RouteDialog` form
   - Add UI elements to `RouteDetails`
   - Update Socket.IO events if needed

3. **New UI Panel**:
   - Create component in `src/renderer/components/details/`
   - Add selection logic to `Details` component
   - Update store with new selection state
   - Add tree node type in `SideBar`

4. **New State Management**:
   - Add to appropriate Zustand store
   - Create actions for state updates
   - Add Socket.IO event handlers
   - Update affected components

## Development Notes

- Always generate Swagger documentation before building (`npm run generateSwagger`)
- The app uses Electron React Boilerplate (ERB) as its foundation
- TypeScript strict mode is enabled - ensure proper typing
- ESLint is configured with custom rules (see .eslintrc.js)
- Tests use Jest with React Testing Library for component testing
- Mock server uses `eval()` for executing response functions - ensure proper sandboxing in future updates
- UI uses Material-UI (MUI) v5 for components
- Monaco Editor for code editing experiences
- Socket.IO for real-time updates between UI and backend