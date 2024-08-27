import { enqueueSnackbar } from 'notistack';
import { EVENTS_SNACKBAR } from '../../consts/events';
import { EVENT_KEYS } from '../../types/events';
import { reportEventReceived } from './analytics';

export const handleReceiveEvent = (event: EVENT_KEYS, arg: any) => {
  try {
    // eslint-disable-next-line no-console
    console.log('eventReceived: ', event, arg);
    const { success, error } = arg;

    reportEventReceived(event, success, {
      event,
      success,
      error,
    });

    if (!!success && !!enqueueSnackbar && EVENTS_SNACKBAR[event]?.success) {
      enqueueSnackbar(EVENTS_SNACKBAR[event].success, { variant: 'success' });
    }
    if (!success && !!enqueueSnackbar && EVENTS_SNACKBAR[event]?.fail) {
      enqueueSnackbar(EVENTS_SNACKBAR[event].fail, { variant: 'error' });
    }
  } catch (error) {
    console.log('error in notification', error);
  }
};
