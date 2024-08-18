export type MethodMV009 = 'post' | 'get' | 'put' | 'delete' | 'patch';
export type RouteResponseTypeMV009 = 'func' | 'obj' | 'proxy';
export type ParamTypeMV009 = 'body' | 'query' | 'params';

export type ServerSettingsMV009 = {
  proxyBaseUrl: string | null;
  forceProxy: boolean | null;
  delay: number | null;
  port: number;
};

export interface ProjectSettingsMV009 {
  forceProxy: boolean | null;
  dataVersion: string;
}

export interface RouteResponseMV009 {
  id: string;
  name: string;
  description: string;
  res: { code: number; data: {}; headers: { [key: string]: any } } | null;
  exec: string | null;
  url: string | null;
  type: RouteResponseTypeMV009;
}

export interface RouteOldMV009 {
  id: string;
  description: string;
  routePath: string;
  method: MethodMV009;
  activeResponseIndex: number;
  responses: RouteResponseMV009[];

  paramType?: ParamTypeMV009;
  paramValue?: string;
  paramKey?: string;
}

export interface RouteParentOldMV009 {
  id: string;
  filename: string;
  routes: RouteOldMV009[];
  path: string;
}

export interface ProjectServerOldMV009 {
  name: string;
  parentRoutes: RouteParentOldMV009[];
  settings: ServerSettingsMV009;
}

/// New types

export interface RouteHashMV009 {
  id: string;
  description: string;
  routePath: string;
  method: MethodMV009;
  activeResponseId: string;
  responsesHash: {
    [key: string]: RouteResponseMV009;
  };
  withParams: boolean;
  paramType?: ParamTypeMV009;
  paramValue?: string;
  paramKey?: string;
}

export interface ParentHashMV009 {
  id: string;
  filename: string;
  routesHash: {
    [key: string]: RouteHashMV009;
  };
  path: string;
}

export interface ServerHashMV009 {
  name: string;
  parentRoutesHash: {
    [key: string]: ParentHashMV009;
  };
  settings: ServerSettingsMV009;
}
