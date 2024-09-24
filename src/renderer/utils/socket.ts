import { io } from 'socket.io-client';
import { EVENT_KEYS } from '../../types/events';
import { reportSendEvent } from './analytics';
import { isElectronEnabled } from './electron';
import { flattenObject } from './general';

const baseURl = window.location.href

export const socket = io(isElectronEnabled?'http://localhost:1511':baseURl);

export const emitSocketEvent = (
  event: EVENT_KEYS,
  ...args: unknown[] & { withAnalyticsParams?: boolean }
) => {
  // eslint-disable-next-line no-console
  console.log(
    'emitSocketEvent: ',
    event,
    args,
    flattenObject(args?.withAnalyticsParams ? args : {}),
  );

  reportSendEvent(event, flattenObject(args?.withAnalyticsParams ? args : {}));

  socket.emit(event, ...args);
};
