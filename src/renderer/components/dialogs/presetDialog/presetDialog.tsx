import styles from './presetFolder.module.css'
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useEffect, useState } from "react";

import { Preset } from "../../../../types";
import Typography from '@mui/material/Typography';
import { v4 as uuid } from 'uuid';
import { useProjectStore } from '../../../state/project';
import LoadingButton from '@mui/lab/LoadingButton';
import cloneDeep from 'lodash/cloneDeep';
import { EVENT_KEYS } from '../../../../types/events';
import { emitSocketEvent, reportButtonClick, socket } from '../../../utils';
import { BUTTONS } from '../../../../consts/analytics';



type Props = {
    onClose: Function;
    open: boolean;
    data: Preset | null;
    presetFolderId: string;
}

  
export const PresetDialog = ({onClose, open, data, presetFolderId }:Props)=>{
    const { activeProjectName, presetFoldersHash, setHasDiffs, addUpdatePresetFolder } = useProjectStore();
    
    const [description, setDescription] = useState<string>(data?.description || '');
    const [name, setName] = useState<string>(data?.name|| '');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const presetFolder = Object.values(presetFoldersHash).find((item)=>item.id === presetFolderId)

    const presetsNames = Object.values(presetFolder?.presetsHash || {}).map(({name})=>name)
    const nameAlreadyExist = presetsNames?.includes(name) && data?.name !== name

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
   

    const handleSave = ()=>{
        reportButtonClick(BUTTONS.PRESET_DIALOG_SAVE)
        const preset: Preset = {
            id: data?.id || uuid(),
            description,
            name,
            routesHash: data?.routesHash || {},
        }

        const presetFolder = presetFoldersHash[presetFolderId]

        if(!presetFolder){
            return;
        }

        const _presetFolder = cloneDeep(presetFolder);

        if(_presetFolder?.presetsHash){
            _presetFolder.presetsHash[preset.id] = preset
        }

       setIsLoading(true);

        emitSocketEvent(EVENT_KEYS.UPDATE_PRESET_FILE, {
            presetFolder: _presetFolder,
            projectName: activeProjectName,
        });   
    }

    const handleClose = ()=>{
        reportButtonClick(BUTTONS.PRESET_DIALOG_CLOSE)

        onClose()
    }

   
    return (
       <Dialog
        open={open}
        onClose={handleClose}>
        <DialogTitle>Preset</DialogTitle>
        <DialogContent style={{minWidth:'400px', width:'400px'}}>
            <TextField
                autoFocus
                required
                margin="dense"
                id="name"
                name="name"
                label="name"
                type="text"
                fullWidth
                variant="outlined"
                value={name}
                onChange={(e)=>{setName(e.target.value)}}
                error={!!nameAlreadyExist}
            />
            
            {!!nameAlreadyExist && <Typography variant="subtitle2" gutterBottom style={{color:'red' }}>
                preset name already exist!
            </Typography>}

            <TextField
                value={description}
                margin="dense"
                id="description"
                name="description"
                label="description"
                type="text"
                fullWidth
                variant='outlined'
                onChange={(e)=>{
                    setDescription(e.target.value)
                }}
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <LoadingButton
                variant="contained"
                onClick={handleSave}
                loading={isLoading}
                disabled={ nameAlreadyExist || name.length < 1}
            >
                save
            </LoadingButton>
        </DialogActions>
     </Dialog>
    )
  }
  