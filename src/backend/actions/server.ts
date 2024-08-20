import { EVENT_KEYS } from '../../types/events';
import { closeProjectServers, startProjectServers } from '../server';
import { emitGlobalSocketMessage } from '../socket';
import { readAppSettings } from '../utils';

export const handleStartServer = async (projectName: string) => {
  try {
    const appSettings = await readAppSettings();
    closeProjectServers();

    if (appSettings.serverDisabledUntil) {
      const disabledTime = new Date(appSettings.serverDisabledUntil).getTime();
      const currentTime = new Date().getTime();
      if (disabledTime > currentTime) {
        emitGlobalSocketMessage(EVENT_KEYS.START_SERVER, {
          success: false,
          projectName,
          serverDisabledUntil: appSettings.serverDisabledUntil,
        });
        return {};
      }
    }

    const { host } = await startProjectServers(projectName);
    emitGlobalSocketMessage(EVENT_KEYS.START_SERVER, {
      success: true,
      host,
      projectName,
    });

    return { host };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const handleCloseServer = () => {
  try {
    closeProjectServers();
    emitGlobalSocketMessage(EVENT_KEYS.CLOSE_SERVER, { success: true });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const handleRestartServer = async (projectName: string) => {
  try {
    closeProjectServers();
    emitGlobalSocketMessage(EVENT_KEYS.CLOSE_SERVER, { success: true });
  } catch (error) {
    emitGlobalSocketMessage(EVENT_KEYS.CLOSE_SERVER, { success: false, error });
    throw error;
  }

  try {
    const { host } = await startProjectServers(projectName);
    emitGlobalSocketMessage(EVENT_KEYS.START_SERVER, {
      success: true,
      host,
      projectName,
    });
  } catch (error) {
    emitGlobalSocketMessage(EVENT_KEYS.START_SERVER, {
      success: false,
      error,
      projectName,
    });
    throw error;
  }
};
