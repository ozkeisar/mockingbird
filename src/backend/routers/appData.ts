import { Router, Request, Response } from 'express';
import { checkIServerUp } from '../server';
import {
  getActiveProjectName,
  getProjectsNameList,
  readAppSettings,
  updateAppSettings,
  verifyProjectFoldersExist,
} from '../utils';
import { generateUniqueIdentifier } from '../utils/utils';
import {
  GraphQlRoute,
  GraphQlRouteType,
  Method,
  ParentType,
  PresetsFolderHash,
  ProjectDataNew,
  ProjectSettings,
  Route,
  RouteParent,
  ServerSettings,
} from '../../types';
import { projectsManager } from '../managers';
import { logger } from '../utils/logger';

const appDataRouter = Router();

export type SimplifiedRoute = {
  id: string;
  name: string;
  type: Method;
};

export type SimplifiedGraphQlRoute = {
  id: string;
  name: string;
  type: GraphQlRouteType;
};

export type SimplifiedRouteParent = {
  id: string;
  name: string | null;
  type: ParentType;
  routesHash?: { [key: string]: SimplifiedRoute };
  graphQlRouteHash?: { [key: string]: SimplifiedGraphQlRoute };
};

export type SimplifiedRouteParentHash = {
  [key: string]: SimplifiedRouteParent;
};

export type SimplifiedProjectServer = {
  name: string;
  parentRoutesHash: SimplifiedRouteParentHash;
  settings: ServerSettings;
};

export type SimplifiedServersHash = {
  [key: string]: SimplifiedProjectServer;
};

export interface SimplifiedProjectData {
  serversHash: SimplifiedServersHash | null;
  settings: ProjectSettings | null;
  name: string;
  isDataUnsupported: boolean;
  presetFoldersHash: PresetsFolderHash | null;
  isDataInvalid: boolean;
  currentBranch: string | null;
  hasDiffs: boolean;
  branches: string[];
  isGitInit: boolean;
}

// Convert full project data into a structure used by the client
function simplifyProjectData(
  projectData: ProjectDataNew,
): SimplifiedProjectData {
  const simplifyRoute = (route: Route): SimplifiedRoute => ({
    id: route.id,
    name: route.description,
    type: route.method,
  });

  const simplifyGraphQlRoute = (
    route: GraphQlRoute,
  ): SimplifiedGraphQlRoute => ({
    id: route.id,
    name: route.name,
    type: route.type,
  });

  const simplifyRouteParent = (parent: RouteParent): SimplifiedRouteParent => {
    const simplifiedParent: SimplifiedRouteParent = {
      id: parent.id,
      name: parent.name,
      type: parent.type,
    };

    // Simplifying the routes within the parent
    if (parent.routesHash) {
      simplifiedParent.routesHash = Object.keys(parent.routesHash).reduce(
        (acc, routeId) => {
          const route = parent.routesHash![routeId];
          acc[routeId] = simplifyRoute(route);
          return acc;
        },
        {} as { [key: string]: SimplifiedRoute },
      );
    }

    // Simplifying the GraphQL routes within the parent
    if (parent.graphQlRouteHash) {
      simplifiedParent.graphQlRouteHash = Object.keys(
        parent.graphQlRouteHash,
      ).reduce(
        (acc, routeId) => {
          const route = parent.graphQlRouteHash![routeId];
          acc[routeId] = simplifyGraphQlRoute(route);
          return acc;
        },
        {} as { [key: string]: SimplifiedGraphQlRoute },
      );
    }

    return simplifiedParent;
  };

  const simplifiedServersHash: SimplifiedServersHash = Object.keys(
    projectData.serversHash || {},
  ).reduce((acc, serverId) => {
    const server = projectData.serversHash?.[serverId];
    if (!server) {
      return acc;
    }
    const simplifiedParentRoutesHash: SimplifiedRouteParentHash = Object.keys(
      server.parentRoutesHash || {},
    ).reduce((_acc, parentId) => {
      const parent = server?.parentRoutesHash?.[parentId];
      if (parent) {
        _acc[parentId] = simplifyRouteParent(parent);
      }
      return _acc;
    }, {} as SimplifiedRouteParentHash);

    acc[serverId] = {
      name: server.name,
      parentRoutesHash: simplifiedParentRoutesHash,
      settings: server.settings,
    };

    return acc;
  }, {} as SimplifiedServersHash);

  return {
    serversHash: simplifiedServersHash,
    settings: projectData.settings,
    name: projectData.name,
    isDataUnsupported: projectData.isDataUnsupported,
    presetFoldersHash: projectData.presetFoldersHash,
    isDataInvalid: projectData.isDataInvalid,
    currentBranch: projectData.currentBranch,
    hasDiffs: projectData.hasDiffs,
    branches: projectData.branches,
    isGitInit: projectData.isGitInit,
  };
}

// Endpoint to fetch simplified project data by project name
appDataRouter.get('/:projectName', async (req: Request, res: Response) => {
  try {
    const { projectName } = req.params;
    logger('appDataRouter get /:projectName', { projectName });

    const project = await projectsManager.getProjectData(projectName);

    res
      .status(200)
      .send({ success: true, project: simplifyProjectData(project) });
  } catch (error: any) {
    console.log(error);
    logger('Error appDataRouter get /:projectName', error?.message);

    res
      .status(500)
      .send({ success: false, message: 'fail to get project data' });
  }
});

appDataRouter.get('/', async (req: Request, res: Response) => {
  try {
    logger('appDataRouter get /');

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

    res.status(200).send({
      success: true,
      projectName,
      projectsNameList,
      appSettings,
      isServerUp,
    });

    if (projectName && projectName.length > 0) {
      projectsManager.getProjectData(projectName);
    }
  } catch (error: any) {
    console.log(error);
    logger('Error appDataRouter get /', error?.message);

    res
      .status(500)
      .send({ success: false, message: 'fail to get project data' });
  }
});

export { appDataRouter };
