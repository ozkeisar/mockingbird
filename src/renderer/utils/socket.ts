import { io } from 'socket.io-client';
import { EVENT_KEYS } from '../../types/events';
import { reportSendEvent } from './analytics';
import { flattenObject } from './general';


export const socket = io('http://localhost:1511');


export const emitSocketEvent = (event: EVENT_KEYS, ...args: unknown[] & {withAnalyticsParams?: boolean})=>{
    console.log(event,args,flattenObject(args?.withAnalyticsParams ? args : {}))
    
    reportSendEvent(event, flattenObject(args?.withAnalyticsParams ? args : {}))

    socket.emit(event, ...args);
}