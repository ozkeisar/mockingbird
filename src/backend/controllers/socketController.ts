import { Socket } from 'socket.io';
import { generalEvents, gitEvents, presetsEvents, serverEvents, updateFilesEvents } from '../events';
import { ISocketEvent } from '../interfaces/ISocketEvent';

export const socketController = (socket: Socket) => {
  console.log('New client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
  generalEvents(socket)
  serverEvents(socket)
  gitEvents(socket)
  presetsEvents(socket)
  updateFilesEvents(socket)
};
