import { Server as SocketIOServer } from 'socket.io';
import * as http from 'http';

interface WebSocketServerInfo {
  io: SocketIOServer;
  server: http.Server;
  port: number;
}

const websocketServers: Map<string, WebSocketServerInfo> = new Map();

export const startWebSocketServer = (
  serverName: string,
  port: number
): SocketIOServer => {
  // Check if server already exists
  if (websocketServers.has(serverName)) {
    console.log(`WebSocket server for ${serverName} already running on port ${port}`);
    return websocketServers.get(serverName)!.io;
  }

  // Create HTTP server
  const server = http.createServer();
  
  // Create Socket.IO server with CORS enabled
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Handle connections
  io.on('connection', (socket) => {
    console.log(`[${serverName}] WebSocket client connected: ${socket.id}`);
    
    socket.on('disconnect', () => {
      console.log(`[${serverName}] WebSocket client disconnected: ${socket.id}`);
    });

    // Optional: Handle test messages
    socket.on('test', (data) => {
      console.log(`[${serverName}] Test message received:`, data);
      socket.emit('test-response', { received: data });
    });
  });

  // Start the server
  server.listen(port, () => {
    console.log(`[${serverName}] WebSocket server started on port ${port}`);
  });

  // Store server info
  websocketServers.set(serverName, { io, server, port });

  return io;
};

export const stopWebSocketServer = (serverName: string): void => {
  const serverInfo = websocketServers.get(serverName);
  
  if (!serverInfo) {
    console.log(`No WebSocket server found for ${serverName}`);
    return;
  }

  // Close all connections
  serverInfo.io.disconnectSockets();
  
  // Close the server
  serverInfo.server.close(() => {
    console.log(`[${serverName}] WebSocket server stopped`);
  });

  // Remove from map
  websocketServers.delete(serverName);
};

export const getWebSocketServer = (serverName: string): SocketIOServer | null => {
  const serverInfo = websocketServers.get(serverName);
  return serverInfo ? serverInfo.io : null;
};

export const broadcastWebSocketMessage = (
  serverName: string,
  event: string,
  payload: any
): void => {
  const io = getWebSocketServer(serverName);
  
  if (!io) {
    console.error(`No WebSocket server found for ${serverName}`);
    return;
  }

  // Broadcast to all connected clients
  io.emit(event, payload);
  console.log(`[${serverName}] Broadcasted event '${event}' to all clients`);
};

export const getConnectedClientsCount = (serverName: string): number => {
  const io = getWebSocketServer(serverName);
  
  if (!io) {
    return 0;
  }

  // Get all connected sockets
  const sockets = io.sockets.sockets;
  return sockets.size;
};

export const stopAllWebSocketServers = (): void => {
  console.log('Stopping all WebSocket servers...');
  
  websocketServers.forEach((_, serverName) => {
    stopWebSocketServer(serverName);
  });
};