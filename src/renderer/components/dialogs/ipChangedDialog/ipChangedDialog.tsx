import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material"
import { BUTTONS } from "../../../../consts/analytics";
import { EVENT_KEYS } from "../../../../types/events";
import { useProjectStore } from "../../../state/project";
import { emitSocketEvent, reportButtonClick, socket } from "../../../utils";



export const IpChangedDialog = ({open, onClose}: {open: boolean, onClose: ()=>void})=>{
    const { activeProjectName } = useProjectStore();

    const handleRestart = ()=>{
      reportButtonClick(BUTTONS.DELETE_IP_CHANGED_DIALOG_RESTART)
        emitSocketEvent(EVENT_KEYS.RESTART_SERVER, {projectName: activeProjectName});    
        onClose();
    }

    const handleClose = ()=>{
      reportButtonClick(BUTTONS.DELETE_IP_CHANGED_DIALOG_CLOSE)

        emitSocketEvent(EVENT_KEYS.CLOSE_SERVER);

        onClose();
    }


    return (
        <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          IP address has changed!
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            your server IP address has changed, what would you like to do?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            Close
          </Button>
          <Button onClick={handleRestart}>Restart server</Button>
        </DialogActions>
      </Dialog>
    )
}