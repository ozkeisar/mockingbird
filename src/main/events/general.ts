import { BrowserWindow, dialog, ipcMain } from 'electron';
import { getActiveProjectName, getProjectPath } from '../../backend/utils';
import { mainWindow } from '../main';
const {shell} = require('electron') // deconstructing assignment


ipcMain.on('devtools', async (event, arg) => {
  try {
    mainWindow?.webContents.openDevTools()
  } catch (error) {
    console.log('Error devtools:',error)
    event.reply('devtools', {success: false, error});
  }
});

ipcMain.on('selectDirectory', async (event, arg) => {

  const dir = await dialog.showOpenDialog(mainWindow as BrowserWindow, {
    properties: ['openDirectory']
  });
  event.reply('selectDirectory', {success: true, directoryPath :dir.filePaths[0] +'/'});
});

ipcMain.on('openProjectDirectory', async (event, arg) => {

  try {
    const activeProjectName = await getActiveProjectName()
    if(activeProjectName){
      const path = await getProjectPath(activeProjectName)
      shell.showItemInFolder(path) // Show the given file in a file manager. If possible, select the file.

    }else{
      event.reply('openProjectDirectory', {success: false, activeProjectName});
    }
  } catch (error) {
    event.reply('openProjectDirectory', {success: false, error});
      
  }
});


