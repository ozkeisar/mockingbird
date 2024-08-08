import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { DialogActions, DialogContent, DialogContentText } from '@mui/material';
import { useEffect, useState } from 'react';
import './settingsDialog.css'
import { LoadingButton } from '@mui/lab';
import { useGeneralStore } from '../../../state';
import { useProjectStore } from '../../../state/project';
import { CloneDialog } from '../cloneDialog';
import { EVENT_KEYS } from '../../../../types/events';
import { emitSocketEvent, openInNewTab, reportButtonClick, reportElementClick, socket } from '../../../utils';
import { BUTTONS, ELEMENTS } from '../../../../consts/analytics';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

type props = {
    open: boolean;
    onClose: ()=>void;
}

export const SettingsDialog = ({open,onClose}:props)=>{
    const {
        setProjectSettings,
        activeProjectName,
        projectSettings,
        setHasDiffs
      } = useProjectStore();
    const { isServerUp } = useGeneralStore();
    const [_forceProxy, setForceProxy] = useState(projectSettings?.forceProxy || false);
    const [isLoading, setIsLoading] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [openCloneDialog, setOpenCloneDialog] = useState(false);

    
    useEffect(()=>{
        const onEvent = (arg: any) => {
            const {success, projectSettings, projectName, hasDiffs} = arg;
            if(success && activeProjectName === projectName){
                setProjectSettings(projectSettings);
                setHasDiffs(hasDiffs)
                if(isServerUp){
                    emitSocketEvent(EVENT_KEYS.RESTART_SERVER, {projectName: activeProjectName})
                }
                setIsLoading(false)
                onClose()
            }else{
                setIsLoading(false)
            }
        }
        socket.on(EVENT_KEYS.UPDATE_PROJECT_SETTINGS, onEvent);
        return ()=>{
            socket.off(EVENT_KEYS.UPDATE_PROJECT_SETTINGS, onEvent)
        }
    },[isServerUp, activeProjectName])

    const handleSave = ()=>{
        reportButtonClick(BUTTONS.SETTINGS_DIALOG_SAVE)
        setIsLoading(true)
        emitSocketEvent(EVENT_KEYS.UPDATE_PROJECT_SETTINGS,{
            settings:{
                forceProxy: _forceProxy,
            },
            projectName: activeProjectName
        });
    }

    const handleDeleteClick = ()=>{
        reportButtonClick(BUTTONS.SETTINGS_DIALOG_DELETE)
        setOpenDeleteDialog(true)
    }

    const deleteRepo = ()=>{
        reportButtonClick(BUTTONS.DELETE_PROJECT_DIALOG_DELETE)

        emitSocketEvent(EVENT_KEYS.DELETE_PROJECT, {projectName: activeProjectName});
        setOpenDeleteDialog(false)
        onClose()
    }

    return ( <>
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="SettingsDialog"
            aria-describedby="SettingsDialog"
        >
            <DialogTitle id="alert-dialog-title">
                App settings
            </DialogTitle>
            <DialogContent>
                {/* <div className='switch'>
                    <FormControlLabel
                        control={
                            <Switch 
                                checked={_forceProxy} 
                                onChange={(e)=>{
                                    setForceProxy(e.target.checked)
                                    reportElementClick(ELEMENTS.SETTINGS_DIALOG_PROXY_TOGGLE, {checked: e.target.checked})
                                }} 
                            />
                        }
                        label="Force proxy for all servers"
                    />
                </div> */}
                <div style={{display: "flex", flexDirection:'column'}}>
                    <LoadingButton 
                        endIcon={<OpenInNewIcon />}
                        onClick={()=>{
                            openInNewTab('localhost:1511/api-docs')
                        }}
                        variant='outlined'
                        style={{marginBottom: '15px'}}
                    >Open Mockingbird swagger</LoadingButton>
                    <Button variant='outlined' color='error' onClick={handleDeleteClick}>delete current project</Button>
                </div>
            </DialogContent>
            <DialogActions>
            {/* <Button onClick={()=>{
                reportButtonClick(BUTTONS.SETTINGS_DIALOG_CLOSE)
                onClose()
            }}>cancel</Button>
            <LoadingButton
                    loading={isLoading}
                    loadingPosition="center"
                    variant="text"
                    onClick={handleSave}
                    autoFocus
                    disabled={projectSettings?.forceProxy === _forceProxy}
                >
                    Save
            </LoadingButton> */}
            </DialogActions>
        </Dialog>
        {openCloneDialog 
            && <CloneDialog open={openCloneDialog} onClose={
                (success)=>{
                    setOpenCloneDialog(false)
                    if(success){
                        onClose();
                    }
                }
            }></CloneDialog>
        }
        <Dialog
            open={openDeleteDialog}
            onClose={()=>setOpenDeleteDialog(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {"Delete repository"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                        This action will delete ALL of your data and you won`t be able to restore it
                </DialogContentText>
                <DialogContentText id="alert-dialog-description">
                        Are you sure you want to continue?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={()=>{
                    reportButtonClick(BUTTONS.DELETE_PROJECT_DIALOG_CLOSE)
                    setOpenDeleteDialog(false)
                }}>cancel</Button>
                <Button color="error" onClick={deleteRepo} autoFocus>
                    Yes, delete
                </Button>
            </DialogActions>
        </Dialog>
        </>
    )
}