import { AppSettings, ProjectSettings, ServerSettings } from '../types';

// eslint-disable-next-line global-require
export const mainFolderPath = `${require('os').homedir()}/.stub-on-prem/`;

export const projectsPath = `${mainFolderPath}repos/`;
export const appSettingsFolder = `${mainFolderPath}settings/`;

export const SUPPORTED_PROJECT_DATA_VERSION = '0.0.9';

export const SECRET_KEY = 'verysecretkey';

export const DEFAULT_APP_SETTINGS: AppSettings = Object.freeze({
  userApproveAnalytics: false,
  serverDisabledUntil: null,
  serverEndTime: null,
  activeTime: 15,
  disableTime: 7,
  activationKey: null,
  activeProject: null,
  userId: null,
  projects: null,
});

export const DEFAULT_PROJECT_SETTINGS: ProjectSettings = Object.freeze({
  forceProxy: false,
  dataVersion: SUPPORTED_PROJECT_DATA_VERSION,
});

export const DEFAULT_SERVER_SETTINGS: ServerSettings = Object.freeze({
  proxyBaseUrl: null,
  forceProxy: false,
  delay: 0,
  port: 3001,
  reWriteCookieDomain: false,
  simplifyCookies: false,
  duplicateCookies: false,
});
