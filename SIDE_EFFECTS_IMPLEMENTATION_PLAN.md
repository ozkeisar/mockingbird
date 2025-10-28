# Side Effects Feature Implementation Plan

## Implementation Status

### ✅ Completed Phases:
- **Phase 1**: Data Models & Types ✅
- **Phase 2**: Backend WebSocket Server ✅
- **Phase 3**: Side Effects Execution Engine ✅
- **Phase 4**: Testing Infrastructure (Backend) ✅
- **Phase 5**: UI Components - Response Dialog ✅
- **Phase 6**: UI Components - Side Effect Dialog ✅
- **Phase 7**: Server Settings UI Updates ✅

### 🚧 Remaining Work:
- **Phase 8**: Testing & Monitoring (WebSocket Monitor UI)
- **Phase 9**: Integration & Testing
- **Phase 10**: Documentation

## Overview
Add a "side effects" feature to Mockingbird that allows triggering additional actions when a mock endpoint is called. Starting with WebSocket support, with architecture ready for future extensions (Kafka, REST, GraphQL, gRPC).

## Core Principles
- Each mock server has its own WebSocket server on a different port
- Side effects execute in parallel with the response (non-blocking)
- Side effect failures don't affect the HTTP response
- JSON-configurable (no code execution for now)
- All WebSocket messages broadcast to all connected clients

## Phase 1: Data Models & Types

### 1.1 Create Type Definitions
**File**: `src/types/sideEffects.ts`

```typescript
export type SideEffectType = 'websocket' | 'kafka' | 'rest' | 'graphql' | 'grpc';
export type WebSocketEventType = 'single' | 'sequence';

export interface SideEffect {
  id: string;
  type: SideEffectType;
  name: string;
  description?: string;
  enabled: boolean;
  delay?: number; // milliseconds before execution
  config: WebSocketConfig; // Will be union type when adding more types
}

export interface WebSocketConfig {
  eventType: WebSocketEventType;
  messages: WebSocketMessage[];
}

export interface WebSocketMessage {
  id: string;
  event: string;      // Socket.IO event name
  payload: any;       // JSON payload
  delay?: number;     // delay before this message (for sequences)
}

export interface SideEffectExecutionLog {
  timestamp: number;
  sideEffectId: string;
  sideEffectName: string;
  status: 'success' | 'error';
  error?: string;
  details?: any;
}
```

### 1.2 Update Route Response Types
**File**: `src/types/routes.ts`

Add to `RouteResponse` and `GraphQlRouteResponse`:
```typescript
sideEffects?: SideEffect[];
```

**Tasks**:
- [x] Create `src/types/sideEffects.ts` with type definitions ✅
- [x] Update `RouteResponse` interface in `src/types/routes.ts` ✅
- [x] Update `GraphQlRouteResponse` interface ✅
- [x] Export side effects types from `src/types/index.ts` ✅

## Phase 2: Backend WebSocket Server

### 2.1 WebSocket Server Manager
**File**: `src/backend/server/websocketServer.ts`

```typescript
import { Server as SocketIOServer } from 'socket.io';
import * as http from 'http';

const websocketServers: Map<string, {
  io: SocketIOServer;
  server: http.Server;
  port: number;
}> = new Map();

export const startWebSocketServer = (
  serverName: string,
  port: number
): SocketIOServer => {
  // Create HTTP server and Socket.IO instance
  // Store in map with serverName as key
  // Return Socket.IO instance
};

export const stopWebSocketServer = (serverName: string) => {
  // Close and cleanup WebSocket server
};

export const getWebSocketServer = (serverName: string): SocketIOServer | null => {
  // Return existing WebSocket server for broadcasts
};

export const broadcastWebSocketMessage = (
  serverName: string,
  event: string,
  payload: any
) => {
  // Get server and broadcast message to all clients
};
```

### 2.2 Update Server Settings
**File**: `src/types/routes.ts`

Add to `ServerSettings`:
```typescript
websocketPort?: number;  // WebSocket server port
websocketEnabled?: boolean;
```

### 2.3 Integrate WebSocket with Mock Server
**File**: `src/backend/server/index.ts`

In `startServer()`:
```typescript
// After creating Express server
if (serverSettings.websocketEnabled && serverSettings.websocketPort) {
  startWebSocketServer(serverName, serverSettings.websocketPort);
}
```

In `closeProjectServers()`:
```typescript
// Also close WebSocket servers
websocketServers.forEach((_, serverName) => {
  stopWebSocketServer(serverName);
});
```

**Tasks**:
- [x] Create `websocketServer.ts` with WebSocket management functions ✅
- [x] Update `ServerSettings` type with WebSocket configuration ✅
- [x] Integrate WebSocket server lifecycle with mock server ✅
- [x] Add WebSocket connection logging ✅
- [x] Handle WebSocket client connections/disconnections ✅

