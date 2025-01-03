export const isElectronEnabled = !!window.electron?.ipcRenderer;

export const BASE_URL = isElectronEnabled
  ? 'http://localhost:1511'
  : window.location.href;
