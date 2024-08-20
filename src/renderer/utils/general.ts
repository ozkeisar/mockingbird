import { cloneDeep } from 'lodash';
import {
  GraphQlRouteType,
  Method,
  ParamType,
  Preset,
  PresetRoute,
  ServersHash,
} from '../../types';

export const JSONStringifyExtra = (obj: any) =>
  JSON.stringify(obj, (key, value) => {
    if (typeof value === 'function') {
      return value.toString();
    }
    return value;
  });

export const openInNewTab = (url: string) => {
  const newWindow = window.open(
    `http://${url}`,
    '_blank',
    'noopener,noreferrer',
  );
  if (newWindow) newWindow.opener = null;
};

export const getRouteBGColor = (method: Method) => {
  switch (method) {
    case 'delete':
      return '#f93e3e';

    case 'get':
      return '#61affe';

    case 'patch':
      return '#50e3c2';

    case 'post':
      return '#49cc90';

    case 'put':
      return '#fca130';

    default:
      return '#61affe';
  }
};

export const getGraphqlRouteBGColor = (method: GraphQlRouteType) => {
  switch (method) {
    case 'Query':
      return '#61affe';

    case 'Mutation':
      return '#49cc90';

    default:
      return '#61affe';
  }
};

export const formatDate = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

  return `${hours}:${minutes}:${seconds}:${milliseconds}`;
};

export const removeLastPartOfUri = (uri: string) => {
  // Find the last occurrence of '/'
  const lastSlashIndex = uri.lastIndexOf('/');

  // If '/' is not found, return the original URI
  if (lastSlashIndex === -1) {
    return uri;
  }

  // Extract the part before the last '/'
  const modifiedUri = uri.substring(0, lastSlashIndex);

  return modifiedUri;
};

export const getLastPartOfUri = (uri: string) => {
  // Find the position of '?'
  const queryIndex = uri.indexOf('?');

  // If '?' is found, extract the URI before it
  const cleanUri = queryIndex !== -1 ? uri.substring(0, queryIndex) : uri;

  // Find the last occurrence of '/'
  const lastSlashIndex = cleanUri.lastIndexOf('/');

  // If '/' is not found, return the original URI
  if (lastSlashIndex === -1 || lastSlashIndex === cleanUri.length - 1) {
    return cleanUri;
  }

  // Extract the part after the last '/'
  const lastPart = cleanUri.substring(lastSlashIndex + 1);

  return lastPart;
};

export const removeQueryParams = (uri: string) => {
  const queryStringIndex = uri.indexOf('?');
  if (queryStringIndex !== -1) {
    return uri.substring(0, queryStringIndex);
  }
  return uri;
};

type params = { [key: string]: any };
export const getKeyValuePairReq = (
  body: params,
  query: params,
  params: params,
): { key: string; value: string; type: ParamType } => {
  // Extract key-value pair from body params
  for (const key in body) {
    if (typeof body[key] === 'string') {
      return { key, value: body[key], type: 'body' };
    }
  }

  // If no string value found in body  params, extract from params
  for (const key in params) {
    if (typeof params[key] === 'string') {
      return { key, value: params[key], type: 'params' };
    }
  }

  // If no string value found  params, extract from query
  for (const key in query) {
    if (typeof query[key] === 'string') {
      return { key, value: query[key], type: 'query' };
    }
  }

  return { key: '', value: '', type: 'body' };
};

const validFilenameRegex = /^[\w\-.]+$/;
export const isValidFilename = (filename: string) => {
  return validFilenameRegex.test(filename);
};

export const checkIsPresetRouteExist = (
  serversHash: ServersHash,
  presetRoute: PresetRoute,
) => {
  const { serverId, parentId, routeId, responseId } = presetRoute;

  const graphQlRoute =
    !!serversHash[serverId]?.parentRoutesHash[parentId]?.graphQlRouteHash?.[
      routeId
    ]?.responsesHash?.[responseId];
  const restRoute =
    !!serversHash[serverId]?.parentRoutesHash[parentId]?.routesHash?.[routeId]
      ?.responsesHash?.[responseId];

  return graphQlRoute || restRoute;
};

export const checkIsAllRoutesExists = (
  serversHash: ServersHash,
  preset: Preset | null,
) => {
  if (!preset) {
    return false;
  }
  return Object.values(preset.routesHash || {}).every((presetRoute) =>
    checkIsPresetRouteExist(serversHash, presetRoute),
  );
};

