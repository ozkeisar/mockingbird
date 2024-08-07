import LoadingButton from "@mui/lab/LoadingButton";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material"
import { useEffect, useState } from "react";
import { BUTTONS } from "../../../../consts/analytics";
import { PresetsFolder } from "../../../../types";
import { EVENT_KEYS } from "../../../../types/events";
import { useProjectStore } from "../../../state/project";
import { emitSocketEvent, reportButtonClick, socket } from "../../../utils";



export const DeletePresetFolderDialog = ({presetFolder, open, onClose}: {presetFolder: PresetsFolder, open: boolean, onClose: ()=>void})=>{
  const { activeProjectName, removePresetFolder, setHasDiffs } = useProjectStore();
  const [isLoading, setIsLoading] = useState(false)

  useEffect(()=>{

    const onEvent = (arg: any) => {
      setIsLoading(false)
      const { success, projectName, folderId, hasDiffs } = arg;
      setHasDiffs(hasDiffs)
      if(success && projectName === activeProjectName){
        removePresetFolder(folderId)
        onClose();
      }
    }
    socket.on(EVENT_KEYS.DELETE_PRESET_FOLDER, onEvent);

    return ()=>{
      socket.off(EVENT_KEYS.DELETE_PRESET_FOLDER, onEvent);
    }
},[activeProjectName]);


  const handleDelete = ()=>{
    reportButtonClick(BUTTONS.DELETE_PRESET_FOLDER_DIALOG_DELETE)

    setIsLoading(true)
    emitSocketEvent(EVENT_KEYS.DELETE_PRESET_FOLDER, {
      projectName: activeProjectName,
      filename: presetFolder.filename,
      folderId: presetFolder.id
    });   
  }

  const handleClose = ()=>{
    reportButtonClick(BUTTONS.DELETE_PRESET_FOLDER_DIALOG_CANCEL)
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
        delete Preset Folder
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          are you sure you want to delete this folder?
        </DialogContentText>
        <DialogContentText id="alert-dialog-description">
          this will permanently delete the folder and all its presets
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
                Delete
            </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}