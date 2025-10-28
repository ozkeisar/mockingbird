import { Router } from 'express';
import { SideEffect } from '../../types/sideEffects';
import { testSideEffect } from '../server/sideEffectsExecutor';
import { getConnectedClientsCount, getWebSocketServer } from '../server/websocketServer';

const router = Router();

// Test a side effect without making an HTTP request
router.post('/test-side-effect', async (req, res) => {
  const { sideEffect, serverName } = req.body as {
    sideEffect: SideEffect;
    serverName: string;
  };

  if (!sideEffect || !serverName) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: sideEffect and serverName'
    });
  }

  try {
    const result = await testSideEffect(sideEffect, serverName);
    
    if (result.success) {
      res.json({ 
        success: true,
        message: `Side effect '${sideEffect.name}' executed successfully`
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error 
      });
    }
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Unknown error' 
    });
  }
});

// Get count of connected WebSocket clients for a server
router.get('/websocket-clients/:serverName', async (req, res) => {
  const { serverName } = req.params;

  try {
    const count = getConnectedClientsCount(serverName);
    const server = getWebSocketServer(serverName);
    
    res.json({
      success: true,
      serverName,
      connectedClients: count,
      serverRunning: server !== null
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get client count'
    });
  }
});

// Get WebSocket server status for all servers
router.get('/websocket-status', async (req, res) => {
  // This endpoint could be expanded to show all WebSocket servers status
  res.json({
    success: true,
    message: 'WebSocket status endpoint - expand as needed'
  });
});

export { router as sideEffectsRouter };