export const formatFileName = (input: string): string => {
  // Remove special characters not allowed in file names
  // eslint-disable-next-line no-useless-escape
  const sanitizedFileName = input.replace(/[\/\\?%*:|"<>]/g, '');

  // Replace spaces with underscores
  const fileNameWithoutSpaces = sanitizedFileName.replace(/\s+/g, '_');

  // Truncate file name if it exceeds the maximum allowed length
  const maxLength = 255; // Windows limit for file name length
  const truncatedFileName = fileNameWithoutSpaces.slice(0, maxLength);

  return truncatedFileName;
};

export function combineNestedObjects(data: any) {
  if (Array.isArray(data) && data.length > 0) {
    // Handle array of objects
    const result = data.reduce((acc, obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          if (Array.isArray(obj[key])) {
            acc[key] = acc[key] || [];
            acc[key].push(...obj[key]);
          } else {
            acc[key] = combineNestedObjects({ ...acc[key], ...obj[key] });
          }
        } else {
          acc[key] = obj[key];
        }
      }
      return acc;
    }, {});
    return [result];
  }
  if (typeof data === 'object' && data !== null) {
    // Handle nested object
    const result = {} as any;
    for (const key in data) {
      if (Array.isArray(data[key]) && data[key].length > 0) {
        result[key] = combineNestedObjects(data[key]);
      } else if (Array.isArray(data[key]) && data[key].length === 0) {
        result[key] = data[key];
      } else if (typeof data[key] === 'object' && data[key] !== null) {
        result[key] = combineNestedObjects(data[key]);
      } else {
        result[key] = data[key];
      }
    }
    return result;
  }
  return data;
}

interface MyObject {
  [key: string]: any;
}

export function prepareObjectToSchema(object: MyObject): MyObject {
  const verifyObject = (obj: MyObject, i: number): MyObject => {
    if (Array.isArray(obj) && obj.length === 0) {
      obj.push('');
      return obj;
    }

    if (Array.isArray(obj) && obj.length > 0) {
      obj.forEach((item: any) => {
        if (typeof item === 'object' || Array.isArray(item)) {
          verifyObject(item, ++i);
        }
      });
      return obj;
    }

    for (const key in obj) {
      if (obj[key] !== null && obj[key] !== undefined) {
        if (Array.isArray(obj[key]) && obj[key].length === 0) {
          obj[key].push('');
        }
        if (Array.isArray(obj[key]) && obj[key].length > 0) {
          verifyObject(obj[key], ++i);
        } else if (
          typeof obj[key] === 'object' &&
          Object.keys(obj[key]).length === 0
        ) {
          obj[key] = '';
        } else if (
          typeof obj[key] === 'object' &&
          Object.keys(obj[key]).length > 0
        ) {
          verifyObject(obj[key], ++i);
        } else if (typeof obj[key] === 'string') {
          obj[key] = '';
        } else if (typeof obj[key] === 'number') {
          obj[key] = 0.1;
        }
      } else {
        obj[key] = '';
      }
    }
    return obj;
  };

  const modifiedObj = cloneDeep(object);
  return verifyObject(modifiedObj, 0);
}

export function isGraphQLRequest(reqBody: any): boolean {
  if (typeof reqBody !== 'object' || reqBody === null) {
    return false; // Not an object
  }

  // Check if the object has a 'query' field
  if ('query' in reqBody && typeof reqBody.query === 'string') {
    return true;
  }

  return false;
}

interface TreeNode {
  [key: string]: TreeNode | {};
}

export const isSomeChildrenLeafs = (obj: TreeNode) => {
  return Object.values(obj || {}).some(
    (child) => Object.keys(child).length === 0,
  );
};

export type ParsedQuery = { key: string; schemaPath: string; level: number };

export function getAllLeafParents(
  schemaPath: string,
  level: number,
  obj: any,
): ParsedQuery[] {
  if (typeof obj !== 'object' || Object.keys(obj).length === 0) {
    return [];
  }

  const keys = Object.keys(obj);
  let parentKeys: { key: string; schemaPath: string; level: number }[] = [];

  keys.forEach((key) => {
    const child = obj[key];
    if (typeof child === 'object' && Object.keys(child).length > 0) {
      if (isSomeChildrenLeafs(child)) {
        if (level > 0) {
          parentKeys.push({ key, schemaPath, level });
        }
      } else {
        const updatedPath =
          schemaPath.length > 0 ? `${schemaPath}.${key}` : key;
        parentKeys = parentKeys.concat(
          getAllLeafParents(
            level > 0 ? updatedPath : schemaPath,
            ++level,
            child,
          ),
        );
      }
    }
  });
  return parentKeys;
}

export function removeSquareBrackets(str: string) {
  if (str.startsWith('[') && str.endsWith(']')) {
    return str.slice(1, -1);
  }
  return str;
}

type ObjectType = {
  [key: string]: any;
};

export const flattenObject = (
  originalObject: ObjectType,
  prefix = '',
): Record<string, string | number | boolean> =>
  Object.keys(originalObject).reduce((result: ObjectType, prop: string) => {
    const pre = prefix.length ? `${prefix}.` : '';
    if (
      typeof originalObject[prop] === 'object' &&
      originalObject[prop] !== null
    ) {
      Object.assign(result, flattenObject(originalObject[prop], pre + prop));
    } else {
      result[pre + prop] = originalObject[prop];
    }
    return result;
  }, {});
