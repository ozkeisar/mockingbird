import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';
import { getGlobalSocketIo } from '../socket';
import { createProject } from '../actions/general';

const projectRouter = Router();

projectRouter.post('/clone/ssh', async (req: Request, res: Response) => {
  try {
    const { projectName, sshUrl } = req.body;

    const socket = getGlobalSocketIo();

    await createProject(socket, {
      projectName,
      sshUrl,
      cloneType: 'SSH',
    });

    res.status(200).send({ success: true });
  } catch (error: any) {
    console.log(error);
    logger('Error restart server', error?.message);

    res
      .status(500)
      .send({ success: false, message: 'fail to ssh clone the project' });
  }
});

projectRouter.post('/clone/https', async (req: Request, res: Response) => {
  try {
    const { projectName, httpsUrl, username, password } = req.body;

    const socket = getGlobalSocketIo();

    await createProject(socket, {
      projectName,
      httpsUrl,
      username,
      password,
      cloneType: 'HTTPS',
    });

    res.status(200).send({ success: true });
  } catch (error: any) {
    console.log(error);
    logger('Error restart server', error?.message);

    res.status(500).send({ success: false, message: 'fail to restart server' });
  }
});

projectRouter.post('/open', async (req: Request, res: Response) => {
  try {
    const { projectName, directoryPath } = req.body;

    const socket = getGlobalSocketIo();

    await createProject(socket, {
      projectName,
      directoryPath,
      cloneType: 'OPEN',
    });

    res.status(200).send({ success: true });
  } catch (error: any) {
    console.log(error);
    logger('Error restart server', error?.message);

    res.status(500).send({ success: false, message: 'fail to restart server' });
  }
});

projectRouter.post('/create', async (req: Request, res: Response) => {
  try {
    const { projectName } = req.body;

    const socket = getGlobalSocketIo();

    await createProject(socket, {
      projectName,
      cloneType: 'LOCAL',
    });

    res.status(200).send({ success: true });
  } catch (error: any) {
    console.log(error);
    logger('Error restart server', error?.message);

    res.status(500).send({ success: false, message: 'fail to restart server' });
  }
});

export { projectRouter };
