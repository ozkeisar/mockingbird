import * as amplitude from '@amplitude/analytics-node';
// import { BUTTONS, COMMANDS, ELEMENTS } from '../../consts/analytics';
// import { EVENT_KEYS } from '../../types/events';
import { init, identify, Identify } from '@amplitude/analytics-node';
import pj from '../../../package.json';

let aliveInterval: NodeJS.Timeout | null = null;
const second = 60 * 1000;
const minutes = second * 60;

const reportEvent = (
  event: string,
  args: Record<string, string | number | boolean>,
) => {
  amplitude.track(event, args);
};

export const initAnalytics = async ({
  platform,
}: {
  platform: 'docker' | 'electron';
}) => {
  const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

  init(
    isDev
      ? '16543070a2c829f8a27f46c21fc0f708'
      : 'ed51d61371d63ef1136b842900ebdae',
    {},
  );

  const identifyObj = new Identify();
  identify(identifyObj, {
    // user_id: 'user@amplitude.com',
    app_version: pj.version,
    platform,
  });

  // Clear any existing interval to prevent memory leaks
  if (aliveInterval !== null) {
    clearInterval(aliveInterval);
  }

  // Send "alive" heartbeat every 30 minutes
  aliveInterval = setInterval(() => {
    reportEvent('alive', {});
  }, minutes * 30);
};

/**
 * Cleanup function to clear analytics intervals
 * Should be called on application shutdown
 */
export const cleanupAnalytics = () => {
  if (aliveInterval !== null) {
    clearInterval(aliveInterval);
    aliveInterval = null;
  }
};

// export const reportCommandExecuted = (
//   event: COMMANDS,
//   args?: Record<string, string | number | boolean>,
// ) => {
//   reportEvent(`command executed`, { event, ...args });
// };

// export const reportButtonClick = (
//   event: BUTTONS,
//   args?: Record<string, string | number | boolean>,
// ) => {
//   reportEvent(`button click`, { event, ...args });
// };

// export const reportElementClick = (
//   event: ELEMENTS,
//   args?: Record<string, string | number | boolean>,
// ) => {
//   reportEvent(`element click`, { event, ...args });
// };

// export const reportSendEvent = (
//   event: EVENT_KEYS,
//   args?: Record<string, string | number | boolean>,
// ) => {
//   reportEvent(`send event`, { event, ...args });
// };

// export const reportEventReceived = (
//   event: EVENT_KEYS,
//   success?: boolean,
//   args?: Record<string, string | number | boolean | null>,
// ) => {
//   let eventName = `${event}`;

//   if (success === true) {
//     eventName += ' success';
//   } else if (success === false) {
//     eventName += ' failed';
//   }
//   reportEvent(`received event`, {
//     event: eventName,
//     success: `${success}`,
//     ...args,
//   });
// };
