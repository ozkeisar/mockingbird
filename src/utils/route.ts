import {
  GraphQlRoute,
  GraphQlRouteType,
  ProjectServer,
  Route,
  RouteParent,
} from '../types';
import { removeParameters } from './utils';

export const isRouteExist = (route: Route, parent: RouteParent) => {
  return Object.values(parent.routesHash || {}).find(
    (item) =>
      item.method.toLowerCase() === route.method?.toLowerCase() &&
      item.routePath.toLowerCase() === route.routePath.toLowerCase() &&
      (!!route.paramValue?.length && !!route.paramKey?.length
        ? item.paramType === route.paramType &&
          item.paramValue === route.paramValue &&
          item.paramKey === route.paramKey
        : !item.paramKey || !item.paramValue),
  );
};

export const findMatchedGraphqlRoute = (
  schemaPath: string,
  path: string,
  type: GraphQlRouteType,
  server: ProjectServer,
) => {
  const route = Object.values(server.parentRoutesHash).reduce(
    (acc, parent) => {
      const queries = Object.values(parent.graphQlRouteHash || {});
      if (
        parent.type === 'GraphQl' &&
        parent.path === path &&
        parent.graphqlQueriesType === type &&
        schemaPath?.startsWith(parent.schemaPath || '') &&
        queries.length > 0
      ) {
        const _route = queries.find((query) => {
          return (
            removeParameters(`${parent.schemaPath}.${query.name}`) ===
            removeParameters(schemaPath)
          );
        });
        return acc || _route || null;
      }

      return acc;
    },
    null as GraphQlRoute | null,
  );

  return route;
};
