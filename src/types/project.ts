import { ProjectSettings, ServersHash } from './routes';

export interface PresetRoute {
  id: string;
  routeId: string;
  parentId: string;
  serverId: string;
  responseId: string;
}

export interface PresetRouteHash {
  [key: string]: PresetRoute;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  routesHash: PresetRouteHash | null;
}

export interface PresetsHash {
  [key: string]: Preset;
}

export interface PresetsFolder {
  id: string;
  name: string;
  filename: string;
  presetsHash: PresetsHash | null;
}
export interface PresetsFolderHash {
  [key: string]: PresetsFolder;
}

export interface ProjectData {
  success: boolean;
  serversHash: ServersHash;
  projectSettings: ProjectSettings;
  projectName: string;
  projectDataIsUnsupported: boolean;
  currentBranch: string | null;
  branches: string[];
  hasDiffs: boolean;
  presetFoldersHash: PresetsFolderHash | null;
  isGitInit: boolean;
  projectDataInvalid: boolean;
}

export interface ProjectDataNew {
  serversHash: ServersHash | null;
  settings: ProjectSettings | null;
  presetFoldersHash: PresetsFolderHash | null;
  name: string;
  isDataUnsupported: boolean;
  isDataInvalid: boolean;
  currentBranch: string | null;
  hasDiffs: boolean;
  branches: string[];
  isGitInit: boolean;
}
