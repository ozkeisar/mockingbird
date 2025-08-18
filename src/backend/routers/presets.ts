import { Router, Request, Response } from 'express';
import {
  getProjectPresets,
  getProjectServers,
  updateServerData,
} from '../utils';
import { listToHashmap } from '../utils/utils';
import { emitGlobalSocketMessage } from '../socket';
import { EVENT_KEYS } from '../../types/events';
import { validateCreatePresetFromLogs } from '../middleware/presetValidation';
import { createPresetFromLogs } from '../services/presetCreationService';
import { CreatePresetRequest } from '../utils/presetHelpers';

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

presetsRouter.post(
  '/create-from-logs',
  validateCreatePresetFromLogs,
  async (req: Request, res: Response) => {
    try {
      const result = await createPresetFromLogs(
        req.body as CreatePresetRequest,
      );

      if (!result.success) {
        const statusCode = result.message?.includes('not found') ? 404 : 400;
        return res.status(statusCode).json(result);
      }

      // Trigger client reload on success
      emitGlobalSocketMessage(EVENT_KEYS.RELOAD, {
        projectName: result.projectName,
      });

      return res.status(201).json(result);
    } catch (error: any) {
      console.error('Unexpected error in create-from-logs endpoint:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  },
);

export { presetsRouter };
