import * as amplitude from '@amplitude/analytics-browser';
import { BUTTONS, COMMANDS, ELEMENTS } from '../../consts/analytics';
import { EVENT_KEYS } from '../../types/events';

const reportEvent = (
  event: string,
  args: Record<string, string | number | boolean>,
) => {
  amplitude.track(event, args);
};

export const reportCommandExecuted = (
  event: COMMANDS,
  args?: Record<string, string | number | boolean>,
) => {
  reportEvent(`command executed - ${event}`, { commandName: event, ...args });
};

export const reportButtonClick = (
  event: BUTTONS,
  args?: Record<string, string | number | boolean>,
) => {
  reportEvent(`button click - ${event}`, { buttonName: event, ...args });
};

export const reportElementClick = (
  event: ELEMENTS,
  args?: Record<string, string | number | boolean>,
) => {
  reportEvent(`element click - ${event}`, { elementName: event, ...args });
};

export const reportSendEvent = (
  event: EVENT_KEYS,
  args?: Record<string, string | number | boolean>,
) => {
  reportEvent(`send - ${event}`, { eventName: event, ...args });
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
  reportEvent(`received - ${eventName}`, { eventName, ...args });
};
