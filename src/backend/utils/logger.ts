import { EVENT_KEYS } from '../../types/events';
import { emitGlobalSocketMessage } from '../socket';

export const logger = (message: string, ...params: any[]) => {
  emitGlobalSocketMessage(EVENT_KEYS.LOG, { message, params });
};
