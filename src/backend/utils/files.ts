import serialize from 'serialize-javascript';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { v4 as uuid } from 'uuid';
import {
  AppSettings,
  PresetsFolder,
  ProjectServer,
  ProjectSettings,
  RouteParent,
  RouteParentHash,
  ServerSettings,
} from '../../types';
import {
  DEFAULT_APP_SETTINGS,
  DEFAULT_SERVER_SETTINGS,
  appSettingsFolder,
  projectsPath,
  DEFAULT_PROJECT_SETTINGS,
  SUPPORTED_PROJECT_DATA_VERSION,
  mainFolderPath,
} from '../../consts';
import { listToHashmap, replaceUndefined } from './utils';

export const readAppSettings = async (): Promise<AppSettings> => {
  try {
    await fsp.mkdir(appSettingsFolder, { recursive: true });
  } catch (error) {
    // Directory might already exist, ignore
  }

  try {
    const settings = JSON.parse(
      await fsp.readFile(`${appSettingsFolder}settings.json`, 'utf8'),
    );

    return { ...DEFAULT_APP_SETTINGS, ...settings };
  } catch (error) {
    return DEFAULT_APP_SETTINGS;
  }
};

export const getProjectPath = async (projectName: string) => {
  const appSettings = await readAppSettings();

  const project = appSettings?.projects?.find(
    (item) => item.name === projectName,
  );

  if (!project) {
    throw new Error(`project named ${projectName} not found`);
  }

  return project.directoryPath;
};

function formatFolderName(input: string): string {
  // Define invalid characters for each operating system
  // eslint-disable-next-line no-control-regex
  const windowsInvalidChars = /[<>:"/\\|?*\x00-\x1F]/g;
  const macInvalidChars = /[:]/g;
  // eslint-disable-next-line no-control-regex
  const linuxInvalidChars = /\x00/g;

  // Replace invalid characters with an underscore
  let formattedName = input.replace(windowsInvalidChars, '_');
  formattedName = formattedName.replace(macInvalidChars, '_');
  formattedName = formattedName.replace(linuxInvalidChars, '_');

  // Trim whitespace from the start and end
  formattedName = formattedName.trim();

  // If the name is empty after cleaning, return 'default_folder'
  if (formattedName.length === 0) {
    formattedName = 'default_folder';
  }

  return formattedName;
}

export const verifyProjectFoldersExist = async () => {
  await fsp.mkdir(mainFolderPath, { recursive: true });
  await fsp.mkdir(projectsPath, { recursive: true });
  await fsp.mkdir(appSettingsFolder, { recursive: true });
};

export const createProjectPath = async (projectName: string) => {
  const projectPath = `${projectsPath + formatFolderName(projectName + new Date().getTime())}/`;

  await verifyProjectFoldersExist();

  await fsp.mkdir(projectPath, { recursive: true });

  return projectPath;
};

export const getProjectSettingsPath = async (projectName: string) => {
  const projectPath = await getProjectPath(projectName);

  const projectSettingsPath = `${projectPath}/settings/`;

  await fsp.mkdir(projectSettingsPath, { recursive: true });

  return projectSettingsPath;
};

export const getServersFolderPath = async (projectName: string) => {
  const projectPath = await getProjectPath(projectName);

  const serversFolderPath = `${projectPath}servers/`;

  await fsp.mkdir(serversFolderPath, { recursive: true });

  return serversFolderPath;
};

export const getServerPath = async (
  projectName: string,
  serverName: string,
) => {
  const serversFolderPath = await getServersFolderPath(projectName);

  const serverPath = `${serversFolderPath + serverName}/`;

  await fsp.mkdir(serverPath, { recursive: true });

  return serverPath;
};

export const getServerDataPath = async (
  projectName: string,
  serverName: string,
) => {
  const serverPath = await getServerPath(projectName, serverName);

  const serverDataPath = `${serverPath}data/`;

  await fsp.mkdir(serverDataPath, { recursive: true });

  return serverDataPath;
};

export const getPresetsPath = async (projectName: string) => {
  const projectPath = await getProjectPath(projectName);

  const presetsPath = `${projectPath}presets/`;

  await fsp.mkdir(presetsPath, { recursive: true });

  return presetsPath;
};

export const getServerSettingsPath = async (
  projectName: string,
  serverName: string,
) => {
  const serverPath = await getServerPath(projectName, serverName);

  const serverSettingsPath = `${serverPath}settings/`;

  await fsp.mkdir(serverSettingsPath, { recursive: true });

  return serverSettingsPath;
};

export const readServerSettings = async (
  projectName: string,
  serverName: string,
): Promise<ServerSettings> => {
  try {
    const serverSettingsPath = await getServerSettingsPath(
      projectName,
      serverName,
    );

    const settings = JSON.parse(
      await fsp.readFile(`${serverSettingsPath}settings.json`, 'utf8'),
    );

    return { ...DEFAULT_SERVER_SETTINGS, ...settings };
  } catch (error) {
    return DEFAULT_SERVER_SETTINGS;
  }
};

export const updateServerSettings = async (
  projectName: string,
  serverName: string,
  settings: ServerSettings,
) => {
  const fileData = serialize(replaceUndefined(settings), {
    space: 2,
    unsafe: true,
  });

  const serverSettingsPath = await getServerSettingsPath(
    projectName,
    serverName,
  );

  await fsp.writeFile(
    `${serverSettingsPath}settings.json`,
    fileData,
    'utf8',
  );
};

export const deleteServer = async (projectName: string, serverName: string) => {
  const serverPath = await getServerPath(projectName, serverName);

  await fsp.rm(serverPath, { recursive: true, force: true });
};

export const deleteParent = async (
  projectName: string,
  serverName: string,
  parentFilename: string,
) => {
  const serverDataPath = await getServerDataPath(projectName, serverName);

  await fsp.unlink(`${serverDataPath + parentFilename}.json`);
};

export const deletePresetFolder = async (
  projectName: string,
  filename: string,
) => {
  const presetsPath = await getPresetsPath(projectName);

  await fsp.unlink(`${presetsPath + filename}.json`);
};

export const updateAppSettings = async (settings: AppSettings) => {
  await fsp.mkdir(appSettingsFolder, { recursive: true });

  await fsp.writeFile(
    `${appSettingsFolder}settings.json`,
    JSON.stringify(replaceUndefined(settings)),
    'utf8',
  );
};

const insertProjectFilesIntoAppSettings = async () => {
  const appSettings = await readAppSettings();

  const dirents = await fsp.readdir(projectsPath, { withFileTypes: true });
  const projects = dirents
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => ({
      name: dirent.name,
      id: uuid(),
      directoryPath: `${projectsPath + dirent.name}/`,
    }));

  await updateAppSettings({ ...appSettings, projects });
};

