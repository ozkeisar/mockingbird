import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useEffect, useState } from "react";

import Typography from '@mui/material/Typography';
import { emitSocketEvent, isValidFilename, reportButtonClick, socket } from '../../../utils';
import { useProjectStore } from '../../../state/project';
import { EVENT_KEYS } from '../../../../types/events';
import { BUTTONS } from '../../../../consts/analytics';



type Props = {
    onClose: Function;
    open: boolean;
}

function findFreePort(existingPorts: number[]): number {
    const startingPort = 3005;

    // Create a set of existing ports for faster lookup
    const existingPortsSet = new Set(existingPorts);

    // Start from the starting port and check sequentially for a free port
    let port = startingPort;
    while (existingPortsSet.has(port)) {
        port++;
    }

    return port;
}


  
export const ServerDialog = ({onClose, open }:Props)=>{
    const { serversHash, activeProjectName, addServer, setHasDiffs } = useProjectStore();

    const serversPorts = Object.values(serversHash || {}).reduce((acc, item)=>{
        acc.push(item.settings.port)
        return acc;
    }, [] as number[])
    
    const [port, setPort] = useState<number>(findFreePort(serversPorts));
    const [name, setName] = useState<string>('');

    const nameAlreadyExist = Object.values(serversHash).map((server)=>server.name).includes(name)
    const portAlreadyExist = Object.values(serversHash).map((server)=>server.settings.port).includes(port);

    useEffect(()=>{
        const onEvent = (arg: any) => {
            const { success, projectName, server, hasDiffs } = arg;
            setHasDiffs(hasDiffs)
            if(success && projectName === activeProjectName){
              addServer(server);
              onClose();
            }
          }
        socket.on(EVENT_KEYS.CREATE_SERVER, onEvent);
    
        return ()=>{
          socket.off(EVENT_KEYS.CREATE_SERVER, onEvent)
        }
    },[activeProjectName]);
   

    const handleSave = ()=>{
        reportButtonClick(BUTTONS.SERVER_DIALOG_SAVE)
        emitSocketEvent(EVENT_KEYS.CREATE_SERVER, {
            projectName: activeProjectName,
            serverName: name,
            settings: {
                port,
            }
        });   
         
    }

    const handleClose = ()=>{
        reportButtonClick(BUTTONS.SERVER_DIALOG_CLOSE)

        onClose()
    }
   
    return (
       <Dialog
        open={open}
        onClose={handleClose}>
        <DialogTitle>Create new server</DialogTitle>
        <DialogContent>
            <div style={{width: '350px'}}>
            <TextField
                autoFocus
                style={{  width: '350px'}}
                required
                margin="dense"
                id="name"
                name="name"
                label="name"
                type="text"
                fullWidth
                variant="outlined"
                value={name}
                onChange={(e)=>{
                    if(isValidFilename(e.target.value) || !e.target.value.length){
                        setName(e.target.value)
                    }
                }}
                error={nameAlreadyExist}
            />
            
            {nameAlreadyExist && <Typography variant="subtitle2" gutterBottom style={{color:'red'}}>
                Server name already exist!
            </Typography>}

            <TextField
                required
                style={{ marginTop: '15px', width: '250px'}}
                error={!!portAlreadyExist}
                value={port}
                onChange={(e)=>{
                    setPort(parseInt(e.target.value))
                }}
                type="number"
                label="server port" 
                variant='filled' 
            />
            
            {!!portAlreadyExist && <Typography variant="subtitle2" gutterBottom style={{color:'red'}}>
                port already in use in other server!
            </Typography>}
           
            </div>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button 
                type="submit" 
                onClick={handleSave} 
                disabled={portAlreadyExist || nameAlreadyExist || name.length < 1}
            >save</Button>
        </DialogActions>
     </Dialog>
    )
  }
  