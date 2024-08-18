export type ServerLogType = 'proxy' | 'local' | 'error';

export interface ResponseLog {
  status: number;
  data: any;
  headers: {};
}

export interface LogMetadata {
  id: string;
  type: ServerLogType;
  serverName: string;
}

export interface ServerLog {
  metadata: LogMetadata;
  request: {
    url: string;
    params: { [key: string]: any };
    query: { [key: string]: any };
    body: { [key: string]: any };
    headers: {};
    method: string;
    ip: string;
    protocol: string;
    route: string;
  };
  response: ResponseLog;
  proxy: {
    request: {
      url: string;
      body: { [key: string]: any };
      headers: {};
      method: string;
    };
    response: ResponseLog;
  };
  timestamp: number;
}
