import { create } from 'zustand'
import { ServerLog } from '../../../types';
import throttle from 'lodash.throttle';

export type LoggerStateFuncs = {
    resetLoggerState: () => void;
    addServerLog: (log: ServerLog)=> void;
}

export type LoggerStateProps = {
    serverLogs: ServerLog[];
}

export type SettingsState = LoggerStateFuncs & LoggerStateProps

const INIT_STATE: LoggerStateProps = {
    serverLogs: []
}

export const useLoggerStore = create<SettingsState>((set) => {
    let logBuffer: ServerLog[] = [];

    const flushLogs = () => {
        if (logBuffer.length > 0) {
        set((state) => ({ serverLogs: [...state.serverLogs, ...logBuffer] }));
        logBuffer = [];
        }
    };

    // Throttle the flushing to ensure it happens at a regular interval
    const throttledFlushLogs = throttle(flushLogs, 1000); // Flush every 1000ms


    return {
    ...INIT_STATE,
    resetLoggerState: () => set({ ...INIT_STATE }),
    addServerLog: (newLog) => {
        logBuffer.push(newLog);
        throttledFlushLogs(); // Ensure logs are flushed at regular intervals
    },
}});