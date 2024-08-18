import { Request } from 'express';
import {
  LogMetadata,
  ResponseLog,
  ServerLog,
  ServerLogType,
} from '../../types';
import { serverLogsManager } from '../managers';
import { EVENT_KEYS } from '../../types/events';
import { emitGlobalSocketMessage } from '../socket';

const requestsLog: { [key: string]: any } = {};

export const sendLog = (
  projectName: string,
  req: Request,
  res: ResponseLog,
  metadata: LogMetadata,
  proxy: any,
) => {
  const url = req.originalUrl;
  const { params } = req;
  const { query } = req;
  const { body } = req;
  const { headers } = req;
  const { method } = req;
  const ip = req.ip || '';
  const { protocol } = req;
  const route = req.route ? req.route.path : '';

  const log: ServerLog = {
    metadata,
    request: {
      url,
      params,
      query,
      body,
      headers,
      method,
      ip,
      protocol,
      route,
    },
    response: res,
    proxy,
    timestamp: new Date().getTime(),
  };
  serverLogsManager.addLog(projectName, log);
  try {
    emitGlobalSocketMessage(EVENT_KEYS.SERVER_LOGGER, { log });
  } catch (error) {
    console.log(error);
  }
};

export const updateLog = (
  id: string,
  obj: {
    serverName?: string;
    logType?: ServerLogType;
    proxyResponse?: any;
    proxyRequest?: any;
  },
) => {
  try {
    requestsLog[id] = {
      ...(requestsLog[id] || {}),
      ...obj,
    };
  } catch (error) {
    console.log('updateLog error', error);
  }
};

export const getLog = (id: string) => {
  return requestsLog[id];
};

export const deleteLog = (id: string) => {
  delete requestsLog[id];
  return true;
};
