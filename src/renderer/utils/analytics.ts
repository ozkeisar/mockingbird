import { trackEvent } from "@aptabase/electron/renderer";
import { BUTTONS, COMMANDS, ELEMENTS } from "../../consts/analytics";
import { EVENT_KEYS } from "../../types/events";
import * as amplitude from '@amplitude/analytics-browser';


export const EXCLUDE_EVENTS = [
    EVENT_KEYS.SERVER_LOGGER
]

const EVENT_COUNTER: {[key:string]: number} = {

}

const reportEvent = (event: string, args: Record<string, string | number | boolean> )=>{
    trackEvent(event, args); 

    amplitude.track(event, args);
}

export const reportCommandExecuted = (event: COMMANDS, args?: Record<string, string | number | boolean>)=>{
    reportEvent('command executed', {commandName: event, ...args})
}

export const reportButtonClick = (event: BUTTONS, args?: Record<string, string | number | boolean>)=>{
    reportEvent('button click', {buttonName: event, ...args})
}

export const reportElementClick = (event: ELEMENTS, args?: Record<string, string | number | boolean>)=>{
    reportEvent('element click', {elementName: event, ...args})
}

export const reportSendEvent = (event: EVENT_KEYS, args?: Record<string, string | number | boolean>)=>{
    reportEvent('send event', {eventName: event, ...args})
}

export const reportEventReceived = (event: EVENT_KEYS, success?: boolean, args?: Record<string, string | number | boolean>)=>{
    let eventName = '' + event;

    if(EXCLUDE_EVENTS.includes(event) && success !== false){
        EVENT_COUNTER[event] = (EVENT_COUNTER[event] || 0) +1;
        if(EVENT_COUNTER[event] >= 100){
            EVENT_COUNTER[event] = 0;
            reportEvent('event received', {eventName: event+':100', ...args})
        }
        return;
    }

    if(success === true){
        eventName += ' success'
    }else if(success === false){
        eventName += ' failed'
    }
    reportEvent('event received', {eventName, ...args})
}