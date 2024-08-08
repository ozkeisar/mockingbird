import { Server as SocketIOServer } from 'socket.io';
import { socketController } from '../controllers/socketController';

export const socketService = (io: SocketIOServer) => {
  io.on('connection', (socket) => {
    console.log('-----connection')
    socketController(socket);
  });
};