## Phase 3: Side Effects Execution Engine

### 3.1 Side Effects Executor
**File**: `src/backend/server/sideEffectsExecutor.ts`

```typescript
import { SideEffect, SideEffectExecutionLog } from '../../types/sideEffects';
import { broadcastWebSocketMessage } from './websocketServer';
import { emitGlobalSocketMessage } from '../socket';
import { EVENT_KEYS } from '../../types/events';

export const executeSideEffects = async (
  sideEffects: SideEffect[],
  serverName: string,
  req: Request,
  res: Response
): Promise<void> => {
  // Execute all enabled side effects in parallel
  const promises = sideEffects
    .filter(effect => effect.enabled)
    .map(effect => executeSingleSideEffect(effect, serverName));
  
  // Don't await - fire and forget
  Promise.allSettled(promises).then(results => {
    // Log results for monitoring
  });
};

const executeSingleSideEffect = async (
  sideEffect: SideEffect,
  serverName: string
): Promise<void> => {
  const log: SideEffectExecutionLog = {
    timestamp: Date.now(),
    sideEffectId: sideEffect.id,
    sideEffectName: sideEffect.name,
    status: 'success'
  };

  try {
    if (sideEffect.delay) {
      await sleep(sideEffect.delay);
    }

    switch (sideEffect.type) {
      case 'websocket':
        await executeWebSocketSideEffect(sideEffect.config, serverName);
        break;
      default:
        throw new Error(`Unsupported side effect type: ${sideEffect.type}`);
    }
  } catch (error) {
    log.status = 'error';
    log.error = error.message;
  }

  // Emit log to UI for monitoring
  emitGlobalSocketMessage(EVENT_KEYS.SIDE_EFFECT_LOG, log);
};

const executeWebSocketSideEffect = async (
  config: WebSocketConfig,
  serverName: string
): Promise<void> => {
  if (config.eventType === 'single') {
    const message = config.messages[0];
    if (message) {
      broadcastWebSocketMessage(serverName, message.event, message.payload);
    }
  } else if (config.eventType === 'sequence') {
    for (const message of config.messages) {
      if (message.delay) {
        await sleep(message.delay);
      }
      broadcastWebSocketMessage(serverName, message.event, message.payload);
    }
  }
};
```

### 3.2 Integrate with Response Handler
**File**: `src/backend/server/utils.ts`

Update `handleResponse()`:
```typescript
// After sending response, before end of function
if (response.sideEffects?.length) {
  // Execute in background, don't await
  executeSideEffects(response.sideEffects, serverName, req, res);
}
```

**Tasks**:
- [x] Create `sideEffectsExecutor.ts` with execution logic ✅
- [x] Implement WebSocket side effect execution ✅
- [x] Add execution logging system ✅
- [x] Integrate with response handler ✅
- [x] Add error handling and recovery ✅
- [x] Implement sleep/delay utility function ✅

## Phase 4: Testing Infrastructure

### 4.1 Side Effects Test API
**File**: `src/backend/routers/sideEffects.ts`

```typescript
router.post('/test-side-effect', async (req, res) => {
  const { sideEffect, serverName } = req.body;
  
  try {
    await executeSingleSideEffect(sideEffect, serverName);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/websocket-clients/:serverName', async (req, res) => {
  // Return count of connected WebSocket clients
});
```

**Tasks**:
- [x] Create side effects router ✅
- [x] Implement test endpoint ✅
- [x] Add WebSocket client monitoring endpoint ✅
- [x] Add to main router configuration ✅

## Phase 5: UI Components - Response Dialog

### 5.1 Side Effects Section in Response Dialog
**File**: `src/renderer/components/dialogs/responseDialog/responseDialog.tsx`

Add new state:
```typescript
const [sideEffects, setSideEffects] = useState<SideEffect[]>(
  data?.sideEffects || []
);
```

Add UI section:
```typescript
<Accordion>
  <AccordionSummary>
    <Typography>Side Effects ({sideEffects.length})</Typography>
  </AccordionSummary>
  <AccordionDetails>
    <SideEffectsList
      sideEffects={sideEffects}
      onAdd={handleAddSideEffect}
      onEdit={handleEditSideEffect}
      onDelete={handleDeleteSideEffect}
      onToggle={handleToggleSideEffect}
      onTest={handleTestSideEffect}
    />
  </AccordionDetails>
</Accordion>
```

### 5.2 Side Effects List Component
**File**: `src/renderer/components/sideEffects/SideEffectsList.tsx`

