import LoadingButton from "@mui/lab/LoadingButton";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material"
import { useEffect, useState } from "react";
import { BUTTONS } from "../../../../consts/analytics";
import { ProjectServer, RouteParent } from "../../../../types";
import { EVENT_KEYS } from "../../../../types/events";
import { useProjectStore } from "../../../state/project";
import { emitSocketEvent, reportButtonClick, socket } from "../../../utils";



export const DeleteParentDialog = ({server, parent, open, onClose}: {server: ProjectServer, parent: RouteParent, open: boolean, onClose: ()=>void})=>{
  const { activeProjectName, removeParent, setHasDiffs } = useProjectStore();
  const [isLoading, setIsLoading] = useState(false)

  useEffect(()=>{
    const onEvent = (arg: any) => {
      setIsLoading(false)
      const { success, projectName, serverName, parentId, hasDiffs } = arg;
      setHasDiffs(hasDiffs)
      if(success && projectName === activeProjectName){
        removeParent(serverName, parentId)
        onClose();
      }
    }
   socket.on(EVENT_KEYS.DELETE_PARENT, onEvent);

    return ()=>{
      socket.off(EVENT_KEYS.DELETE_PARENT, onEvent)
    }
},[activeProjectName]);


  const handleDelete = ()=>{
    reportButtonClick(BUTTONS.DELETE_PARENT_DIALOG_DELETE)

    setIsLoading(true)
    emitSocketEvent(EVENT_KEYS.DELETE_PARENT, {
      projectName: activeProjectName,
      serverName: server.name,
      parentFilename: parent.filename,
      parentId: parent.id
    });   
  }

  const handleClose = ()=>{
    reportButtonClick(BUTTONS.DELETE_PARENT_DIALOG_CANCEL)
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
        delete Folder
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          are you sure you want to delete this parent?
        </DialogContentText>
        <DialogContentText id="alert-dialog-description">
          this will permanently delete the parent and all its routes
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} autoFocus>
          cancel
        </Button>
        <LoadingButton
                loadingPosition="start"
                variant="text"
                color={'error'}
                onClick={handleDelete}
                loading={isLoading}
            >
                Delete parent
            </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}