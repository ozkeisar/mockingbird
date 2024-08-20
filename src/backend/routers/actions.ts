import { Router, Request, Response } from 'express';
import {
  handleCloseServer,
  handleRestartServer,
  handleStartServer,
} from '../actions';
import { logger } from '../utils/logger';

const actionsRouter = Router();

actionsRouter.post('/server/start', async (req: Request, res: Response) => {
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

actionsRouter.post('/server/close', async (req: Request, res: Response) => {
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

actionsRouter.post('/server/restart', async (req: Request, res: Response) => {
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

export { actionsRouter };