```typescript
interface Props {
  sideEffects: SideEffect[];
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onTest: (sideEffect: SideEffect) => void;
}

export function SideEffectsList({ ... }: Props) {
  return (
    <div>
      <Button startIcon={<AddIcon />} onClick={onAdd}>
        Add Side Effect
      </Button>
      
      {sideEffects.map(effect => (
        <Card key={effect.id}>
          <CardContent>
            <Typography>{effect.name}</Typography>
            <Chip label={effect.type} />
            <Switch checked={effect.enabled} onChange={() => onToggle(effect.id)} />
            
            <IconButton onClick={() => onTest(effect)}>
              <PlayArrowIcon />
            </IconButton>
            <IconButton onClick={() => onEdit(effect.id)}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => onDelete(effect.id)}>
              <DeleteIcon />
            </IconButton>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

**Tasks**:
- [x] Add side effects state to ResponseDialog ✅
- [x] Create SideEffectsList component ✅
- [x] Add accordion section to dialog ✅
- [x] Implement add/edit/delete handlers ✅
- [x] Add test functionality ✅

## Phase 6: UI Components - Side Effect Dialog

### 6.1 Side Effect Dialog
**File**: `src/renderer/components/dialogs/sideEffectDialog/sideEffectDialog.tsx`

```typescript
interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (sideEffect: SideEffect) => void;
  data?: SideEffect;
  serverName: string;
}

