import { Router, Request, Response } from 'express';
import { projectsManager } from '../managers';
import { logger } from '../utils/logger';

const routesRouter = Router();

routesRouter.get(
  '/:projectName/:serverName/:parentId/:routeId',
  async (req: Request, res: Response) => {
    try {
      const { projectName, serverName, parentId, routeId } = req.params;
      logger('restRouter get /:projectName/:serverName/:parentId/:routeId', {
        projectName,
        serverName,
        parentId,
        routeId,
      });

      const serverHash =
        await projectsManager.getProjectServersHash(projectName);
      if (!serverHash) {
        res.status(400).send({ success: false, message: 'project not exist' });

        return;
      }
      const server = serverHash[serverName];
      const parent = server.parentRoutesHash[parentId];
      const route = parent.routesHash?.[routeId];

      res.status(200).send({ success: true, route });
    } catch (error: any) {
      console.log(error);
      logger(
        'Error get /:projectName/:serverName/:parentId/:routeId',
        error?.message,
      );

      res.status(500).send({ success: false, message: 'fail to get route' });
    }
  },
);

export { routesRouter };
