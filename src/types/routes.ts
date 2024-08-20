export type Method = 'post' | 'get' | 'put' | 'delete' | 'patch';
export type ResponseType = 'func' | 'obj' | 'proxy';
export type ParamType = 'body' | 'query' | 'params';
export type ParentType = 'Rest' | 'GraphQl';
export type GraphQlRouteType = 'Query' | 'Mutation';

export type ServerSettings = {
  proxyBaseUrl: string | null;
  forceProxy: boolean | null;
  delay: number | null;
  port: number;
  reWriteCookieDomain: boolean | null;
  simplifyCookies: boolean | null;
  duplicateCookies: boolean | null;
};

export type ProjectSettings = {
  forceProxy: boolean | null;
  dataVersion: string;
};

export interface RouteResponse {
  id: string;
  name: string;
  description: string;
  res: { code: number; data: {}; headers: { [key: string]: any } } | null;
  exec: string | null;
  url: string | null;
  type: ResponseType;
  blockProxy: boolean | null;
}

export interface RouteResponseHash {
  [key: string]: RouteResponse;
}

export interface Route {
  id: string;
  description: string;
  routePath: string;
  method: Method;
  activeResponseId: string;
  responsesHash: RouteResponseHash | null;
  withParams: boolean;
  paramType: ParamType;
  paramValue: string | null;
  paramKey: string | null;
}

export interface GraphQlRouteResponse {
  id: string;
  name: string;
  description: string;
  res: { [key: string]: any } | null;
  exec: string | null;
  url: string | null;
  type: ResponseType;
  schema: string;
  schemaTypeName: string;
}

export interface GraphQlRouteResponseHash {
  [key: string]: GraphQlRouteResponse;
}
export interface GraphQlRoute {
  id: string;
  description: string;
  name: string;
  type: GraphQlRouteType;
  activeResponseId: string;
  responsesHash: GraphQlRouteResponseHash | null;
}

export interface RouteHash {
  [key: string]: Route;
}

export interface GraphQlRouteHash {
  [key: string]: GraphQlRoute;
}

export interface RouteParent {
  id: string;
  type: ParentType;
  filename: string;
  name: string | null;
  routesHash: RouteHash | null;
  graphQlRouteHash: GraphQlRouteHash | null;
  graphqlQueriesType: GraphQlRouteType | null;
  path: string;
  schemaPath: string | null;
}

export interface RouteParentHash {
  [key: string]: RouteParent;
}

export interface ProjectServer {
  name: string;
  parentRoutesHash: RouteParentHash;
  settings: ServerSettings;
}
export interface ServersHash {
  [key: string]: ProjectServer;
}
