import LoadingButton from "@mui/lab/LoadingButton";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material"
import cloneDeep from "lodash/cloneDeep";
import { useEffect, useState } from "react";
import { BUTTONS } from "../../../../consts/analytics";
import { EVENT_KEYS } from "../../../../types/events";
import { useProjectStore } from "../../../state/project";
import { emitSocketEvent, reportButtonClick, socket } from "../../../utils";



export const DeletePresetRouteDialog = ({presetFolderId, presetId, presetRouteId, open, onClose}: {presetFolderId: string, presetId: string, presetRouteId: string, open: boolean, onClose: ()=>void})=>{
  const { activeProjectName, setHasDiffs, addUpdatePresetFolder, presetFoldersHash } = useProjectStore();
  const [isLoading, setIsLoading] = useState(false)

  useEffect(()=>{
    const onEvent = (arg: any) => {
      setIsLoading(false);
      const {success, presetFolder, projectName, hasDiffs} = arg;
      setHasDiffs(hasDiffs)

      if(success && projectName === activeProjectName ){
          addUpdatePresetFolder(presetFolder)
          onClose()
      }
  }
    socket.on(EVENT_KEYS.UPDATE_PRESET_FILE,onEvent);
    return ()=>{
      socket.off(EVENT_KEYS.UPDATE_PRESET_FILE, onEvent)
    }
  },[activeProjectName])


  const handleDelete = ()=>{
    reportButtonClick(BUTTONS.DELETE_PRESET_ROUTE_DIALOG_DELETE)
    const presetFolder = cloneDeep(presetFoldersHash[presetFolderId]);

    const preset = presetFolder?.presetsHash?.[presetId];

    if(preset){
      delete preset.routesHash?.[presetRouteId];
    }

    setIsLoading(true);

    emitSocketEvent(EVENT_KEYS.UPDATE_PRESET_FILE, {
      presetFolder,
      projectName: activeProjectName,
    });   
  }

  const handleClose = ()=>{
    reportButtonClick(BUTTONS.DELETE_PRESET_ROUTE_DIALOG_CANCEL)

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
        delete route
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          are you sure you want to delete this route from preset?
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