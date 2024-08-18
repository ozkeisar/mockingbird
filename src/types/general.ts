export type setSelectedRouteType = {
  parentId: string | null;
  routeId: string | null;
  serverName: string | null;
};

export type setSelectedPreset = {
  presetId: string | null;
  folderId: string | null;
};

export type SelectedType = 'preset' | 'route';

export type MainSideBarTabs = 'routes' | 'search' | 'presets';
