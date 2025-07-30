import { v4 as uuid } from 'uuid';
import cloneDeep from 'lodash/cloneDeep';
import serialize from 'serialize-javascript';
import fs from 'fs';
import {
  Preset,
  PresetsFolder,
  PresetRoute,
  Route,
  RouteResponse,
  RouteParent,
  ProjectServer,
  Method,
} from '../../types';
import {
  getRequestRoute,
  removeLastPartOfUri,
} from '../../renderer/utils/general';
import { projectsManager } from '../managers/projectsManager';
import { getPresetsPath } from './files';
import { replaceUndefined } from './utils';
import { logger } from './logger';

// Types
export interface ProcessedLogData {
  serverName: string;
  method: string;
  url: string;
  status: number;
  responseData: any;
  responseHeaders: any;
}

export interface CreatePresetRequest {
  presetName: string;
  presetFolderId?: string;
  newPresetFolderName?: string;
  isCreatingNewFolder: boolean;
  processedLogs: ProcessedLogData[];
  projectName: string;
}

// Validation functions
export const validateRequired = (
  value: any,
  fieldName: string,
): string | null => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateArray = (value: any, fieldName: string): string | null => {
  if (!Array.isArray(value) || value.length === 0) {
    return `${fieldName} must be a non-empty array`;
  }
  return null;
};

export const validateCreatePresetRequest = (
  request: CreatePresetRequest,
): string[] => {
  const errors: string[] = [];

  const requiredValidations = [
    validateRequired(request.presetName, 'presetName'),
    validateRequired(request.projectName, 'projectName'),
    validateArray(request.processedLogs, 'processedLogs'),
  ];

  errors.push(...(requiredValidations.filter(Boolean) as string[]));

  if (request.isCreatingNewFolder) {
    const folderNameError = validateRequired(
      request.newPresetFolderName,
      'newPresetFolderName',
    );
    if (folderNameError) errors.push(folderNameError);
  } else {
    const folderIdError = validateRequired(
      request.presetFolderId,
      'presetFolderId',
    );
    if (folderIdError) errors.push(folderIdError);
  }

  return errors;
};

// Preset folder functions
export const createNewPresetFolder = (name: string): PresetsFolder => ({
  id: uuid(),
  name,
  filename: name.toLowerCase().replace(/\s+/g, '_'),
  presetsHash: {},
});

export const getExistingPresetFolder = async (
  presetFolderId: string,
  projectName: string,
): Promise<PresetsFolder | null> => {
  try {
    const presetFoldersHash =
      await projectsManager.getProjectPresetFoldersHash(projectName);
    if (!presetFoldersHash) return null;

    const folder = presetFoldersHash[presetFolderId];
    return folder ? cloneDeep(folder) : null;
  } catch (error) {
    return null;
  }
};

export const resolvePresetFolder = async (
  request: CreatePresetRequest,
): Promise<PresetsFolder | null> => {
  if (request.isCreatingNewFolder) {
    return createNewPresetFolder(request.newPresetFolderName!);
  }
  return getExistingPresetFolder(request.presetFolderId!, request.projectName);
};

// Preset creation functions
export const createPreset = (name: string, logCount: number): Preset => ({
  id: uuid(),
  name,
  description: `Created from ${logCount} console log(s)`,
  routesHash: {},
});

// Route parent functions
export const findExistingParent = (
  server: ProjectServer,
  parentPath: string,
): RouteParent | null => {
  return (
    Object.values(server.parentRoutesHash || {}).find(
      (parent) => parent.path === parentPath,
    ) || null
  );
};

export const createNewParent = (parentPath: string): RouteParent => ({
  id: uuid(),
  type: 'Rest',
  filename: 'parent',
  name: null,
  path: parentPath,
  schemaPath: null,
  routesHash: {},
  graphQlRouteHash: null,
  graphqlQueriesType: null,
});

export const ensureParentExists = (
  server: ProjectServer,
  parentPath: string,
): { parentId: string; parent: RouteParent } => {
  const existingParent = findExistingParent(server, parentPath);

  if (existingParent) {
    return { parentId: existingParent.id, parent: existingParent };
  }

  const newParent = createNewParent(parentPath);

  if (!server.parentRoutesHash) {
    server.parentRoutesHash = {};
  }
  server.parentRoutesHash[newParent.id] = newParent;

  return { parentId: newParent.id, parent: newParent };
};

// Route functions
export const findExistingRoute = (
  parent: RouteParent,
  routePath: string,
  method: Method,
): Route | null => {
  return (
    Object.values(parent.routesHash || {}).find(
      (route) => route.routePath === routePath && route.method === method,
    ) || null
  );
};

export const createNewRoute = (routePath: string, method: Method): Route => ({
  id: uuid(),
  routePath,
  method,
  description: 'Created from preset',
  paramKey: null,
  paramValue: null,
  paramType: 'body',
  activeResponseId: '',
  responsesHash: {},
  withParams: false,
});