export const getProjectsNameList = async () => {
  let appSettings = await readAppSettings();

  if (appSettings.projects === null) {
    await insertProjectFilesIntoAppSettings();
    appSettings = await readAppSettings();
  }

  return appSettings?.projects?.map((item) => item.name) || [];
};

export const getProjectServersNameList = async (projectName: string) => {
  const serversFolderPath = await getServersFolderPath(projectName);

  const dirents = await fsp.readdir(serversFolderPath, { withFileTypes: true });
  return dirents
    .filter((dirent) => dirent.isDirectory() && dirent.name?.length > 0)
    .map((dirent) => dirent.name);
};

export const getProjectPresetsFilenames = async (projectName: string) => {
  const presetsPath = await getPresetsPath(projectName);
  const files = await fsp.readdir(presetsPath);
  const filenames = files.filter((filename) => filename.endsWith('.json'));

  return filenames;
};

export const updateProjectSettings = async (
  projectName: string,
  settings: ProjectSettings,
) => {
  const projectSettingsPath = await getProjectSettingsPath(projectName);

  await fsp.writeFile(
    `${projectSettingsPath}settings.json`,
    JSON.stringify(replaceUndefined(settings)),
    'utf8',
  );
};

export const readProjectSettings = async (
  projectName: string,
): Promise<ProjectSettings> => {
  const projectSettingsPath = await getProjectSettingsPath(projectName);

  try {
    const settings = JSON.parse(
      await fsp.readFile(`${projectSettingsPath}settings.json`, 'utf8'),
    );

    return Object.freeze({ ...DEFAULT_PROJECT_SETTINGS, ...settings });
  } catch (error) {
    return DEFAULT_PROJECT_SETTINGS;
  }
};

export const readServerData = async (
  projectName: string,
  serverName: string,
): Promise<RouteParentHash> => {
  const dataFolderPath = await getServerDataPath(projectName, serverName);

  const files = await fsp.readdir(dataFolderPath);
  const filenames = files.filter((filename) => filename.endsWith('.json'));

  const data = await Promise.all(
    filenames.map(async (filename) => {
      const modulePath = path.resolve(dataFolderPath, filename);

      const obj = JSON.parse(
        await fsp.readFile(modulePath, 'utf8'),
      ) as RouteParent;

      return obj;
    }),
  );

  return listToHashmap(data, (item) => item.id);
};

