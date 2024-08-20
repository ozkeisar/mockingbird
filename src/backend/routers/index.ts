import express from 'express';
import { presetsRouter } from './presets';
import { routesRouter } from './routes';
import { serverRouter } from './server';
import { parentsRouter } from './parents';
import { appDataRouter } from './appData';
import { actionsRouter } from './actions';
import { serverLogsRouter } from './serverLogs';

export const routes = express.Router();

routes.use('/actions', actionsRouter);
routes.use('/presets', presetsRouter);
routes.use('/routes', routesRouter);
routes.use('/servers', serverRouter);
routes.use('/parents', parentsRouter);
routes.use('/app-data', appDataRouter);
routes.use('/server-logs', serverLogsRouter);
