import { execSync } from 'child_process';
import { Socket } from 'socket.io';
import { checkIServerUp, closeProjectServers } from '../server';
import {
  activateProgram,
  getActiveProjectName,
  getProjectPath,
  getProjectsNameList,
  readAppSettings,
  updateAppSettings,
  verifyProjectFoldersExist,
} from '../utils';
import { generateUniqueIdentifier } from '../utils/utils';
import { EVENT_KEYS } from '../../types/events';
import { updateClientProjectData } from '../utils/events';
import { emitSocketMessage } from '../socket';
import { createProject } from '../actions/general';

export const generalEvents = (socket: Socket) => {
  socket.on(EVENT_KEYS.INIT, async () => {
    try {
      await verifyProjectFoldersExist();
      const projectName = await getActiveProjectName();

      let appSettings = await readAppSettings();

      const projectsNameList = await getProjectsNameList();

      if (appSettings && !appSettings.userId) {
        const userId = generateUniqueIdentifier();

        await updateAppSettings({ ...appSettings, userId });
        appSettings = await readAppSettings();
      }

      const isServerUp = checkIServerUp();

      emitSocketMessage(socket, EVENT_KEYS.INIT, {
        success: true,
        projectName,
        projectsNameList,
        appSettings,
        isServerUp,
      });

      if (projectName && projectName.length > 0) {
        await updateClientProjectData(socket, projectName);
      }
    } catch (error) {
      console.log('init error', error);
      emitSocketMessage(socket, EVENT_KEYS.INIT, { success: false, error });
    }
  });

  socket.on(EVENT_KEYS.CREATE_PROJECT, async (arg) => {
    try {
      const {
        sshUrl,
        httpsUrl,
        cloneType,
        username,
        password,
        projectName,
        directoryPath,
      } = arg;

      createProject(socket, {
        sshUrl,
        httpsUrl,
        cloneType,
        username,
        password,
        projectName,
        directoryPath,
      });
    } catch (error) {
      console.log('Error create project ', error);
      emitSocketMessage(socket, EVENT_KEYS.CREATE_PROJECT, {
        success: false,
        error,
      });
    }
  });

  socket.on(EVENT_KEYS.CHANGE_PROJECT, async (arg) => {
    try {
      const { projectName } = arg;

      const appSettings = await readAppSettings();

      await updateAppSettings({
        ...appSettings,
        activeProject: projectName,
      });
      emitSocketMessage(socket, EVENT_KEYS.CHANGE_PROJECT, { success: true });

      await updateClientProjectData(socket, projectName);
    } catch (error) {
      emitSocketMessage(socket, EVENT_KEYS.CHANGE_PROJECT, {
        success: false,
        error,
      });
    }
  });

  socket.on(EVENT_KEYS.DELETE_PROJECT, async (arg) => {
    const { projectName } = arg;

    const currentRepoFolderPath = await getProjectPath(arg.projectName);

    try {
      closeProjectServers();
      emitSocketMessage(socket, EVENT_KEYS.CLOSE_SERVER, { success: true });

      const appSettings = await readAppSettings();

      await updateAppSettings({
        ...appSettings,
        projects:
          appSettings?.projects?.filter((item) => item.name !== projectName) ||
          [],
      });

      const projectsNameList = await getProjectsNameList();

      emitSocketMessage(socket, EVENT_KEYS.DELETE_PROJECT, {
        success: true,
        projectsNameList,
      });
    } catch (error) {
      emitSocketMessage(socket, EVENT_KEYS.CLOSE_SERVER, {
        error,
        success: false,
      });
      emitSocketMessage(socket, EVENT_KEYS.DELETE_PROJECT, {
        success: false,
        currentRepoFolderPath,
      });
    }
  });

  socket.on(EVENT_KEYS.ACTIVATE, async (arg) => {
    try {
      const success = await activateProgram(arg.activationKey);
      emitSocketMessage(socket, EVENT_KEYS.ACTIVATE, { success });
    } catch (error) {
      emitSocketMessage(socket, EVENT_KEYS.ACTIVATE, { success: false });
    }
  });

  socket.on(EVENT_KEYS.RELOAD, async (arg) => {
    const { projectName } = arg;

    await updateClientProjectData(socket, projectName);
  });

  socket.on(EVENT_KEYS.APPROVE_ANALYTICS, async () => {
    const currentAppSettings = await readAppSettings();
    await updateAppSettings({
      ...currentAppSettings,
      userApproveAnalytics: true,
    });
    const appSettings = await readAppSettings();

    emitSocketMessage(socket, EVENT_KEYS.APP_SETTINGS_UPDATED, {
      success: true,
      appSettings,
    });
  });

  socket.on(
    EVENT_KEYS.RUN_TERMINAL_COMMAND,
    async ({ command, projectName }) => {
      const directoryPath = await getProjectPath(projectName);

      try {
        const output = execSync(command, {
          cwd: directoryPath,
          encoding: 'utf-8',
        });

        emitSocketMessage(socket, EVENT_KEYS.TERMINAL_COMMAND_OUTPUT, {
          output,
          success: true,
        });
      } catch (error: any) {
        if (error.stdout?.length > 0) {
          emitSocketMessage(socket, EVENT_KEYS.TERMINAL_COMMAND_OUTPUT, {
            output: error.stdout,
            success: false,
          });
        } else {
          emitSocketMessage(socket, EVENT_KEYS.TERMINAL_COMMAND_OUTPUT, {
            output: error.stderr,
            success: false,
          });
        }
      } finally {
        await updateClientProjectData(socket, projectName);
      }
    },
  );

  socket.on(EVENT_KEYS.RELOAD_PROJECT, async ({ projectName }) => {
    try {
      await updateClientProjectData(socket, projectName);
    } catch (error: any) {
      emitSocketMessage(socket, EVENT_KEYS.RELOAD_PROJECT, { success: false });
    }
  });
};
