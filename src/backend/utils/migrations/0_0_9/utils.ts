
type Method = 'post' | 'get' | 'put' | 'delete' | 'patch';
type RouteResponseType = 'func' | 'obj' | 'proxy';
type ParamType = 'body' | 'query' | 'params';

type ServerSettings_migrationV0_0_9 = {
    proxyBaseUrl: string | null;
    forceProxy: boolean | null;
    delay: number | null;
    port: number;
}
interface ProjectSettings_migrationV0_0_9  {
    forceProxy: boolean | null;
    dataVersion: string;
}

interface RouteResponse_migrationV0_0_9 {
    id: string;
    name: string;
    description: string;
    res: {code: number; data: {}, headers: {[key: string]: any}} | null ;
    exec: string | null ;
    url: string | null ;
    type: RouteResponseType;
} 

interface RouteOld_migrationV0_0_9 {
    id: string;
    description: string;
    routePath: string;
    method: Method;
    activeResponseIndex: number;
    responses: RouteResponse_migrationV0_0_9[];

    paramType?: ParamType;
    paramValue?: string;
    paramKey?: string;
}

interface RouteParentOld_migrationV0_0_9 {
    id: string;
    filename: string;
    routes: RouteOld_migrationV0_0_9[];
    path: string;
}

interface ProjectServerOld_migrationV0_0_9 {
    name: string,
    parentRoutes: RouteParentOld_migrationV0_0_9[],
    settings: ServerSettings_migrationV0_0_9
}



///New types

interface ServerHash_migrationV0_0_9 {
    name: string,
    parentRoutesHash: {
        [key:string]: ParentHash_migrationV0_0_9
    },
    settings: ServerSettings_migrationV0_0_9
}

interface ParentHash_migrationV0_0_9 {
    id: string;
    filename: string;
    routesHash: {
        [key:string]: RouteHash_migrationV0_0_9
    };
    path: string;
} 

interface RouteHash_migrationV0_0_9 {
    id: string;
    description: string;
    routePath: string;
    method: Method;
    activeResponseId: string;
    responsesHash: {
        [key:string] : RouteResponse_migrationV0_0_9
    };
    withParams: boolean;
    paramType?: ParamType;
    paramValue?: string;
    paramKey?: string;
}
