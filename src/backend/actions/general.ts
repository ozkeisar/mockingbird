import { v4 as uuid } from 'uuid';
import { execSync } from 'child_process';
import path from 'path';
import { Socket, Server as SocketIOServer } from 'socket.io';
import {
  addCredentialsToGitURI,
  createExampleProject,
  createProjectPath,
  getProjectsNameList,
  isDirectoryEmpty,
  readAppSettings,
  updateAppSettings,
  verifyProjectFoldersExist,
} from '../utils';
import { EVENT_KEYS } from '../../types/events';
import { updateClientProjectData } from '../utils/events';
import { emitSocketMessage } from '../socket';

type CreateProjectType = {
  sshUrl?: string;
  httpsUrl?: string;
  cloneType: 'OPEN' | 'SSH' | 'HTTPS' | 'LOCAL';
  username?: string;
  password?: string;
  projectName: string;
  directoryPath?: string;
};

export const createProject = async (
  socket: Socket | SocketIOServer,
  {
    sshUrl,
    httpsUrl,
    cloneType,
    username,
    password,
    projectName,
    directoryPath,
  }: CreateProjectType,
) => {
  await verifyProjectFoldersExist();

  const projectPath =
    cloneType === 'OPEN' ? directoryPath || '' : createProjectPath(projectName);

  const appSettings = await readAppSettings();
  const newProject = {
    id: uuid(),
    name: projectName,
    directoryPath: projectPath,
  };
  await updateAppSettings({
    ...appSettings,
    projects: [...(appSettings.projects || []), newProject],
  });

  if (cloneType === 'SSH') {
    await execSync(`git clone ${sshUrl} ${projectPath}`, {
      stdio: [0, 1, 2], // we need this so node will print the command output
      cwd: path.resolve('', ''), // path to where you want to save the file
    });
  } else if (cloneType === 'HTTPS' && httpsUrl && username && password) {
    const updatedURI = addCredentialsToGitURI(httpsUrl, username, password);

    await execSync(`git clone ${updatedURI} ${projectPath}`, {
      stdio: [0, 1, 2], // we need this so node will print the command output
      cwd: path.resolve('', ''), // path to where you want to save the file
    });
  }

  if (await isDirectoryEmpty(projectName)) {
    await createExampleProject(projectName);
  }

  const newProjectsNameList = await getProjectsNameList();

  await updateClientProjectData(socket, projectName);

  emitSocketMessage(socket, EVENT_KEYS.CREATE_PROJECT, {
    success: true,
    newProjectsNameList,
    newProjectName: projectName,
  });
};
