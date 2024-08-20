import serialize from 'serialize-javascript';
import fs, { readdirSync } from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { readdir } from 'fs/promises';
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
  if (!fs.existsSync(appSettingsFolder)) {
    fs.mkdirSync(appSettingsFolder);
  }

  try {
    const settings = JSON.parse(
      await fs.readFileSync(`${appSettingsFolder}settings.json`, 'utf8'),
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

export const verifyProjectFoldersExist = () => {
  if (!fs.existsSync(mainFolderPath)) {
    fs.mkdirSync(mainFolderPath);
  }
  if (!fs.existsSync(projectsPath)) {
    fs.mkdirSync(projectsPath);
  }
  if (!fs.existsSync(appSettingsFolder)) {
    fs.mkdirSync(appSettingsFolder);
  }
};

export const createProjectPath = (projectName: string) => {
  const projectPath = `${projectsPath + formatFolderName(projectName + new Date().getTime())}/`;

  verifyProjectFoldersExist();

  if (!fs.existsSync(projectsPath)) {
    fs.mkdirSync(projectsPath);
  }

  if (!fs.existsSync(projectPath)) {
    fs.mkdirSync(projectPath);
  }

  return projectPath;
};

export const getProjectSettingsPath = async (projectName: string) => {
  const projectPath = await getProjectPath(projectName);

  const projectSettingsPath = `${projectPath}/settings/`;

  if (!fs.existsSync(projectSettingsPath)) {
    fs.mkdirSync(projectSettingsPath);
  }

  return projectSettingsPath;
};

export const getServersFolderPath = async (projectName: string) => {
  const projectPath = await getProjectPath(projectName);

  const serversFolderPath = `${projectPath}servers/`;

  if (!fs.existsSync(serversFolderPath)) {
    fs.mkdirSync(serversFolderPath);
  }

  return serversFolderPath;
};

export const getServerPath = async (
  projectName: string,
  serverName: string,
) => {
  const serversFolderPath = await getServersFolderPath(projectName);

  const serverPath = `${serversFolderPath + serverName}/`;

  if (!fs.existsSync(serverPath)) {
    fs.mkdirSync(serverPath);
  }

  return serverPath;
};

export const getServerDataPath = async (
  projectName: string,
  serverName: string,
) => {
  const serverPath = await getServerPath(projectName, serverName);

  const serverDataPath = `${serverPath}data/`;

  if (!fs.existsSync(serverDataPath)) {
    fs.mkdirSync(serverDataPath);
  }

  return serverDataPath;
};

export const getPresetsPath = async (projectName: string) => {
  const projectPath = await getProjectPath(projectName);

  const presetsPath = `${projectPath}presets/`;

  if (!fs.existsSync(presetsPath)) {
    fs.mkdirSync(presetsPath);
  }

  return presetsPath;
};

export const getServerSettingsPath = async (
  projectName: string,
  serverName: string,
) => {
  const serverPath = await getServerPath(projectName, serverName);

  const serverSettingsPath = `${serverPath}settings/`;

  if (!fs.existsSync(serverSettingsPath)) {
    fs.mkdirSync(serverSettingsPath);
  }

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

    if (fs.existsSync(serverSettingsPath)) {
      const settings = JSON.parse(
        await fs.readFileSync(`${serverSettingsPath}settings.json`, 'utf8'),
      );

      return { ...DEFAULT_SERVER_SETTINGS, ...settings };
    }
    return DEFAULT_SERVER_SETTINGS;
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

  if (!fs.existsSync(serverSettingsPath)) {
    fs.mkdirSync(serverSettingsPath);
  }

  await fs.writeFileSync(
    `${serverSettingsPath}settings.json`,
    fileData,
    'utf8',
  );
};

export const deleteServer = async (projectName: string, serverName: string) => {
  const serverPath = await getServerPath(projectName, serverName);

  await fs.rmSync(serverPath, { recursive: true, force: true });
};

export const deleteParent = async (
  projectName: string,
  serverName: string,
  parentFilename: string,
) => {
  const serverDataPath = await getServerDataPath(projectName, serverName);

  await fs.unlinkSync(`${serverDataPath + parentFilename}.json`);
};

export const deletePresetFolder = async (
  projectName: string,
  filename: string,
) => {
  const presetsPath = await getPresetsPath(projectName);

  await fs.unlinkSync(`${presetsPath + filename}.json`);
};

export const updateAppSettings = (settings: AppSettings) => {
  if (!fs.existsSync(appSettingsFolder)) {
    fs.mkdirSync(appSettingsFolder);
  }

  fs.writeFileSync(
    `${appSettingsFolder}settings.json`,
    JSON.stringify(replaceUndefined(settings)),
    'utf8',
  );
};

const insertProjectFilesIntoAppSettings = async () => {
  const appSettings = await readAppSettings();

  const projects = await readdirSync(projectsPath, { withFileTypes: true })
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

  return readdirSync(serversFolderPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory() && dirent.name?.length > 0)
    .map((dirent) => dirent.name);
};

export const getProjectPresetsFilenames = async (projectName: string) => {
  const presetsPath = await getPresetsPath(projectName);
  const filenames = await fs
    .readdirSync(presetsPath)
    .filter((filename) => filename.endsWith('.json'));

  return filenames;
};

export const updateProjectSettings = async (
  projectName: string,
  settings: ProjectSettings,
) => {
  const projectSettingsPath = await getProjectSettingsPath(projectName);

  if (!fs.existsSync(projectSettingsPath)) {
    fs.mkdirSync(projectSettingsPath);
  }

  fs.writeFileSync(
    `${projectSettingsPath}settings.json`,
    JSON.stringify(replaceUndefined(settings)),
    'utf8',
  );
};

export const readProjectSettings = async (
  projectName: string,
): Promise<ProjectSettings> => {
  const projectSettingsPath = await getProjectSettingsPath(projectName);

  if (!fs.existsSync(projectSettingsPath)) {
    fs.mkdirSync(projectSettingsPath);
  }

  try {
    const settings = JSON.parse(
      await fs.readFileSync(`${projectSettingsPath}settings.json`, 'utf8'),
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

  const filenames = await fs
    .readdirSync(dataFolderPath)
    .filter((filename) => filename.endsWith('.json'));

  const data = await Promise.all(
    filenames.map(async (filename) => {
      const modulePath = path.resolve(dataFolderPath, filename);

      const obj = JSON.parse(
        await fs.readFileSync(modulePath, 'utf8'),
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
        await fs.readFileSync(presetPath, 'utf8'),
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

  fs.writeFileSync(
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

  fs.writeFileSync(
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

export function deleteDirectory(
  directoryPath: string,
  callback: (success: boolean) => void,
  maxAttempts = 5,
) {
  let attempts = 0;

  function attemptDelete() {
    try {
      fs.rmSync(directoryPath, { recursive: true, force: true });
      console.log('Directory removed', directoryPath);
      callback(true);
    } catch (err: any) {
      if (err.code === 'EBUSY' && attempts < maxAttempts) {
        // Check if error is due to a busy resource
        console.log('Directory is locked, retrying...');
        attempts += 1;
        setTimeout(attemptDelete, 1000); // Wait 1 second before retrying
      } else {
        callback(false);

        console.error('Failed to remove directory:', err);
      }
    }
  }

  attemptDelete();
}

export async function isDirectoryEmpty(projectName: string): Promise<boolean> {
  try {
    const projectPath = await getProjectPath(projectName);

    const files = await readdir(projectPath);
    return files.length === 0;
  } catch (error) {
    console.error('Error reading directory:', error);
    return false; // or throw, depending on your error handling strategy
  }
}
