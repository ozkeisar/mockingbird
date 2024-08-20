import { Router, Request, Response } from 'express';
import { serverLogsManager } from '../managers';
import { logger } from '../utils/logger';

const serverLogsRouter = Router();

serverLogsRouter.get('/:projectName', async (req: Request, res: Response) => {
  try {
    const { projectName } = req.params;
    const { search } = req.query as { search: string | undefined };
    logger('serverLogsRouter get /:projectName', { projectName });

    const logs = serverLogsManager.getLogs(projectName).filter((item) => {
      return JSON.stringify(item).includes(search || '');
    });
    res.status(200).send({ success: true, logs });
  } catch (error: any) {
    console.log(error);
    logger('Error serverLogsRouter get /:projectName', error?.message);

    res.status(500).send({ success: false, message: 'fail to get logs' });
  }
});

serverLogsRouter.delete(
  '/:projectName',
  async (req: Request, res: Response) => {
    try {
      const { projectName } = req.params;

      logger('restRouter delete /:projectName/:serverName/:parentId/:routeId', {
        projectName,
      });

      serverLogsManager.clearLogs(projectName);
      res.status(200).send({ success: true });
    } catch (error: any) {
      console.log(error);
      logger('Error delete /:projectName', error?.message);

      res.status(500).send({ success: false, message: 'fail to delete logs' });
    }
  },
);

export { serverLogsRouter };
