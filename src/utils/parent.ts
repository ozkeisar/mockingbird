import { GraphQlRouteType, ProjectServer, RouteParent } from "../types";
import { findMatchedGraphqlRoute } from "./route";
import { removeParameters } from "./utils";

type ParentProperties = {
    filenames: string[];
    paths: string[];
    graphQlNames: string[];
    restPaths: string[];
    graphQlPaths: string[];
  }
  
  export const parentsProperties = (server: ProjectServer)=>{
    const { filenames, paths, graphQlNames, restPaths, graphQlPaths } =
    Object.values(server.parentRoutesHash || {}).reduce(
      (acc, parent) => {
        acc.filenames.push(parent.filename.toLowerCase());
        acc.paths.push(parent.path.toLowerCase());
  
        if (parent.type === 'GraphQl') {
          acc.graphQlPaths.push(parent.path.toLowerCase());
        } else {
          acc.restPaths.push(parent.path.toLowerCase());
        }
        if (parent.name) {
          acc.graphQlNames.push(parent.name.toLowerCase());
        }
  
        return acc;
      },
      {
        filenames: [],
        paths: [],
        graphQlNames: [],
        restPaths: [],
        graphQlPaths: [],
      } as ParentProperties
    );
  
    return {
      filenames,
      paths,
      graphQlNames, 
      restPaths, 
      graphQlPaths
    }
  }

  export const findParent = async (server: ProjectServer, serverName: string, parent: RouteParent)=>{

    const isGraphQL = parent.type === 'GraphQl'

    return Object.values(server.parentRoutesHash || {}).find((item)=>{
      if(isGraphQL && parent.type === 'GraphQl'){
        return item.path === parent.path && item.schemaPath === parent.schemaPath
      }
      return item.path === parent.path && item.type === parent.type
    })
  }
  
  
  export const isParentExist = (server: ProjectServer, parentsProperties: ParentProperties, parent: RouteParent)=>{
    const {  
      filenames,
      paths,
      graphQlNames, 
      restPaths, 
    } = parentsProperties
  
    const filenameAlreadyExist =
      filenames?.includes(parent.filename.toLowerCase());
  
    const nameAlreadyExist =
      graphQlNames?.includes((parent.name || '').toLowerCase()) 
  
    const pathAlreadyExist =
      paths?.includes(parent.path.toLowerCase()) 
      
    const restPathAlreadyExist =
      restPaths?.includes(parent.path.toLowerCase()) 
  
    const matchedGraphqlParent = findMatchedGraphqlParent(
      parent.schemaPath || '',
      parent.path,
      parent.graphqlQueriesType,
      server,
    );
  
    const matchedQueries = parent.graphqlQueriesType && findMatchedGraphqlRoute(
      parent.schemaPath || '',
      parent.path,
      parent.graphqlQueriesType,
      server,
    );
  
    const schemaAlreadyExist =
      (!!matchedQueries || !!matchedGraphqlParent ) && !!parent.schemaPath;
  
  
    const isGraphQL = parent.type === 'GraphQl';
  
    const parentExist = !!filenameAlreadyExist || 
    (isGraphQL ? restPathAlreadyExist : pathAlreadyExist) ||
    (isGraphQL && schemaAlreadyExist) ||
    (isGraphQL && nameAlreadyExist)
  
    return {
      filenameAlreadyExist,
      nameAlreadyExist,
      pathAlreadyExist,
      restPathAlreadyExist,
      matchedGraphqlParent,
      matchedQueries,
      schemaAlreadyExist,
      parentExist
    }
  }



export const findMatchedGraphqlParent = (
    schemaPath: string,
    path: string,
    type: GraphQlRouteType | null,
    server: ProjectServer,
  ) => {
    return Object.values(server.parentRoutesHash).find((parent) => {
      return (
        parent.type === 'GraphQl' &&
        parent.path === path &&
        parent.graphqlQueriesType === type &&
        removeParameters(parent.schemaPath) === removeParameters(schemaPath)
      );
    });
  };
  
  