import os from 'os';
import jwt from 'jsonwebtoken';
import { SECRET_KEY, DEFAULT_SERVER_SETTINGS } from '../../consts';
import {
  getProjectPath,
  getProjectServersNameList,
  getProjectSettingsPath,
  getProjectsNameList,
  getServerDataPath,
  getServerPath,
  getServerSettingsPath,
  getServersFolderPath,
  readAppSettings,
  readServerData,
  readServerSettings,
  updateAppSettings,
  updatePresetFile,
  updateRouteParentFile,
  updateServerSettings,
  verifyProjectFoldersExist,
} from './files';
import pjson from '../../../package.json';
import {
  ExampleGraphqlNestedData,
  ExampleGraphqlParent,
  ExamplePresets,
  ExampleRestData,
  ExampleServerName,
  ExampleServerSettings,
} from '../../consts/exampleProject';
import { ProjectServer, ServerSettings } from '../../types';

export const stringifyWithFunctions = (obj: any) =>
  JSON.stringify(obj, (key, value) => {
    if (typeof value === 'function') {
      return value.toString();
    }
    return value;
  });

export const addCredentialsToGitURI = (
  uri: string,
  username: string,
  password: string,
) => {
  // Split the URI into different parts
  const parts = uri.split('://');

  // Construct the new URI with username and password
  const updatedURI = `${parts[0]}://${encodeURIComponent(
    username,
  )}:${encodeURIComponent(password)}@${parts[1]}`;

  return updatedURI;
};

export const verifyProjectFolderExist = async (repoFolderName: string) => {
  verifyProjectFoldersExist();

  await getProjectPath(repoFolderName);
  await getServersFolderPath(repoFolderName);
  await getProjectSettingsPath(repoFolderName);
};

export const verifyServerFoldersExist = (
  projectName: string,
  serverName: string,
) => {
  getServerDataPath(projectName, serverName);
  getServerSettingsPath(projectName, serverName);
  getServerPath(projectName, serverName);

  verifyProjectFolderExist(projectName);
};

export const getCurrentIPAddresses = () => {
  const interfaces = os.networkInterfaces();
  const ipAddresses: string[] = [];
  // Iterate over network interfaces

  Object.keys(interfaces).forEach((ifname) => {
    interfaces[ifname]?.forEach((iface) => {
      // Exclude internal and IPv6 addresses
      if (!iface.internal && iface.family === 'IPv4') {
        ipAddresses.push(iface.address);
      }
    });
  });

  return ipAddresses;
};

export const detectIPAddressChanges = (callback: (ip: string) => void) => {
  let currentIPAddresses = getCurrentIPAddresses();
  setInterval(() => {
    const newIPAddresses = getCurrentIPAddresses();
    if (JSON.stringify(currentIPAddresses) !== JSON.stringify(newIPAddresses)) {
      if (callback) {
        callback(newIPAddresses[0]);
      }
      currentIPAddresses = newIPAddresses;
    }
  }, 1000); // Check every second
};

export const isFirstVersionGreater = (version1: string, version2: string) => {
  if (!version2) {
    return true;
  }
  if (version1 === version2) {
    return false;
  }
  const v1 = version1.split('.').map(Number);
  const v2 = version2.split('.').map(Number);

  for (let i = 0; i < Math.max(v1.length, v2.length); i += 1) {
    const num1 = v1[i] || 0;
    const num2 = v2[i] || 0;

    if (num1 < num2) {
      return false;
    }
    if (num1 > num2) {
      return true;
    }
  }

  // If both versions are equal, return true
  return true;
};

const verifyJWT = (jwtToken: string, username: string, secretKey: string) => {
  try {
    const decoded = jwt.verify(jwtToken, secretKey) as any;

    if (decoded.untilVersion && decoded.username) {
      return (
        decoded.username === username &&
        isFirstVersionGreater(decoded.untilVersion, pjson.version)
      );
    }
    return false;
  } catch (error) {
    console.log('verifyJWT decoded error', error);
    return false;
  }
};

export const activateProgram = async (key: string) => {
  const { username } = os.userInfo();

  const isValid = verifyJWT(key, username, SECRET_KEY);

  if (isValid) {
    const appSettings = await readAppSettings();

    await updateAppSettings({
      ...appSettings,
      activationKey: key,
    });

    return true;
  }
  return false;
};

export const getActiveProjectName = async () => {
  const appSettings = await readAppSettings();

  const projectsNameList = await getProjectsNameList();

  if (
    !!appSettings.activeProject &&
    projectsNameList.includes(appSettings.activeProject)
  ) {
    return appSettings.activeProject;
  }
  if (projectsNameList[0]) {
    return projectsNameList[0];
  }
  return null;
};

export const createNewServer = async (
  projectName: string,
  serverName: string,
  settings: ServerSettings,
) => {
  await verifyServerFoldersExist(projectName, serverName);
  await updateServerSettings(projectName, serverName, {
    ...DEFAULT_SERVER_SETTINGS,
    ...settings,
  });
};

export const createExampleProject = async (projectName: string) => {
  await createNewServer(projectName, ExampleServerName, ExampleServerSettings);
  await updateRouteParentFile(projectName, ExampleServerName, ExampleRestData);
  await updateRouteParentFile(
    projectName,
    ExampleServerName,
    ExampleGraphqlParent,
  );
  await updateRouteParentFile(
    projectName,
    ExampleServerName,
    ExampleGraphqlNestedData,
  );
  await updatePresetFile(projectName, ExamplePresets);
};

export const getProjectServers = async (projectName: string) => {
  const projectServersNameList = await getProjectServersNameList(projectName);

  const servers: ProjectServer[] = await Promise.all(
    projectServersNameList.map(async (serverName: string) => {
      await verifyServerFoldersExist(projectName, serverName);

      const parentRoutesHash = await readServerData(projectName, serverName);
      const settings = await readServerSettings(projectName, serverName);

      return {
        name: serverName,
        parentRoutesHash,
        settings,
      };
    }),
  );

  return servers;
};
