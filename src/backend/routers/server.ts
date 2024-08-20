import { Router, Request, Response } from 'express';
import { ProjectServer, RouteParentHash } from '../../types';
import { projectsManager } from '../managers';
import { logger } from '../utils/logger';
import {
  handleCloseServer,
  handleRestartServer,
  handleStartServer,
} from '../actions';

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

serverRouter.post('/start', async (req: Request, res: Response) => {
  try {
    const { projectName } = req.body;

    logger('start server', { projectName });

    const { host } = await handleStartServer(projectName);

    res.status(200).send({ success: true, host });
  } catch (error: any) {
    console.log(error);
    logger('Error start server', error?.message);

    res.status(500).send({ success: false, message: 'fail to start server' });
  }
});

serverRouter.post('/close', async (req: Request, res: Response) => {
  try {
    logger('close server');

    handleCloseServer();

    res.status(200).send({ success: true });
  } catch (error: any) {
    console.log(error);
    logger('Error close server', error?.message);

    res.status(500).send({ success: false, message: 'fail to close server' });
  }
});

serverRouter.post('/restart', async (req: Request, res: Response) => {
  try {
    const { projectName } = req.body;

    logger('restart server', { projectName });

    handleRestartServer(projectName);

    res.status(200).send({ success: true });
  } catch (error: any) {
    console.log(error);
    logger('Error restart server', error?.message);

    res.status(500).send({ success: false, message: 'fail to restart server' });
  }
});

export { serverRouter };
