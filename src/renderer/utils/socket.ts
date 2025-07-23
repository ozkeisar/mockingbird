import { io } from 'socket.io-client';
import { EVENT_KEYS } from '../../types/events';
import { BASE_URL } from '../const/general';
import { reportSendEvent } from './analytics';
import { flattenObject } from './general';

export const socket = io(BASE_URL);

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
