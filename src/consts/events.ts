import { EVENT_KEYS } from '../types/events';

type EventStatusMassages = {
  success: string | null;
  fail: string | null;
};

type EventsSnackbarType = {
  [key in EVENT_KEYS]: EventStatusMassages;
};

export const EVENTS_SNACKBAR: EventsSnackbarType = {
  [EVENT_KEYS.UPDATE_PROJECT_SETTINGS]: {
    success: 'Project settings updated successfully',
    fail: 'Failed to update project settings',
  },
  [EVENT_KEYS.ACTIVATE]: {
    success: 'program activated successfully',
    fail: 'Failed to activate program',
  },
  [EVENT_KEYS.IP_CHANGED]: {
    success: null,
    fail: null,
  },
  [EVENT_KEYS.DELETE_PROJECT]: {
    success: 'project deleted successfully',
    fail: 'fail to delete project',
  },
  [EVENT_KEYS.DEVTOOLS]: {
    success: null,
    fail: 'Failed to activate DevTools',
  },
  [EVENT_KEYS.SERVER_LOGGER]: {
    success: null,
    fail: null,
  },
  [EVENT_KEYS.PULL]: {
    success: 'Pull request successful',
    fail: 'Failed to pull changes',
  },
  [EVENT_KEYS.START_SERVER]: {
    success: null,
    fail: 'Failed to start server',
  },
  [EVENT_KEYS.CLOSE_SERVER]: {
    success: null,
    fail: 'Failed to close server',
  },
  [EVENT_KEYS.INIT]: {
    success: null,
    fail: 'Initialization failed',
  },
  [EVENT_KEYS.UPDATE_ROUTES_FILE]: {
    success: null,
    fail: 'Failed to update file',
  },
  [EVENT_KEYS.RESTART_SERVER]: {
    success: 'Server restarted successfully',
    fail: 'Failed to restart server',
  },
  [EVENT_KEYS.CREATE_SERVER]: {
    success: 'Server created successfully',
    fail: 'Failed to create server',
  },
  [EVENT_KEYS.CHANGE_PROJECT]: {
    success: 'Project changed successfully',
    fail: 'Failed to change project',
  },
  [EVENT_KEYS.PROJECT_DATA_IS_UNSUPPORTED]: {
    success: null,
    fail: null,
  },
  [EVENT_KEYS.DELETE_SERVER]: {
    success: 'Server deleted successfully',
    fail: 'Failed to delete server',
  },
  [EVENT_KEYS.DELETE_PARENT]: {
    success: 'Parent deleted successfully',
    fail: 'Failed to delete parent',
  },
  [EVENT_KEYS.BRANCH_LIST]: {
    success: null,
    fail: 'Failed to retrieve branch list',
  },
  [EVENT_KEYS.PROJECT_DATA]: {
    success: null,
    fail: 'Failed to retrieve project data',
  },
  [EVENT_KEYS.CHECKOUT_TO_BRANCH]: {
    success: 'Checked out to branch successfully',
    fail: 'Failed to checkout to branch',
  },
  [EVENT_KEYS.IS_LOADING_DATA]: {
    success: null,
    fail: null,
  },
  [EVENT_KEYS.PUSH]: {
    success: 'Push successful',
    fail: 'Failed to push changes',
  },
  [EVENT_KEYS.UPDATE_PRESET_FILE]: {
    success: null,
    fail: 'Failed to update preset file',
  },
  [EVENT_KEYS.LOG]: {
    success: null,
    fail: null,
  },
  [EVENT_KEYS.TEST_LOGGER]: {
    success: null,
    fail: null,
  },
  [EVENT_KEYS.DELETE_PRESET_FOLDER]: {
    success: null,
    fail: 'Failed to delete preset folder',
  },
  [EVENT_KEYS.APPLY_PRESET]: {
    success: 'Preset applied successfully',
    fail: 'Failed to apply preset',
  },
  [EVENT_KEYS.CREATE_PROJECT]: {
    success: 'Project created successfully',
    fail: 'Failed to create project',
  },
  [EVENT_KEYS.UPDATE_SERVER_SETTINGS]: {
    success: 'Server settings updated successfully',
    fail: 'Failed to update server settings',
  },
  [EVENT_KEYS.ADD_REMOTE]: {
    success: 'Remote url added successfully',
    fail: 'Failed to add remote url',
  },
  [EVENT_KEYS.DEBUG_LOG]: {
    success: null,
    fail: null,
  },
  [EVENT_KEYS.SELECT_DIRECTORY]: {
    success: null,
    fail: 'Failed to select directory',
  },
  [EVENT_KEYS.RELOAD]: {
    success: null,
    fail: 'Failed to reload',
  },
  [EVENT_KEYS.APP_SETTINGS_UPDATED]: {
    success: null,
    fail: 'action failed',
  },
  [EVENT_KEYS.APPROVE_ANALYTICS]: {
    success: null,
    fail: 'action failed',
  },
  [EVENT_KEYS.RUN_TERMINAL_COMMAND]: {
    success: null,
    fail: 'action failed',
  },
  [EVENT_KEYS.TERMINAL_COMMAND_OUTPUT]: {
    success: null,
    fail: 'action failed',
  },
  [EVENT_KEYS.RELOAD_PROJECT]: {
    success: null,
    fail: 'failed reload project',
  },
  [EVENT_KEYS.OPEN_PROJECT_DIRECTORY]: {
    success: null,
    fail: 'failed to open project folder',
  },
};
