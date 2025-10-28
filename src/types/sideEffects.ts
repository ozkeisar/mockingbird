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