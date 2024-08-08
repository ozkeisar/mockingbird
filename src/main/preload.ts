// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { EVENT_KEYS } from '../types/events';



const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: EVENT_KEYS, ...args: unknown[]) {
      console.log('sendMessage:',channel, ...args)
      ipcRenderer.send(channel, ...args);
    },
    on(channel: EVENT_KEYS, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        {
          console.log('on:',channel, ...args)
          func(...args)
        };
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: EVENT_KEYS, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
