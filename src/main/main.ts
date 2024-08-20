/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, dialog, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
// import './events';
import {
  detectIPAddressChanges,
  getActiveProjectName,
  getProjectPath,
} from '../backend/utils';
import { closeInternalServer, startInternalServer } from '../backend';
import { closeProjectServers } from '../backend/server';
import { EVENT_KEYS } from '../types/events';

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);


// eslint-disable-next-line import/no-mutable-exports
let mainWindow: BrowserWindow | null = null;

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

let clearAutoUpdateInterval: ReturnType<typeof setInterval> | null = null;
let updateAvailable = false;

const checkForUpdate = () => {
  console.log('start checking for update....');
  mainWindow?.webContents.send('EVENT_KEYS.DEBUG_LOG', {
    message: 'start checking for update....',
    updateAvailable,
  });

  try {
    if (!updateAvailable) {
      autoUpdater.checkForUpdatesAndNotify();
    }
  } catch (error) {
    mainWindow?.webContents.send('EVENT_KEYS.DEBUG_LOG', {
      message: 'failed checking for update',
    });
  }
};

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    setTimeout(checkForUpdate, 10000);
    clearAutoUpdateInterval = setInterval(checkForUpdate, 1000 * 60 * 60 * 5);
  }
}

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }
  startInternalServer();

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  // mainWindow.webContents.openDevTools()

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  detectIPAddressChanges((ip: string) => {
    mainWindow?.webContents.send(EVENT_KEYS.IP_CHANGED, { ip });
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  autoUpdater.on('update-available',(e)=>{
    mainWindow?.webContents.send(EVENT_KEYS.DEBUG_LOG, {
      e,
      event: 'update-available',
    });
  });
  autoUpdater.on('update-not-available', (e) => {
    mainWindow?.webContents.send('EVENT_KEYS.DEBUG_LOG', {
      e,
      event: 'update-not-available',
    });
  });
  autoUpdater.on('update-downloaded', (e) => {
    updateAvailable = true;
    setTimeout(
      () => {
        updateAvailable = false;
      },
      1000 * 60 * 60 * 5,
    );
    mainWindow?.webContents.send('EVENT_KEYS.DEBUG_LOG', {
      e,
      event: 'update-downloaded',
    });
  });
  autoUpdater.on('error', (e) => {
    mainWindow?.webContents.send('EVENT_KEYS.DEBUG_LOG', { e, event: 'error' });
  });

  autoUpdater.on('download-progress', (progressObj) => {
    mainWindow?.webContents.send('EVENT_KEYS.DEBUG_LOG', {
      progressObj,
      event: 'download-progress',
    });
  });

  // eslint-disable-next-line no-new
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (clearAutoUpdateInterval) {
    clearInterval(clearAutoUpdateInterval);
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  closeProjectServers();
  closeInternalServer();
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);

// export { mainWindow };

/// events

ipcMain.on('devtools', async (event) => {
  try {
    mainWindow?.webContents.openDevTools();
  } catch (error) {
    console.log('Error devtools:', error);
    event.reply('devtools', { success: false, error });
  }
});

ipcMain.on('selectDirectory', async (event) => {
  const dir = await dialog.showOpenDialog(mainWindow as BrowserWindow, {
    properties: ['openDirectory'],
  });
  event.reply('selectDirectory', {
    success: true,
    directoryPath: `${dir.filePaths[0]}/`,
  });
});

ipcMain.on('openProjectDirectory', async (event, args) => {
  try {
    const {platform} = args;
    
    const activeProjectName = await getActiveProjectName();
    if (activeProjectName) {
      const projectPath = await getProjectPath(activeProjectName);
      if(platform === 'vscode'){
        await execAsync('code .', { cwd: projectPath });
      }else{
        shell.showItemInFolder(projectPath); // Show the given file in a file manager. If possible, select the file.
      }
    } else {
      event.reply('openProjectDirectory', {
        success: false,
        activeProjectName,
      });
    }
  } catch (error) {
    event.reply('openProjectDirectory', { success: false, error });
  }
});
