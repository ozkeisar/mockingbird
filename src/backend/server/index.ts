import express, { Router, Request, Response, NextFunction } from 'express';
// import logger from 'morgan';
import cors from 'cors';
import * as http from 'http';
import axios from 'axios';
import {
  buildProxyResLog,
  buildRequestOptions,
  getSelectedRoute,
  handleGraphQlRoutes,
  handleResponse,
  updateResponseHeaders,
} from './utils';
import { deleteLog, getLog, sendLog, updateLog } from './logger';
import {
  getCurrentIPAddresses,
  getProjectServersNameList,
  hashmapToList,
  readServerData,
  readServerSettings,
} from '../utils';
import { Route, RouteParent } from '../../types';
import { buildUrl } from '../../utils/utils';

const nocache = require('nocache');
const { v4: uuidv4 } = require('uuid');

let servers: http.Server[] = [];

function loggerMiddleware(
  projectName: string,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const originalSend = res.send;
  console.log('Req originalUrl: ', req.originalUrl);
  let logged = false;

  // eslint-disable-next-line func-names
  res.send = function (this: Response, data: any) {
    try {
      if (!logged) {
        logged = true;

        const savedData = getLog((req as any).id);

        const response = {
          status: res.statusCode,
          data,
          headers: res.getHeaders(),
        };

        sendLog(
          projectName,
          req,
          response,
          {
            type: savedData.logType,
            serverName: savedData.serverName,
            id: uuidv4(),
          },
          {
            request: savedData.proxyRequest,
            response: savedData.proxyResponse,
          },
        );

        deleteLog((req as any).id);
      }
    } catch (error) {
      console.log('error log', error);
    }
    return originalSend.call(this, data);
  };

  next();
}

export const startServer = async (
  projectName: string,
  serverName: string,
  host: string,
) => {
  const routeParentsHash = await readServerData(projectName, serverName);
  const { restParents, graphQlParents } = Object.values(
    routeParentsHash,
  ).reduce(
    (acc, item) => {
      if (item.type === 'GraphQl') {
        acc.graphQlParents.push(item);
      } else {
        acc.restParents.push(item);
      }

      return acc;
    },
    { restParents: [], graphQlParents: [] } as {
      restParents: RouteParent[];
      graphQlParents: RouteParent[];
    },
  );
  const serverSettings = await readServerSettings(projectName, serverName);

  const app = express();

  app.use(express.raw());
  app.use(express.text());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use((req, res, next) => {
    try {
      (req as any).id = uuidv4();
      updateLog((req as any).id, { serverName, logType: 'local' });
    } catch (error) {
      console.log('error ----- set uuid');
    }
    next();
  });
  app.set('etag', false);
  app.use(nocache());
  app.use(cors());
  // app.use(logger('[:date[clf]] :method :url :status - :response-time ms'));

  app.use((req, res, next) => {
    if (serverSettings?.delay && serverSettings?.delay > 0) {
      setTimeout(next, serverSettings?.delay);
    } else {
      next();
    }
  });

  // Use the logger middleware
  app.use((req, res, next) => loggerMiddleware(projectName, req, res, next));

  /// //graphQL
  handleGraphQlRoutes(app, serverName, graphQlParents, serverSettings);

  restParents.forEach((routeParent) => {
    const router = Router();

    const routes = hashmapToList(routeParent?.routesHash || {});

    const switchRoutes = routes.filter(
      (route) =>
        !!route?.paramType &&
        !!route?.paramKey?.length &&
        !!route?.paramValue?.length,
    );
    const crudRoutes = routes.filter(
      (route) =>
        !(
          !!route?.paramType &&
          !!route?.paramKey?.length &&
          !!route?.paramValue?.length
        ),
    );

    const routeObj = switchRoutes.reduce(
      (acc, route) => {
        const key = `${route.routePath}${route.routePath}`;
        if (acc[key]) {
          acc[key].push(route);
        } else {
          acc[key] = [route];
        }
        return acc;
      },
      {} as { [key: string]: Route[] },
    );

    Object.keys(routeObj).forEach((key) => {
      const routeList = routeObj[key];
      const { method, routePath } = routeList[0];

      router[method](
        routePath,
        async (req: Request, res: Response, next: NextFunction) => {
          const selectedRoute = getSelectedRoute(req, routeList);
          if (selectedRoute) {
            handleResponse({
              host,
              serverName,
              route: selectedRoute,
              req,
              res,
              next,
              serverSettings,
            });
          }
          next();
        },
      );
    });

    crudRoutes.forEach((route) => {
      const { method, routePath } = route;
      router[method](
        routePath,
        async (req: Request, res: Response, next: NextFunction) => {
          handleResponse({
            host,
            serverName,
            route,
            req,
            res,
            next,
            serverSettings,
          });
        },
      );
    });
    app.use(routeParent.path, router);
  });

  app.use(async (req, res) => {
    if (!serverSettings?.proxyBaseUrl) {
      updateLog((req as any).id, {
        logType: 'error',
        serverName,
      });
      res.status(500).send({
        message: 'mock not exist for this call and target server is not set',
      });
      return;
    }

    const proxyUrl = buildUrl(serverSettings.proxyBaseUrl, req.url);

    try {
      const reqOptions = buildRequestOptions(proxyUrl, req, serverSettings);
      updateLog((req as any).id, {
        logType: 'proxy',
        serverName,
        proxyRequest: reqOptions,
      });

      const proxyRes = await axios(reqOptions);
      const proxyResLog = buildProxyResLog(proxyRes);
      updateLog((req as any).id, { proxyResponse: proxyResLog });

      updateResponseHeaders({
        res,
        headers: proxyRes.headers,
        host,
        proxyUrl: serverSettings?.proxyBaseUrl || '',
        serverSettings,
      });
      res.status(proxyRes.status).send(proxyRes.data);
    } catch (error: any) {
      console.log('====error', req.method, proxyUrl);
      const proxyResLog = buildProxyResLog(error.response || {});

      updateLog((req as any).id, {
        logType: 'error',
        proxyResponse: proxyResLog,
      });

      if (error?.response) {
        res.status(error?.response.status).send(error?.response.data);
      } else {
        res.status(500).send('proxy server fail');
      }
    }
  });

  const server = app.listen(serverSettings.port as number, host, () => {
    console.log(
      `--------app listening on http://${host}:${serverSettings.port}`,
    );
  });

  return server;
};

export const startProjectServers = async (projectName: string) => {
  const iPAddresses = getCurrentIPAddresses();
  const host = iPAddresses[0];
  const projectServersNameList = await getProjectServersNameList(projectName);

  servers = await Promise.all(
    projectServersNameList.map(async (serverName) => {
      return startServer(projectName, serverName, host);
    }),
  );

  return { host };
};

export const closeServer = (server: http.Server) => {
  if (server) {
    server.close();

    console.log(`--------server is down `);
  }
};

export const closeProjectServers = () => {
  servers.forEach((server) => {
    closeServer(server);
  });

  servers = [];
};

export const checkIServerUp = () => {
  return servers.length > 0;
};
