import { Router, Request, Response } from 'express';
import { ProjectServer, RouteParentHash } from '../../types';
import { projectsManager } from '../managers';
import { logger } from '../utils/logger';
import {
  handleCloseServer,
  handleRestartServer,
  handleStartServer,
} from '../actions';
import { addRoutesFromSwaggerJson, addRoutesFromSwaggerUrl } from '../utils';
import { checkIServerUp } from '../server';

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



serverRouter.post('/load-swagger', async (req: Request, res: Response) => {
  try {
    const { projectName, serverName, type, swaggerUrl, swaggerJson } = req.body as {
      projectName: string,
      serverName: string,
      type: 'json' | 'url',
      swaggerUrl: string,
      swaggerJson: any
    };

    const iServerUp = checkIServerUp()
    /// check if server is running
    if(iServerUp){
      handleCloseServer();
    }

    logger('start load from swagger', { projectName, serverName });

    if(type === 'url'){
      await addRoutesFromSwaggerUrl(projectName, serverName, swaggerUrl)
    } else if(type === 'json'){
      await addRoutesFromSwaggerJson(projectName, serverName, JSON.parse(swaggerJson))
    }else {
      throw new Error("type must be type 'url' | 'json' ");
    }

    /// check if server was running
    if(iServerUp){
      await handleStartServer(projectName);
    }

    res.status(200).send({ success: true });
  } catch (error: any) {
    console.log(error);
    logger('Error load from swagger', error?.message);

    res.status(500).send({ success: false, message: error?.message || 'fail to load from swagger' });
  }
});

export { serverRouter };
