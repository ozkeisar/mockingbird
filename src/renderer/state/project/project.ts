import { create } from 'zustand';
import { produce } from 'immer';
import {
  PresetsFolder,
  PresetsFolderHash,
  ProjectServer,
  ProjectSettings,
  RouteParent,
  ServerSettings,
  ServersHash,
} from '../../../types';

export type StateFuncs = {
  resetProjectState: () => void;
  setCurrentBranch: (currentBrunch: string) => void;
  updateServerSettings: (serverName: string, settings: ServerSettings) => void;
  setServers: (servers: ServersHash) => void;
  updateRoute: (
    serverName: string,
    routes: RouteParent,
    filename: string,
  ) => void;
  setActiveProjectName: (projectName: string) => void;
  setProjectSettings: (projectSettings: ProjectSettings) => void;
  addServer: (server: ProjectServer) => void;
  setBranches: (branches: string[]) => void;
  setLoadingData: (isLoadingData: boolean) => void;
  removeServer: (serverName: string) => void;
  setHasDiffs: (hasDiffs: boolean) => void;
  removeParent: (serverName: string, parentId: string) => void;
  setPresetFolders: (presetFoldersHash: PresetsFolderHash) => void;
  addUpdatePresetFolder: (presetFolder: PresetsFolder) => void;
  removePresetFolder: (presetFolderId: string) => void;
  setIsGitInit: (isGitInit: boolean) => void;
};

export type StateProps = {
  activeProjectName: string | null;
  serversHash: ServersHash;
  projectSettings: ProjectSettings | null;
  currentBranch: string | null;
  branches: string[];
  isLoadingData: boolean;
  hasDiffs: boolean;
  presetFoldersHash: PresetsFolderHash;
  isGitInit: boolean;
};

export type State = StateFuncs & StateProps;

const INIT_STATE: StateProps = {
  activeProjectName: null,
  serversHash: {},
  projectSettings: null,
  currentBranch: null,
  branches: [],
  isLoadingData: false,
  hasDiffs: false,
  presetFoldersHash: {},
  isGitInit: false,
};

export const useProjectStore = create<State>((set) => ({
  ...INIT_STATE,
  resetProjectState: () => set({ ...INIT_STATE }),
  setIsGitInit: (isGitInit: boolean) => {
    set(
      produce<State>((state: State) => {
        state.isGitInit = isGitInit;
      }),
    );
  },
  removePresetFolder: (presetFolderId: string) => {
    set(
      produce<State>((state: State) => {
        delete state.presetFoldersHash[presetFolderId];
      }),
    );
  },
  addUpdatePresetFolder: (presetFolder: PresetsFolder) => {
    set(
      produce<State>((state: State) => {
        state.presetFoldersHash[presetFolder.id] = presetFolder;
      }),
    );
  },
  setPresetFolders: (presetFoldersHash: PresetsFolderHash) => {
    set(
      produce<State>((state: State) => {
        state.presetFoldersHash = presetFoldersHash || {};
      }),
    );
  },
  setHasDiffs: (hasDiffs: boolean) => {
    set(
      produce<State>((state: State) => {
        state.hasDiffs = hasDiffs;
      }),
    );
  },
  setLoadingData: (isLoadingData: boolean) => {
    set(
      produce<State>((state: State) => {
        state.isLoadingData = isLoadingData;
      }),
    );
  },
  setBranches: (branches: string[]) => {
    set(
      produce<State>((state: State) => {
        state.branches = branches;
      }),
    );
  },
  setCurrentBranch: (currentBranch: string) => {
    set(
      produce<State>((state: State) => {
        state.currentBranch = currentBranch;
      }),
    );
  },
  addServer: (server: ProjectServer) => {
    set(
      produce<State>((state: State) => {
        state.serversHash[server.name] = server;
      }),
    );
  },
  removeParent: (serverName: string, parentId: string) => {
    set(
      produce<State>((state: State) => {
        delete state.serversHash[serverName].parentRoutesHash[parentId];
      }),
    );
  },
  removeServer: (serverName: string) => {
    set(
      produce<State>((state: State) => {
        delete state.serversHash[serverName];
      }),
    );
  },
  updateServerSettings: (serverName: string, settings: ServerSettings) => {
    set(
      produce<State>((state: State) => {
        state.serversHash[serverName].settings = settings;
      }),
    );
  },
  setProjectSettings: (projectSettings: ProjectSettings) => {
    set(
      produce<State>((state: State) => {
        state.projectSettings = projectSettings;
      }),
    );
  },
  setActiveProjectName: (projectName: string) => {
    set(
      produce<State>((state: State) => {
        state.activeProjectName = projectName;
      }),
    );
  },
  setServers: (servers: ServersHash) => {
    set(
      produce<State>((state: State) => {
        state.serversHash = servers;
      }),
    );
  },
  updateRoute: (serverName: string, routeParent: RouteParent) => {
    set(
      produce<State>((state: State) => {
        state.serversHash[serverName].parentRoutesHash[routeParent.id] =
          routeParent;
      }),
    );
  },
}));
