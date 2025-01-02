import { RouteParent } from '../../types';
import { EVENT_KEYS } from '../../types/events';
import { isParentExist, parentsProperties } from '../../utils/parent';
import { projectsManager } from '../managers';
import { emitGlobalSocketMessage } from '../socket';
import { updateRouteParentFile } from '../utils/files';
import { hasUncommittedChanges } from '../utils/git';

export const createParent = async (
  projectName: string,
  serverName: string,
  parent: RouteParent,
) => {
  const serversHash = await projectsManager.getProjectServersHash(projectName);
  const server = serversHash[serverName];

  if (!server) {
    throw new Error('server not exist');
  }

  const { filenames, paths, graphQlNames, restPaths, graphQlPaths } =
    parentsProperties(server);

  const { parentExist } = isParentExist(
    server,
    {
      filenames,
      paths,
      graphQlNames,
      restPaths,
      graphQlPaths,
    },
    parent,
  );

  if (parentExist) {
    throw new Error('parent already exist');
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

  return parent;
};
