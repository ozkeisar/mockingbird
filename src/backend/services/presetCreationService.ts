import {
  getProjectServers,
  updateServerData,
  updateProjectSupportedDataVersion,
} from '../utils';
import { listToHashmap } from '../utils/utils';
import { hasUncommittedChanges } from '../utils/git';
import { logger } from '../utils/logger';
import {
  CreatePresetRequest,
  ProcessedLogData,
  resolvePresetFolder,
  createPreset,
  processLogEntry,
  savePresetFolder,
  addPresetToFolder,
} from '../utils/presetHelpers';

export interface CreatePresetResult {
  success: boolean;
  presetFolder?: any;
  projectName?: string;
  hasDiffs?: boolean;
  message?: string;
}

export const initializeProjectData = async (projectName: string) => {
  logger(`Initializing project data for: ${projectName}`);
  await updateProjectSupportedDataVersion(projectName);

  const servers = await getProjectServers(projectName);
  const serversHash = listToHashmap(servers, (server) => server.name);

  return { servers, serversHash };
};

export const processAllLogs = (
  processedLogs: ProcessedLogData[],
  serversHash: Record<string, any>,
  preset: any,
) => {
  logger(`Processing ${processedLogs.length} logs`);
  const updatedServers: Record<string, any> = {};

  processedLogs.forEach((logData) => {
    processLogEntry(logData, serversHash, updatedServers, preset);
  });

  logger(`Updated ${Object.keys(updatedServers).length} servers`);
  return updatedServers;
};

export const updateAllServers = async (
  updatedServers: Record<string, any>,
  projectName: string,
) => {
  logger(`Updating servers in project: ${projectName}`);
  await Promise.all(
    Object.values(updatedServers).map((server) =>
      updateServerData(projectName, server),
    ),
  );
};

export const finalizePresetCreation = async (
  presetFolder: any,
  preset: any,
  projectName: string,
) => {
  // Add preset to folder
  addPresetToFolder(presetFolder, preset);

  // Save to file
  await savePresetFolder(presetFolder, projectName);

  // Check git status
  const hasDiffs = await hasUncommittedChanges(projectName);

  return { presetFolder, hasDiffs };
};

export const createPresetFromLogs = async (
  request: CreatePresetRequest,
): Promise<CreatePresetResult> => {
  const startTime = Date.now();
  const { presetName, processedLogs, projectName } = request;

  try {
    logger(
      `Starting preset creation: "${presetName}" for project: ${projectName}`,
    );

    // Initialize project data
    const { serversHash } = await initializeProjectData(projectName);

    // Resolve preset folder
    const presetFolder = await resolvePresetFolder(request);
    if (!presetFolder) {
      return {
        success: false,
        message: 'Preset folder not found',
      };
    }

    // Create preset
    const preset = createPreset(presetName, processedLogs.length);

    // Process all logs
    const updatedServers = processAllLogs(processedLogs, serversHash, preset);

    // Update servers
    await updateAllServers(updatedServers, projectName);

    // Finalize creation
    const result = await finalizePresetCreation(
      presetFolder,
      preset,
      projectName,
    );

    const duration = Date.now() - startTime;
    logger(`Successfully created preset "${presetName}" in ${duration}ms`);

    return {
      success: true,
      presetFolder: result.presetFolder,
      projectName,
      hasDiffs: result.hasDiffs,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger(`Error creating preset (${duration}ms):`, error);

    return {
      success: false,
      message: error?.message || 'Failed to create preset from logs',
    };
  }
};
