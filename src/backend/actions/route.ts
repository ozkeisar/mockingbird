import { Route } from '../../types';
import { EVENT_KEYS } from '../../types/events';
import { isRouteExist } from '../../utils/route';
import { projectsManager } from '../managers';
import { emitGlobalSocketMessage } from '../socket';
import { updateRouteParentFile } from '../utils/files';
import { hasUncommittedChanges } from '../utils/git';

export const createRoute = async (
  projectName: string,
  serverName: string,
  parentId: string,
  route: Route,
) => {
  const serverHash = await projectsManager.getProjectServersHash(projectName);
  const server = serverHash[serverName];

  if (!server) {
    throw new Error('server not exist');
  }

  const parent = server.parentRoutesHash[parentId];

  if (!parent) {
    throw new Error('parent not exist');
  }

  const routeExist = isRouteExist(route, parent);

  if (routeExist) {
    throw new Error('route already exist');
  }

  if (parent.routesHash) {
    parent.routesHash[route.id] = route;
  } else {
    parent.routesHash = {
      [route.id]: route,
    };
  }

  await updateRouteParentFile(projectName, serverName, parent);

  projectsManager.setProjectChanged(projectName);

  const hasDiffs = await hasUncommittedChanges(projectName);

  emitGlobalSocketMessage(EVENT_KEYS.UPDATE_ROUTES_FILE, {
    success: true,
    content: parent,
    filename: parent.filename,
    projectName,
    serverName,
    hasDiffs,
  });

  return route;
};
