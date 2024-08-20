import {
  GraphQlRoute,
  GraphQlRouteType,
  ProjectServer,
  RouteParent,
} from '../../types';
import { mergeObjects, removeParameters } from '../../utils/utils';
import {
  isSomeChildrenLeafs,
  ParsedQuery,
  removeSquareBrackets,
} from './general';

function isMutation(query: string): boolean {
  const trimmedQuery = query.trim();
  return trimmedQuery.startsWith('mutation');
}

function isQuery(query: string): boolean {
  const trimmedQuery = query.trim();
  return trimmedQuery.startsWith('query');
}

export function determineQueryType(query: string): GraphQlRouteType {
  if (isMutation(query)) {
    return 'Mutation';
  }
  if (isQuery(query)) {
    return 'Query';
  }
  return 'Query';
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

type TreeObject = {
  [key: string]: TreeObject | {};
};

export interface QueryData extends ParsedQuery {
  parent?: RouteParent | null;
  route?: GraphQlRoute | null;
}

const findMatchQueryOnParent = (queryName: string, parent: RouteParent) => {
  const queries = Object.values(parent.graphQlRouteHash || {});
  return queries.find(
    (query) => query.name.split('(')[0] === queryName.split('(')[0],
  );
};

export const findParentTest = (
  obj: TreeObject | null,
  key: string,
  schemaPath: string,
  path: string,
  type: GraphQlRouteType,
  level: number,
  server: ProjectServer,
) => {
  if (!obj) {
    return [];
  }
  const isWrappers = [0, 1].includes(level);

  const parent = isWrappers
    ? null
    : findMatchedGraphqlParent(schemaPath, path, type, server);

  const route = parent ? findMatchQueryOnParent(key, parent) : null;

  const queryData: QueryData = {
    key,
    parent,
    route,
    schemaPath,
    level,
  };

  if (!isSomeChildrenLeafs(obj)) {
    const _schemaPath = schemaPath?.length > 0 ? `${schemaPath}.` : schemaPath;
    const queriesDataArr: QueryData[][] = Object.keys(obj).map((_key) =>
      findParentTest(
        obj[_key],
        _key,
        isWrappers ? schemaPath : _schemaPath + key,
        path,
        type,
        ++level,
        server,
      ),
    );

    const queriesData = queriesDataArr.flat();

    if (
      queriesData.some((item) => !!item.route) ||
      (queriesData.some((item) => !!item.parent) && !queryData.route)
    ) {
      return queriesData;
    }

    if (queryData.route) {
      return [queryData];
    }
    return queriesData;
  }

  return [queryData];
};

function eliminateDuplicates(items: QueryData[]): QueryData[] {
  const seen = new Set<string>();
  const result: QueryData[] = [];

  items.forEach((item) => {
    const uniqueIdentifier = `${item.schemaPath}`;

    if (!seen.has(uniqueIdentifier)) {
      seen.add(uniqueIdentifier);
      result.push(item);
    }
  });

  return result;
}

type Res = {
  parents: QueryData[];
  routes: QueryData[];
  responses: QueryData[];
};

export const findAllParents = (
  obj: TreeObject | null,
  key: string,
  schemaPath: string,
  path: string,
  type: GraphQlRouteType,
  level: number,
  server: ProjectServer,
): Res => {
  if (!obj) {
    return { parents: [], routes: [], responses: [] };
  }
  const isWrappers = [0, 1].includes(level);

  const parent = isWrappers
    ? null
    : findMatchedGraphqlParent(schemaPath, path, type, server);

  const route = parent ? findMatchQueryOnParent(key, parent) : null;

  let matchedParent = null;
  if (parent) {
    const routeSchemaPath =
      (parent.schemaPath?.length || 0) > 0
        ? `${parent.schemaPath}.${key}`
        : key;
    matchedParent = findMatchedGraphqlParent(
      routeSchemaPath,
      parent.path,
      parent.graphqlQueriesType,
      server,
    );
  }

  const queryData: QueryData = {
    key,
    parent,
    route,
    schemaPath,
    level,
  };

  const currentRes = {
    parents: parent ? [] : [queryData],
    routes: !!parent && !route && !matchedParent ? [queryData] : [],
    responses: route ? [queryData] : [],
  };

  if (!isSomeChildrenLeafs(obj)) {
    const _schemaPath = schemaPath?.length > 0 ? `${schemaPath}.` : schemaPath;
    const res = Object.keys(obj).map((_key) =>
      findAllParents(
        obj[_key],
        _key,
        isWrappers ? schemaPath : _schemaPath + key,
        path,
        type,
        ++level,
        server,
      ),
    );

    const parents = res.map((resObj) => resObj.parents).flat();
    const routes = res.map((resObj) => resObj.routes).flat();
    const responses = res.map((resObj) => resObj.responses).flat();

    return {
      parents: isWrappers
        ? parents
        : eliminateDuplicates([...parents, ...currentRes.parents]),
      routes: isWrappers ? routes : [...routes, ...currentRes.routes],
      responses: isWrappers
        ? responses
        : [...responses, ...currentRes.responses],
    };
  }

  return currentRes;
};

function getTypeString(type: any): string {
  if (type.kind === 'NamedType') {
    return type.name.value;
  }
  if (type.kind === 'NonNullType') {
    return `${getTypeString(type.type)}!`;
  }
  if (type.kind === 'ListType') {
    return `[${getTypeString(type.type)}]`;
  }
  return '';
}

interface VariableInfo {
  name: string;
  type: string;
}

export function extractVariables(parsedQuery: any): VariableInfo[] {
  const variableDefinitions = parsedQuery.definitions[0]?.variableDefinitions;
  const variables: VariableInfo[] = [];

  if (variableDefinitions) {
    for (const variableDefinition of variableDefinitions) {
      const name = variableDefinition.variable.name.value;
      const type = getTypeString(variableDefinition.type);
      variables.push({ name, type });
    }
  }

  return variables;
}

export const constructObject = (
  parsedQuery: any,
  variables: VariableInfo[],
): { [key: string]: any } | null => {
  if (parsedQuery.kind === 'Document') {
    // Extracting the first definition (assuming only one query/mutation is present)
    const objects = parsedQuery.definitions.map((definition: any) =>
      constructObject(definition, variables),
    );

    return mergeObjects(objects);
  }
  if (parsedQuery.kind === 'OperationDefinition') {
    // Traversing the selection set
    return {
      [parsedQuery.name?.value]: constructObject(
        parsedQuery.selectionSet,
        variables,
      ),
    };
  }
  if (parsedQuery.kind === 'SelectionSet') {
    const objects = parsedQuery.selections.map((selection: any) =>
      constructObject(selection, variables),
    );
    return mergeObjects(objects);
  }
  if (parsedQuery.kind === 'Field') {
    let params = '';
    if (parsedQuery.arguments?.length > 0) {
      const args = parsedQuery.arguments.map((item: any) => {
        const variable = variables.find((arg: VariableInfo) => {
          return item.name.value === arg.name;
        });

        if (variable) {
          return `${variable.name}: ${variable.type}`;
        }

        return `${item.name.value}: Any`; // + item.value.value
      });
      params = `(${args.join(', ')})`;
    }

    // Handling field with arguments
    const fieldName = parsedQuery.alias
      ? parsedQuery.alias.value
      : parsedQuery.name.value;
    return {
      [fieldName + params]: parsedQuery.selectionSet
        ? constructObject(parsedQuery.selectionSet, variables)
        : null,
    };
  }
  return null;
};

export function getNonNativeGraphQLTypes(paramTypes: string[]): string[] {
  const nativeTypes = [
    'Int',
    'Float',
    'String',
    'Boolean',
    'ID',
    'Date',
    'DateTime',
    'Time',
    'JSON',
    'JSONObject',
    'BigInt',
    'Decimal',
    'Any',
  ];

  return paramTypes.filter((type) => !nativeTypes.includes(type));
}

export function getGraphQLParamTypes(signature: string): string[] {
  const paramRegex = /\((.*?)\)/;
  const match = signature.match(paramRegex);

  if (!match) {
    return [];
  }

  const paramsString = match[1];
  const params = paramsString.split(',').map((param) => param.trim());

  return params.map((param) => {
    const [, type] = param.split(':').map((part) => part.trim());
    return type.replace('!', '');
  });
}

export function getNonNativeTypesFromSignature(signature: string): string[] {
  const allTypes = getGraphQLParamTypes(signature);
  return getNonNativeGraphQLTypes(allTypes);
}

export function validateGraphQLType(
  typeName: string,
  schemaString: string,
): boolean {
  // Regular expression to match type definitions
  const typeRegex = new RegExp(
    `type\\s+${removeSquareBrackets(typeName)}\\s*{([^}]+)}`,
    'i',
  );
  const match = schemaString.match(typeRegex);

  if (!match) {
    return false; // Type not found in schema
  }

  const typeBody = match[1].trim();

  // Check if the type has at least one property
  const propertyRegex = /\w+\s*:/;
  return propertyRegex.test(typeBody);
}

export function buildQueryFromSchema(
  schema: string,
  // eslint-disable-next-line default-param-last
  initRootType: string = '',
  schemaPath: string,
  name: string,
): string {
  // Parse the schema
  const typeRegex = /type\s+(\w+)\s*\{([^}]+)\}/g;
  // eslint-disable-next-line no-useless-escape
  const fieldRegex = /(\w+)\s*:\s*([\w\[\]!]+)/g;

  const rootType = removeSquareBrackets(initRootType);

  const types: { [key: string]: { name: string; type: string }[] } = {};

  const schemaPathArray = schemaPath?.split('.') || [];
  const schemaPathLength = schemaPathArray.length;

  // First pass: collect all types and their fields
  let match;
  // eslint-disable-next-line no-cond-assign
  while ((match = typeRegex.exec(schema)) !== null) {
    const typeName = match[1];
    const typeFields = match[2];

    const fields: { name: string; type: string }[] = [];
    let fieldMatch;
    // eslint-disable-next-line no-cond-assign
    while ((fieldMatch = fieldRegex.exec(typeFields)) !== null) {
      fields.push({
        name: fieldMatch[1],
        type: removeSquareBrackets(fieldMatch[2]),
      });
    }

    types[typeName] = fields;
  }
  // Function to recursively build query
  function buildQueryForType(
    parent: { type: string; name: string },
    indent: string = '',
  ): string {
    if (!types[parent.type]) return '';

    let query = `${indent}${parent.name} {\n`;
    for (const field of types[parent.type]) {
      if (types[field.type]) {
        // This field is another type, recurse
        query += buildQueryForType(field, `${indent}  `);
      } else {
        query += `${indent}  ${field.name}\n`;
      }
    }

    query += `${indent}}\n`;
    return query;
  }

  const addSchemaPathPre = (query: string, indent: string) => {
    if (schemaPathLength > 0) {
      const newQuery = schemaPathArray.reduce((acc, item, i) => {
        acc = `${acc + indent.repeat(i + 1) + item} {\n`;

        return acc;
      }, query);
      return newQuery;
    }
    return query;
  };

  const addSchemaPathPost = (query: string, indent: string) => {
    if (schemaPathLength > 0) {
      const newQuery = schemaPathArray.reduce((acc, _, i) => {
        acc = `${acc + indent.repeat(schemaPathLength - i)}}\n`;

        return acc;
      }, query);
      return newQuery;
    }
    return query;
  };

  // Build the query
  let query: string;
  const indent = '  '.repeat(schemaPathLength + 1);
  if (rootType && types[rootType]) {
    query = `query {\n`;

    query = addSchemaPathPre(query, '  ');

    query += `${buildQueryForType({ type: rootType, name }, indent)}`;

    query = addSchemaPathPost(query, '  ');

    query += '}';
  } else {
    query = 'query {\n';

    query = addSchemaPathPre(query, '  ');

    for (const type in types) {
      if (type !== 'Query' && type !== 'Mutation') {
        query += buildQueryForType({ type: rootType, name }, indent);
      }
    }
    query = addSchemaPathPost(query, '  ');
    query += '}';
  }

  return query;
}
