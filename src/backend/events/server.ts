import { Socket } from 'socket.io';
import { closeProjectServers, startProjectServers } from '../server';
import { EVENT_KEYS } from '../../types/events';
import { handleCloseServer, handleStartServer } from '../actions';

export const serverEvents = (socket: Socket) => {
  socket.on(EVENT_KEYS.CLOSE_SERVER, async () => {
    try {
      handleCloseServer();
    } catch (error) {
      socket.emit(EVENT_KEYS.CLOSE_SERVER, { error, success: false });
    }
  });

  socket.on(EVENT_KEYS.START_SERVER, async (arg) => {
    try {
      const { projectName } = arg;

      await handleStartServer(projectName);
    } catch (error) {
      socket.emit(EVENT_KEYS.START_SERVER, {
        success: false,
        error,
        projectName: arg?.projectName,
      });
    }
  });

  socket.on(EVENT_KEYS.RESTART_SERVER, async (arg) => {
    try {
      closeProjectServers();
      socket.emit(EVENT_KEYS.CLOSE_SERVER, { success: true });
    } catch (error) {
      socket.emit(EVENT_KEYS.CLOSE_SERVER, { success: false, error });
    }

    try {
      const { projectName } = arg;

      const { host } = await startProjectServers(projectName);
      socket.emit(EVENT_KEYS.START_SERVER, {
        success: true,
        host,
        projectName,
      });
    } catch (error) {
      socket.emit(EVENT_KEYS.START_SERVER, {
        success: false,
        error,
        projectName: arg.projectName,
      });
    }
  });
};
