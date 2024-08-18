import { Socket } from 'socket.io';
import { SUPPORTED_PROJECT_DATA_VERSION } from '../../consts';
import {
  createNewServer,
  deleteParent,
  deleteServer,
  readProjectSettings,
  readServerData,
  readServerSettings,
  updateProjectSettings,
  updateProjectSupportedDataVersion,
  updateRouteParentFile,
  updateServerSettings,
} from '../utils';
import { hasUncommittedChanges } from '../utils/git';
import { ProjectServer } from '../../types';
import { EVENT_KEYS } from '../../types/events';

export const updateFilesEvents = (socket: Socket) => {
  socket.on(EVENT_KEYS.UPDATE_ROUTES_FILE, async (arg) => {
    try {
      const { filename, content, projectName, serverName } = arg;
      await updateRouteParentFile(projectName, serverName, content);

      const hasDiffs = await hasUncommittedChanges(projectName);

      socket.emit(EVENT_KEYS.UPDATE_ROUTES_FILE, {
        success: true,
        content,
        filename,
        projectName,
        serverName,
        hasDiffs,
      });
    } catch (error) {
      console.log('---error updateFilesEvents', error);
      socket.emit(EVENT_KEYS.UPDATE_ROUTES_FILE, { success: false });
    }
  });

  socket.on(EVENT_KEYS.UPDATE_SERVER_SETTINGS, async (arg) => {
    try {
      const { settings, projectName, serverName } = arg;
      await updateProjectSupportedDataVersion(projectName);

      await updateServerSettings(projectName, serverName, settings);
      const serverSettings = await readServerSettings(projectName, serverName);
      const hasDiffs = await hasUncommittedChanges(projectName);

      socket.emit(EVENT_KEYS.UPDATE_SERVER_SETTINGS, {
        success: true,
        serverSettings,
        projectName,
        serverName,
        hasDiffs,
      });
    } catch (error) {
      socket.emit(EVENT_KEYS.UPDATE_SERVER_SETTINGS, { success: false });
    }
  });

  socket.on(EVENT_KEYS.CREATE_SERVER, async (arg) => {
    try {
      const { settings, projectName, serverName } = arg;
      await updateProjectSupportedDataVersion(projectName);

      await createNewServer(projectName, serverName, settings);

      const parentRoutesHash = await readServerData(projectName, serverName);
      const savedSettings = await readServerSettings(projectName, serverName);
      const hasDiffs = await hasUncommittedChanges(projectName);

      const server: ProjectServer = {
        name: serverName,
        settings: savedSettings,
        parentRoutesHash,
      };

      socket.emit(EVENT_KEYS.CREATE_SERVER, {
        success: true,
        projectName,
        server,
        hasDiffs,
      });
    } catch (error) {
      socket.emit(EVENT_KEYS.CREATE_SERVER, { success: false });
    }
  });

  socket.on(EVENT_KEYS.DELETE_SERVER, async (arg) => {
    try {
      const { projectName, serverName } = arg;

      await deleteServer(projectName, serverName);

      const hasDiffs = await hasUncommittedChanges(projectName);

      socket.emit(EVENT_KEYS.DELETE_SERVER, {
        success: true,
        projectName,
        serverName,
        hasDiffs,
      });
    } catch (error) {
      socket.emit(EVENT_KEYS.DELETE_SERVER, { success: false });
    }
  });

  socket.on(EVENT_KEYS.DELETE_PARENT, async (arg) => {
    try {
      const { projectName, serverName, parentFilename, parentId } = arg;

      await deleteParent(projectName, serverName, parentFilename);
      const hasDiffs = await hasUncommittedChanges(projectName);

      socket.emit(EVENT_KEYS.DELETE_PARENT, {
        success: true,
        projectName,
        hasDiffs,
        serverName,
        parentId,
      });
    } catch (error) {
      socket.emit(EVENT_KEYS.DELETE_PARENT, { success: false });
    }
  });

  socket.on(EVENT_KEYS.UPDATE_PROJECT_SETTINGS, async (arg) => {
    try {
      const { settings, projectName } = arg;

      const projectSettings = await readProjectSettings(projectName);
      const newSettings = {
        ...projectSettings,
        ...settings,
        dataVersion: SUPPORTED_PROJECT_DATA_VERSION,
      };
      await updateProjectSettings(projectName, newSettings);
      const hasDiffs = await hasUncommittedChanges(projectName);

      socket.emit(EVENT_KEYS.UPDATE_PROJECT_SETTINGS, {
        success: true,
        projectName,
        projectSettings: newSettings,
        hasDiffs,
      });
    } catch (error) {
      socket.emit(EVENT_KEYS.UPDATE_PROJECT_SETTINGS, { success: false });
    }
  });
};
