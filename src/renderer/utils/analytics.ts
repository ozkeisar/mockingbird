import * as amplitude from '@amplitude/analytics-browser';
import { BUTTONS, COMMANDS, ELEMENTS } from '../../consts/analytics';
import { EVENT_KEYS } from '../../types/events';
import { isElectronEnabled } from '../const/general';

export const isDoker = !isElectronEnabled;

const reportEvent = (
  event: string,
  args: Record<string, string | number | boolean>,
) => {
  amplitude.track(event, { ...args, isDoker, isElectronEnabled });
};

export const reportCommandExecuted = (
  event: COMMANDS,
  args?: Record<string, string | number | boolean>,
) => {
  reportEvent(`command executed`, { event, ...args });
};

export const reportButtonClick = (
  event: BUTTONS,
  args?: Record<string, string | number | boolean>,
) => {
  reportEvent(`button click`, { event, ...args });
};

export const reportElementClick = (
  event: ELEMENTS,
  args?: Record<string, string | number | boolean>,
) => {
  reportEvent(`element click`, { event, ...args });
};

export const reportSendEvent = (
  event: EVENT_KEYS,
  args?: Record<string, string | number | boolean>,
) => {
  reportEvent(`send event`, { event, ...args });
};

export const reportEventReceived = (
  event: EVENT_KEYS,
  success?: boolean,
  args?: Record<string, string | number | boolean | null>,
) => {
  let eventName = `${event}`;

  if (success === true) {
    eventName += ' success';
  } else if (success === false) {
    eventName += ' failed';
  }
  reportEvent(`received event`, {
    event: eventName,
    success: `${success}`,
    ...args,
  });
};
