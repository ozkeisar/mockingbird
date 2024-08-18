import { Router, Request, Response } from 'express';
import {
  getProjectPresets,
  getProjectServers,
  updateServerData,
} from '../utils';
import { listToHashmap } from '../utils/utils';
import { emitGlobalSocketMessage } from '../socket';
import { EVENT_KEYS } from '../../types/events';

const presetsRouter = Router();

presetsRouter.get(
  '/:projectName/:presetFolderName/:presetName/apply',
  async (req: Request, res: Response) => {
    try {
      emitGlobalSocketMessage(EVENT_KEYS.DEBUG_LOG, req.params);

      const { projectName, presetFolderName, presetName } = req.params;

      const presetFolders = await getProjectPresets(projectName);

      const presetFolder = presetFolders.find(
        (folder) => folder.name === presetFolderName,
      );

      const preset = Object.values(presetFolder?.presetsHash || {}).find(
        (item) => item.name === presetName,
      );

      if (!presetFolder?.id || !preset?.id) {
        throw new Error('preset not found');
      }

      const servers = await getProjectServers(projectName);

      const serversHash = listToHashmap(servers, (server) => server.name);

      Object.values(preset?.routesHash || {}).forEach((presetRoute) => {
        const { serverId, parentId, routeId, responseId } = presetRoute;
        const parent = serversHash[serverId].parentRoutesHash[parentId];

        if (parent.type === 'GraphQl' && !!parent.graphQlRouteHash?.[routeId]) {
          parent.graphQlRouteHash[routeId].activeResponseId = responseId;
        } else if (parent.routesHash?.[routeId]) {
          parent.routesHash[routeId].activeResponseId = responseId;
        }
      });

      await Promise.all(
        Object.values(serversHash).map((server) => {
          return updateServerData(projectName, server);
        }),
      );

      emitGlobalSocketMessage(EVENT_KEYS.RELOAD, { projectName });
      res.status(200).send({ success: true });
    } catch (error: any) {
      res.status(500).send({
        success: false,
        message: error?.message || 'fail to apply preset',
      });
    }
  },
);

export { presetsRouter };
