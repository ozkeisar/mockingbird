import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material"
import { BUTTONS } from "../../../../consts/analytics";
import { reportButtonClick } from "../../../utils";


const formatTime = (date: Date) => {
    const _date = new Date(date)
    // Extract the time components and format them with leading zeros if needed
    const hours = _date.getHours();
    const minutes = String(_date.getMinutes()).padStart(2, '0');
    const seconds = String(_date.getSeconds()).padStart(2, '0');

        // Determine if it's AM or PM
    const amPM = hours >= 12 ? 'PM' : 'AM';

    // Convert hours to 12-hour format
    const formattedHours = String(hours).padStart(2, '0'); // If hours is 0, then display 12

    // Combine the components into a formatted time string
    return `${formattedHours}:${minutes}:${seconds}${amPM}`;
}


type props = {
    open: boolean;
    onClose: ()=>void;
    onActivate: ()=> void;
    serverDisabledUntil: Date
}

export const ServerDownDialog = ({open, onClose, onActivate, serverDisabledUntil}: props)=>{

    const handleClose = ()=>{
      reportButtonClick(BUTTONS.SERVER_DOWN_DIALOG_CLOSE)
      onClose();
    }

    const handleActivate = ()=>{
      reportButtonClick(BUTTONS.SERVER_DOWN_DIALOG_ACTIVATE)
      onActivate()
    }


    return (
        <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Server is Down
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {`you need to activate your program, server is down until ${formatTime(serverDisabledUntil)}`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>
            Close
          </Button>
          <Button onClick={handleActivate} autoFocus>Activate</Button>
        </DialogActions>
      </Dialog>
    )
}