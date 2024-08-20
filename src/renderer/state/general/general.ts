import { create } from 'zustand';
import { produce } from 'immer';
import { AppSettings } from '../../../types';
import {
  SelectedType,
  setSelectedPreset,
  setSelectedRouteType,
} from '../../../types/general';

export type StateFuncs = {
  resetGeneralState: () => void;
  setSelectedRoute: ({
    serverName,
    parentId,
    routeId,
  }: setSelectedRouteType) => void;
  clearSelectedRoute: () => void;
  setSelectedPreset: ({ folderId, presetId }: setSelectedPreset) => void;
  setServerHost: (serverHost: string) => void;
  setIsServerUp: (isServerUp: boolean) => void;
  setIsServerLoading: (isLoading: boolean) => void;
  setOpenSettingsDialog: (open: boolean) => void;
  setProjectsNameList: (projectsNameList: string[]) => void;
  setAppSettings: (appSettings: AppSettings) => void;
};

export type StateProps = {
  selectedFolderId: string | null;
  selectedPresetId: string | null;
  selectedType: SelectedType | null;
  selectedRouteId: string | null;
  selectedParentId: string | null;
  selectedServerName: string | null;
  isServerUp: boolean;
  isServerLoading: boolean;
  host: string | null;
  isSettingsDialogOpen: boolean;
  projectsNameList: string[];
  appSettings: AppSettings | null;
};

export type State = StateFuncs & StateProps;

const INIT_STATE: StateProps = {
  selectedFolderId: null,
  selectedPresetId: null,
  selectedType: null,
  selectedRouteId: null,
  selectedParentId: null,
  selectedServerName: null,
  isServerUp: false,
  host: null,
  isServerLoading: false,
  isSettingsDialogOpen: false,
  projectsNameList: [],
  appSettings: null,
};

export const useGeneralStore = create<State>((set) => ({
  ...INIT_STATE,
  setSelectedPreset: ({ folderId, presetId }: setSelectedPreset) => {
    set(
      produce<State>((state: State) => {
        state.selectedFolderId = folderId;
        state.selectedPresetId = presetId;
        state.selectedType = 'preset';
      }),
    );
  },
  resetGeneralState: () => set({ ...INIT_STATE }),
  clearSelectedRoute: () => {
    set(
      produce<State>((state: State) => {
        state.selectedRouteId = null;
        state.selectedParentId = null;
        state.selectedServerName = null;
        state.selectedType = null;
      }),
    );
  },
  setSelectedRoute: ({
    serverName,
    parentId,
    routeId,
  }: setSelectedRouteType) => {
    set(
      produce<State>((state: State) => {
        state.selectedRouteId = routeId;
        state.selectedParentId = parentId;
        state.selectedServerName = serverName;
        state.selectedType = 'route';
      }),
    );
  },
  setAppSettings: (appSettings: AppSettings) => {
    set(
      produce<State>((state: State) => {
        state.appSettings = appSettings;
      }),
    );
  },
  setProjectsNameList: (projectsNameList: string[]) => {
    set(
      produce<State>((state: State) => {
        state.projectsNameList = projectsNameList;
      }),
    );
  },
  setServerHost: (host: string) => {
    set(
      produce<State>((state: State) => {
        state.host = host;
      }),
    );
  },
  setIsServerUp: (isServerUp: boolean) => {
    set(
      produce<State>((state: State) => {
        state.isServerUp = isServerUp;
      }),
    );
  },
  setOpenSettingsDialog: (open: boolean) => {
    set(
      produce<State>((state: State) => {
        state.isSettingsDialogOpen = open;
      }),
    );
  },
  setIsServerLoading: (isLoading: boolean) => {
    set(
      produce<State>((state: State) => {
        state.isServerLoading = isLoading;
      }),
    );
  },
}));
