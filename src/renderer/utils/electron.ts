import { EVENT_KEYS } from '../../types/events';
import { reportSendEvent } from './analytics';
import { handleReceiveEvent } from './events';

const sendMessage = (channel: EVENT_KEYS, ...args: any) => {
  reportSendEvent(channel, args?.withAnalyticsParams ? args : {});
  window.electron.ipcRenderer.sendMessage(channel, ...args);
};

const on = (channel: EVENT_KEYS, func: (...args: any) => void) => {
  return window.electron.ipcRenderer.on(channel, (arg: any) => {
    handleReceiveEvent(channel, arg);
    func(arg);
  });
};

export const ElectronEvents = {
  sendMessage,
  on,
};
