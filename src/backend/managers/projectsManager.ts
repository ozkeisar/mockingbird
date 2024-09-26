import path from 'path';
import { SUPPORTED_PROJECT_DATA_VERSION } from '../../consts';
import {
  getProjectPath,
  getProjectPresets,
  readProjectSettings,
} from '../utils/files';
import { migrateProjectData } from '../utils/migrations';
import { listToHashmap } from '../utils/utils';
import { ProjectDataNew, ServersHash } from '../../types';
import {
  isGitRepository,
  getBranches,
  getCurrentBranch,
  hasUncommittedChanges,
} from '../utils/git';
import { getProjectServers, isFirstVersionGreater } from '../utils/general';
// import { socketIo } from "../app";

class ProjectsManager {
  private projectChange: {
    [key: string]: boolean
  } = {};

  private projects: {
    [key: string]: ProjectDataNew;
  } = {};

  // constructor() {}

  public async getProjectServersHash(projectName: string): Promise<ServersHash> {
    await this.loadProject(projectName);

    return this.projects[projectName].serversHash;
  }

  public async getProjectPresetFoldersHash(projectName: string) {
    await this.loadProject(projectName);
    return this.projects[projectName].presetFoldersHash;
  }

  public async getProjectSettings(projectName: string) {
    await this.loadProject(projectName);
    return this.projects[projectName].settings;
  }

  public async getProjectData(projectName: string) {
    await this.loadProject(projectName);
    return this.projects[projectName];
  }

  public setProjectChanged(projectName: string){
    this.projectChange[projectName] = true;
  }

 
  private async loadProject(projectName: string) {
    if (this.projects[projectName] && !this.projectChange[projectName]) {
      console.log('project already loaded');
    } else {
      await this.readProjectData(projectName);
    } 
  }

  private async readProjectData(projectName: string): Promise<void> {
    const isGitInit = await isGitRepository(projectName);
    const currentBranch = await getCurrentBranch(projectName);
    const branches = (await getBranches(projectName)) as string[];
    const hasDiffs = await hasUncommittedChanges(projectName);
    try {
      const projectSettings = await readProjectSettings(projectName);

      const dataVersion = projectSettings?.dataVersion || '0.0.5';

      const isProjectDataVersionSmaller = isFirstVersionGreater(
        SUPPORTED_PROJECT_DATA_VERSION,
        dataVersion,
      );
      if (isProjectDataVersionSmaller) {
        await migrateProjectData(projectName, dataVersion);
      }

      const servers = await getProjectServers(projectName);
      const serversHash = listToHashmap(servers, (server) => server.name);
      const presetFolders = await getProjectPresets(projectName);
      const presetFoldersHash = listToHashmap(presetFolders, (item) => item.id);

      const isDataUnsupported = isFirstVersionGreater(
        projectSettings?.dataVersion || SUPPORTED_PROJECT_DATA_VERSION,
        SUPPORTED_PROJECT_DATA_VERSION,
      );

      this.projects[projectName] = {
        presetFoldersHash,
        serversHash,
        settings: projectSettings,
        name: projectName,
        isDataUnsupported,
        isDataInvalid: false,
        isGitInit,
        currentBranch,
        branches,
        hasDiffs,
      };
    } catch (error) {
      this.projects[projectName] = {
        presetFoldersHash: null,
        serversHash: {},
        settings: null,
        name: projectName,
        isDataUnsupported: false,
        isDataInvalid: true,
        isGitInit,
        currentBranch,
        branches,
        hasDiffs,
      };
      console.log(`Error loadProject ${projectName}: `, error);
    }
  }
}

// Create the singleton instance
const projectsManager = new ProjectsManager();

export { projectsManager };
