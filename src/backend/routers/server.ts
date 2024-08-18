import { Router, Request, Response } from 'express';
import { ProjectServer, RouteParentHash } from '../../types';
import { projectsManager } from '../managers';
import { logger } from '../utils/logger';

const serverRouter = Router();

serverRouter.get(
  '/:projectName/:serverName',
  async (req: Request, res: Response) => {
    try {
      const { projectName, serverName } = req.params;
      logger('serverRouter get /:projectName/:serverName', {
        projectName,
        serverName,
      });

      const serverHash =
        await projectsManager.getProjectServersHash(projectName);
      if (!serverHash) {
        res.status(400).send({ success: false, message: 'project not exist' });

        return;
      }
      const server: ProjectServer = serverHash[serverName];

      server.parentRoutesHash = Object.values(server.parentRoutesHash).reduce(
        (acc, item) => {
          acc[item.id] = {
            ...item,
            graphQlRouteHash: null,
            routesHash: null,
          };
          return acc;
        },
        {} as RouteParentHash,
      );

      res.status(200).send({ success: true, server });
    } catch (error: any) {
      console.log(error);
      logger('Error get /:projectName/:serverName', error?.message);

      res.status(500).send({ success: false, message: 'fail to get server' });
    }
  },
);

export { serverRouter };
