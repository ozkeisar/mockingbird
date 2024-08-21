import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { EVENT_KEYS } from '../types/events';

// eslint-disable-next-line import/no-mutable-exports
let socketIo: SocketIOServer | null;

export const initSocketIO = (server: HttpServer) => {
  socketIo = new SocketIOServer(server, {
    maxHttpBufferSize: 1e8,
    pingTimeout: 60000,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  return socketIo;
};

export const getGlobalSocketIo = () => {
  if (!socketIo) {
    throw new Error('Socket.io not initialized!');
  }
  return socketIo;
};

export const emitSocketMessage = (
  socket: Socket | SocketIOServer,
  key: EVENT_KEYS,
  args: any,
) => {
  if (!socketIo) {
    throw new Error('Socket.io not initialized!');
  }
  socket.emit(key, args);
};

export const emitGlobalSocketMessage = (key: EVENT_KEYS, args: any) => {
  if (!socketIo) {
    throw new Error('Socket.io not initialized!');
  }
  socketIo.emit(key, args);
};
