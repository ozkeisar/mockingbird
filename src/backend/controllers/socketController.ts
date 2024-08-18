import { Socket } from 'socket.io';
import {
  generalEvents,
  gitEvents,
  presetsEvents,
  serverEvents,
  updateFilesEvents,
} from '../events';

export const socketController = (socket: Socket) => {
  console.log('New client connected');

  generalEvents(socket);
  serverEvents(socket);
  gitEvents(socket);
  presetsEvents(socket);
  updateFilesEvents(socket);
};