export const ensureRouteExists = (
  parent: RouteParent,
  routePath: string,
  method: Method,
): { routeId: string; route: Route } => {
  const existingRoute = findExistingRoute(parent, routePath, method);

  if (existingRoute) {
    return { routeId: existingRoute.id, route: existingRoute };
  }

  const newRoute = createNewRoute(routePath, method);

  if (!parent.routesHash) {
    parent.routesHash = {};
  }
  parent.routesHash[newRoute.id] = newRoute;

  return { routeId: newRoute.id, route: newRoute };
};

// Response functions
export const findExistingResponse = (
  route: Route,
  status: number,
  responseData: any,
): RouteResponse | null => {
  if (!route.responsesHash) return null;

  return (
    Object.values(route.responsesHash).find((response) => {
      if (!response.res) return false;
      return (
        response.res.code === status &&
        JSON.stringify(response.res.data) === JSON.stringify(responseData)
      );
    }) || null
  );
};

export const createResponse = (
  status: number,
  responseData: any,
  responseHeaders: any,
): RouteResponse => ({
  id: uuid(),
  name: `Response from log (${status})`,
  description: 'Created from preset',
  res: {
    code: status,
    data: responseData,
    headers: responseHeaders,
  },
  type: 'obj',
  url: null,
  exec: null,
  blockProxy: null,
});

export const findOrCreateResponse = (
  route: Route,
  status: number,
  responseData: any,
  responseHeaders: any,
): { response: RouteResponse; wasReused: boolean } => {
  // Check if response with same status and data already exists (ignoring headers)
  const existingResponse = findExistingResponse(route, status, responseData);

  if (existingResponse) {
    return { response: existingResponse, wasReused: true };
  }

  // Create new response if none exists
  const newResponse = createResponse(status, responseData, responseHeaders);
  return { response: newResponse, wasReused: false };
};

export const addResponseToRoute = (
  route: Route,
  response: RouteResponse,
  makeActive: boolean = false,
): void => {
  if (!route.responsesHash) {
    route.responsesHash = {};
  }

  // Only add if response doesn't already exist
  if (!route.responsesHash[response.id]) {
    route.responsesHash[response.id] = response;
  }

  if (makeActive || !route.activeResponseId) {
    route.activeResponseId = response.id;
  }
};

export const isSuccessStatus = (status: number): boolean =>
  status >= 200 && status < 300;

// Preset route functions
export const createPresetRoute = (
  routeId: string,
  parentId: string,
  serverId: string,
  responseId: string,
): PresetRoute => ({
  id: uuid(),
  routeId,
  parentId,
  serverId,
  responseId,
});

export const addRouteToPreset = (
  preset: Preset,
  presetRoute: PresetRoute,
): void => {
  if (!preset.routesHash) {
    preset.routesHash = {};
  }
  preset.routesHash[presetRoute.id] = presetRoute;
};

// Log processing functions
export const processLogEntry = (
  logData: ProcessedLogData,
  serversHash: Record<string, ProjectServer>,
  updatedServers: Record<string, ProjectServer>,
  preset: Preset,
): void => {
  const { serverName, method, url, status, responseData, responseHeaders } =
    logData;

  // Get or clone server
  let server = updatedServers[serverName];
  if (!server) {
    server = cloneDeep(serversHash[serverName]);
    if (!server) return;
    updatedServers[serverName] = server;
  }

  const requestMethod = method.toLowerCase() as Method;
  const parentPath = removeLastPartOfUri(url);

  // Ensure parent exists
  const { parentId, parent } = ensureParentExists(server, parentPath);

  // Ensure route exists
  const routePath = getRequestRoute(url, parent.path);
  const { routeId, route } = ensureRouteExists(
    parent,
    routePath,
    requestMethod,
  );

  // Find existing response or create new one (deduplication based on status and data)
  const { response, wasReused } = findOrCreateResponse(
    route,
    status,
    responseData,
    responseHeaders,
  );

  if (wasReused) {
    logger(`Reusing existing response for ${method} ${url} (${status})`);
  }

  const shouldMakeActive = isSuccessStatus(status);
  addResponseToRoute(route, response, shouldMakeActive);

  // Add to preset
  const presetRoute = createPresetRoute(
    routeId,
    parentId,
    serverName,
    response.id,
  );
  addRouteToPreset(preset, presetRoute);
};

// File operations
export const savePresetFolder = async (
  presetFolder: PresetsFolder,
  projectName: string,
): Promise<void> => {
  const presetsPath = await getPresetsPath(projectName);
  const fileData = serialize(replaceUndefined(presetFolder), {
    space: 2,
    unsafe: true,
  });

  fs.writeFileSync(
    `${presetsPath + presetFolder.filename}.json`,
    fileData,
    'utf8',
  );
};

export const addPresetToFolder = (
  presetFolder: PresetsFolder,
  preset: Preset,
): void => {
  if (!presetFolder.presetsHash) {
    presetFolder.presetsHash = {};
  }
  presetFolder.presetsHash[preset.id] = preset;
};