export const getProjectPresets = async (projectName: string) => {
  const projectPresetsFilenames = await getProjectPresetsFilenames(projectName);
  const presetsPath = await getPresetsPath(projectName);

  const data = await Promise.all(
    projectPresetsFilenames.map(async (filename) => {
      const presetPath = path.resolve(presetsPath, filename);

      return JSON.parse(
        await fsp.readFile(presetPath, 'utf8'),
      ) as PresetsFolder;
    }),
  );

  return data;
};

export const updateProjectSupportedDataVersion = async (
  projectName: string,
) => {
  const projectSettings = await readProjectSettings(projectName);

  await updateProjectSettings(projectName, {
    ...projectSettings,
    dataVersion: SUPPORTED_PROJECT_DATA_VERSION,
  });
};

export const updateRouteParentFile = async (
  projectName: string,
  serverName: string,
  parent: RouteParent,
) => {
  const serverDataPath = await getServerDataPath(projectName, serverName);

  await updateProjectSupportedDataVersion(projectName);

  const fileData = serialize(replaceUndefined(parent), {
    space: 2,
    unsafe: true,
  });

  await fsp.writeFile(
    `${serverDataPath + parent.filename}.json`,
    fileData,
    'utf8',
  );
};

export const updatePresetFile = async (
  projectName: string,
  presetFolder: PresetsFolder,
) => {
  const presetsPath = await getPresetsPath(projectName);

  await updateProjectSupportedDataVersion(projectName);

  const fileData = serialize(replaceUndefined(presetFolder), {
    space: 2,
    unsafe: true,
  });

  await fsp.writeFile(
    `${presetsPath + presetFolder.filename}.json`,
    fileData,
    'utf8',
  );
};

export const updateServerData = async (
  projectName: string,
  server: ProjectServer,
) => {
  await Promise.all(
    Object.values(server.parentRoutesHash).map((parent) => {
      return updateRouteParentFile(projectName, server.name, parent);
    }),
  );
};

export async function deleteDirectory(
  directoryPath: string,
  maxAttempts = 5,
): Promise<boolean> {
  let attempts = 0;

  async function attemptDelete(): Promise<boolean> {
    try {
      await fsp.rm(directoryPath, { recursive: true, force: true });
      console.log('Directory removed', directoryPath);
      return true;
    } catch (err: any) {
      if (err.code === 'EBUSY' && attempts < maxAttempts) {
        // Check if error is due to a busy resource
        console.log('Directory is locked, retrying...');
        attempts += 1;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
        return attemptDelete();
      } else {
        console.error('Failed to remove directory:', err);
        return false;
      }
    }
  }

  return attemptDelete();
}

export async function isDirectoryEmpty(projectName: string): Promise<boolean> {
  try {
    const projectPath = await getProjectPath(projectName);

    const files = await fsp.readdir(projectPath);
    return files.length === 0;
  } catch (error) {
    console.error('Error reading directory:', error);
    return false; // or throw, depending on your error handling strategy
  }
}

export const checkParentUsageInPresets = async (
  projectName: string,
  serverName: string,
  parentId: string,
) => {
  const presetFolders = await getProjectPresets(projectName);
  const usedInPresets: { folderName: string; presetName: string }[] = [];

  presetFolders.forEach((folder) => {
    if (folder.presetsHash) {
      Object.values(folder.presetsHash).forEach((preset) => {
        if (preset.routesHash) {
          const hasRouteInParent = Object.values(preset.routesHash).some(
            (presetRoute) =>
              presetRoute.serverId === serverName &&
              presetRoute.parentId === parentId,
          );

          if (hasRouteInParent) {
            usedInPresets.push({
              folderName: folder.name,
              presetName: preset.name,
            });
          }
        }
      });
    }
  });

  return usedInPresets;
};

export const checkServerUsageInPresets = async (
  projectName: string,
  serverName: string,
) => {
  const presetFolders = await getProjectPresets(projectName);
  const usedInPresets: { folderName: string; presetName: string }[] = [];

  presetFolders.forEach((folder) => {
    if (folder.presetsHash) {
      Object.values(folder.presetsHash).forEach((preset) => {
        if (preset.routesHash) {
          const hasRouteInServer = Object.values(preset.routesHash).some(
            (presetRoute) => presetRoute.serverId === serverName,
          );

          if (hasRouteInServer) {
            usedInPresets.push({
              folderName: folder.name,
              presetName: preset.name,
            });
          }
        }
      });
    }
  });

  return usedInPresets;
};