export function SideEffectDialog({ ... }: Props) {
  const [type, setType] = useState<SideEffectType>('websocket');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [delay, setDelay] = useState(0);
  const [websocketConfig, setWebsocketConfig] = useState<WebSocketConfig>({
    eventType: 'single',
    messages: []
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {data ? 'Edit Side Effect' : 'Add Side Effect'}
      </DialogTitle>
      
      <DialogContent>
        <TextField label="Name" value={name} onChange={...} />
        <TextField label="Description" value={description} onChange={...} />
        
        <Select label="Type" value={type} onChange={...}>
          <MenuItem value="websocket">WebSocket</MenuItem>
          {/* Future: other types */}
        </Select>
        
        <TextField 
          label="Delay (ms)" 
          type="number" 
          value={delay} 
          onChange={...} 
        />
        
        {type === 'websocket' && (
          <WebSocketConfigEditor
            config={websocketConfig}
            onChange={setWebsocketConfig}
          />
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
}
```

### 6.2 WebSocket Configuration Editor
**File**: `src/renderer/components/sideEffects/WebSocketConfigEditor.tsx`

```typescript
interface Props {
  config: WebSocketConfig;
  onChange: (config: WebSocketConfig) => void;
}

export function WebSocketConfigEditor({ config, onChange }: Props) {
  return (
    <div>
      <ToggleButtonGroup value={config.eventType} onChange={...}>
        <ToggleButton value="single">Single Message</ToggleButton>
        <ToggleButton value="sequence">Message Sequence</ToggleButton>
      </ToggleButtonGroup>
      
      {config.eventType === 'single' ? (
        <WebSocketMessageEditor
          message={config.messages[0]}
          onChange={(msg) => onChange({ ...config, messages: [msg] })}
        />
      ) : (
        <WebSocketSequenceEditor
          messages={config.messages}
          onChange={(msgs) => onChange({ ...config, messages: msgs })}
        />
      )}
    </div>
  );
}
```

### 6.3 WebSocket Message Editor
**File**: `src/renderer/components/sideEffects/WebSocketMessageEditor.tsx`

```typescript
interface Props {
  message?: WebSocketMessage;
  onChange: (message: WebSocketMessage) => void;
}

export function WebSocketMessageEditor({ message, onChange }: Props) {
  const [event, setEvent] = useState(message?.event || '');
  const [payload, setPayload] = useState(
    JSON.stringify(message?.payload || {}, null, 2)
  );
  const [delay, setDelay] = useState(message?.delay || 0);

  return (
    <div>
      <TextField
        label="Event Name"
        value={event}
        onChange={(e) => setEvent(e.target.value)}
        fullWidth
      />
      
      <Typography>Payload (JSON)</Typography>
      <MonacoEditor
        value={payload}
        onChange={setPayload}
        language="json"
        height="200px"
      />
      
      <TextField
        label="Delay (ms)"
        type="number"
        value={delay}
        onChange={(e) => setDelay(Number(e.target.value))}
      />
    </div>
  );
}
```

**Tasks**:
- [x] Create SideEffectDialog component ✅
- [x] Create WebSocketConfigEditor component ✅
- [x] Create WebSocketMessageEditor component ✅
- [x] Create WebSocketSequenceEditor for multiple messages (integrated in ConfigEditor) ✅
- [x] Add JSON validation for payloads ✅
- [x] Implement save/cancel logic ✅

## Phase 7: Server Settings UI Updates

### 7.1 Update Server Settings Dialog
**File**: `src/renderer/components/dialogs/serverDialog/serverDialog.tsx`

Add WebSocket configuration:
```typescript
<TextField
  label="WebSocket Port"
  type="number"
  value={websocketPort}
  onChange={(e) => setWebsocketPort(Number(e.target.value))}
  helperText="Port for WebSocket server (side effects)"
/>

<FormControlLabel
  control={
    <Switch
      checked={websocketEnabled}
      onChange={(e) => setWebsocketEnabled(e.target.checked)}
    />
  }
  label="Enable WebSocket Server"
/>
```

**Tasks**:
- [x] Add WebSocket port field to server settings ✅
- [x] Add WebSocket enabled toggle ✅
- [x] Update server settings save logic ✅
- [x] Add port validation (not conflicting) ✅

## Phase 8: Testing & Monitoring

### 8.1 WebSocket Test Client
**File**: `src/renderer/components/devTools/WebSocketMonitor.tsx`

```typescript
export function WebSocketMonitor({ serverName, port }: Props) {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  
  useEffect(() => {
    const socket = io(`http://localhost:${port}`);
    
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    
    // Listen to all events
    socket.onAny((event, ...args) => {
      setMessages(prev => [...prev, { event, data: args, timestamp: Date.now() }]);
    });
    
    return () => socket.close();
  }, [port]);
  
  return (
    <div>
      <Chip 
        label={connected ? 'Connected' : 'Disconnected'} 
        color={connected ? 'success' : 'error'} 
      />
      
      <div>
        {messages.map((msg, i) => (
          <div key={i}>
            <Typography>{msg.event}</Typography>
            <JsonView value={msg.data} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 8.2 Side Effects Log Viewer
Add to DevTools to show side effect execution logs.

**Tasks**:
- [ ] Create WebSocketMonitor component
- [ ] Add to DevTools tabs
- [ ] Create side effects log viewer
- [ ] Add Socket.IO event listener for logs
- [ ] Add clear/filter functionality

## Phase 9: Integration & Testing

### 9.1 End-to-End Testing
**File**: `src/__tests__/sideEffects.test.ts`

```typescript
describe('Side Effects', () => {
  test('WebSocket single message', async () => {
    // Create route with WebSocket side effect
    // Start WebSocket client
    // Make HTTP request to route
    // Verify WebSocket message received
  });
  
  test('WebSocket message sequence', async () => {
    // Test sequence with delays
  });
  
  test('Disabled side effect not executed', async () => {
    // Verify disabled effects don't run
  });
});
```

**Tasks**:
- [ ] Write unit tests for sideEffectsExecutor
- [ ] Write unit tests for websocketServer
- [ ] Write integration tests for side effects
- [ ] Test WebSocket connection handling
- [ ] Test error scenarios

## Phase 10: Documentation

### 10.1 Update CLAUDE.md
Add side effects architecture documentation.

### 10.2 User Documentation
Create user guide for side effects feature.

**Tasks**:
- [ ] Update CLAUDE.md with side effects architecture
- [ ] Create user documentation
- [ ] Add examples and use cases
- [ ] Document WebSocket event format

## Implementation Order

### Week 1: Backend Foundation
1. Day 1-2: Data models and types (Phase 1)
2. Day 3-4: WebSocket server implementation (Phase 2)
3. Day 5: Side effects executor (Phase 3)

### Week 2: UI Implementation
1. Day 1-2: Response dialog updates (Phase 5)
2. Day 3-4: Side effect dialog (Phase 6)
3. Day 5: Server settings updates (Phase 7)

### Week 3: Testing & Polish
1. Day 1-2: Testing infrastructure (Phase 4)
2. Day 3: Monitoring tools (Phase 8)
3. Day 4: Integration testing (Phase 9)
4. Day 5: Documentation (Phase 10)

## Future Extensions

### Kafka Support
- Add KafkaConfig type
- Implement Kafka client
- Add Kafka configuration UI

### REST/GraphQL Support
- Add RestConfig/GraphQLConfig types
- Implement HTTP client for side effects
- Add request builder UI

### gRPC Support
- Add gRPCConfig type
- Implement gRPC client
- Add proto file support

## Success Criteria

1. ✅ WebSocket server starts/stops with mock server
2. ✅ Side effects execute without blocking response
3. ✅ WebSocket messages broadcast to all clients
4. ✅ UI allows creating/editing/testing side effects
5. ✅ Side effects are JSON-configurable
6. ✅ Execution logs visible in DevTools
7. ✅ Test button works without making HTTP request
8. ✅ Multiple messages in sequence work with delays

## Risk Mitigation

1. **Port Conflicts**: Validate WebSocket port doesn't conflict with other servers
2. **Memory Leaks**: Properly cleanup WebSocket connections
3. **Error Handling**: Side effect errors don't crash server
4. **Performance**: Large payloads or many side effects don't slow responses
5. **Security**: Validate JSON payloads, prevent code injection