import { enqueueSnackbar } from "notistack";
import { EVENTS_SNACKBAR } from "../../consts/events";
import { EVENT_KEYS } from "../../types/events";
import { reportEventReceived } from "./analytics";



export const handleReceiveEvent = (event: EVENT_KEYS, arg: any)=>{
    console.log(event, arg)

    const error =  arg?.success === false ? JSON.stringify(arg?.error || {}) : null
   
    reportEventReceived(event, arg?.success, {
        event,
        success: arg?.success,
        error,
    })
   
    if(!!arg?.success && !!enqueueSnackbar && EVENTS_SNACKBAR[event]?.success){
        enqueueSnackbar(EVENTS_SNACKBAR[event].success, {variant:'success'})
    }
    if(!arg?.success && !!enqueueSnackbar && EVENTS_SNACKBAR[event]?.fail){
        enqueueSnackbar(EVENTS_SNACKBAR[event].fail, {variant:'error'})
    }
}