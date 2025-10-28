import { Request, Response } from 'express';
import { 
  SideEffect, 
  SideEffectExecutionLog, 
  WebSocketConfig 
} from '../../types/sideEffects';
import { broadcastWebSocketMessage } from './websocketServer';
import { emitGlobalSocketMessage } from '../socket';
import { EVENT_KEYS } from '../../types/events';

// Utility function for delays
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const executeSideEffects = async (
  sideEffects: SideEffect[],
  serverName: string,
  req: Request,
  res: Response
): Promise<void> => {
  // Filter enabled side effects
  const enabledEffects = sideEffects.filter(effect => effect.enabled);
  
  if (enabledEffects.length === 0) {
    return;
  }

  // Execute all enabled side effects in parallel (fire and forget)
  const promises = enabledEffects.map(effect => 
    executeSingleSideEffect(effect, serverName)
  );
  
  // Don't await - fire and forget pattern
  Promise.allSettled(promises).then(results => {
    // Log results for debugging
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(
          `Side effect '${enabledEffects[index].name}' failed:`,
          result.reason
        );
      }
    });
  });
};

export const executeSingleSideEffect = async (
  sideEffect: SideEffect,
  serverName: string
): Promise<void> => {
  const startTime = Date.now();
  
  const log: SideEffectExecutionLog = {
    timestamp: startTime,
    sideEffectId: sideEffect.id,
    sideEffectName: sideEffect.name,
    status: 'success'
  };

  try {
    // Apply initial delay if configured
    if (sideEffect.delay && sideEffect.delay > 0) {
      await sleep(sideEffect.delay);
    }

    // Execute based on type
    switch (sideEffect.type) {
      case 'websocket':
        await executeWebSocketSideEffect(
          sideEffect.config as WebSocketConfig, 
          serverName
        );
        break;
        
      // Future: Add other types here
      case 'kafka':
      case 'rest':
      case 'graphql':
      case 'grpc':
        throw new Error(`Side effect type '${sideEffect.type}' not yet implemented`);
        
      default:
        throw new Error(`Unknown side effect type: ${sideEffect.type}`);
    }

    log.details = {
      executionTime: Date.now() - startTime,
      serverName
    };
    
  } catch (error: any) {
    log.status = 'error';
    log.error = error.message || 'Unknown error';
    log.details = {
      executionTime: Date.now() - startTime,
      serverName,
      errorStack: error.stack
    };
  }

  // Emit log to UI for monitoring
  try {
    emitGlobalSocketMessage(EVENT_KEYS.SIDE_EFFECT_LOG, log);
  } catch (error) {
    console.error('Failed to emit side effect log:', error);
  }
};

const executeWebSocketSideEffect = async (
  config: WebSocketConfig,
  serverName: string
): Promise<void> => {
  if (!config.messages || config.messages.length === 0) {
    throw new Error('No messages configured for WebSocket side effect');
  }

  if (config.eventType === 'single') {
    // Send single message
    const message = config.messages[0];
    if (message) {
      broadcastWebSocketMessage(serverName, message.event, message.payload);
    }
  } else if (config.eventType === 'sequence') {
    // Send sequence of messages with delays
    for (const message of config.messages) {
      if (message.delay && message.delay > 0) {
        await sleep(message.delay);
      }
      broadcastWebSocketMessage(serverName, message.event, message.payload);
    }
  } else {
    throw new Error(`Unknown WebSocket event type: ${config.eventType}`);
  }
};

// Function to test a side effect without HTTP request
export const testSideEffect = async (
  sideEffect: SideEffect,
  serverName: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await executeSingleSideEffect(sideEffect, serverName);
    return { success: true };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Unknown error' 
    };
  }
};