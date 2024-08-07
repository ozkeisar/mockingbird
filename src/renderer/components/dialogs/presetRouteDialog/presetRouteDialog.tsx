import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useEffect, useState } from "react";

import { PresetRoute } from "../../../../types";
import Typography from '@mui/material/Typography';
import { v4 as uuid } from 'uuid';
import { useProjectStore } from '../../../state/project';
import LoadingButton from '@mui/lab/LoadingButton';
import styles from './presetRouteDialog.module.css'
import { Divider, ListItemIcon, ListItemText, MenuItem, MenuList, Tooltip } from '@mui/material';

import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import cloneDeep from 'lodash/cloneDeep';
import { emitSocketEvent, getRouteBGColor, reportButtonClick, reportElementClick, socket } from '../../../utils';
import { EVENT_KEYS } from '../../../../types/events';
import { BUTTONS, ELEMENTS } from '../../../../consts/analytics';
import { GraphqlRouteLabel } from '../../graphqlRouteLabel';


type Props = {
    onClose: Function;
    open: boolean;
    data: PresetRoute | null;
    folderId: string;
    presetId: string;
}

const CustomRouteLabel = ({label, method}:{label: string, method: Method})=>{
    return (
      <div className='tree-item-container'>
        {
          !!method 
          && <div className="route-method-tree" style={{backgroundColor: getRouteBGColor(method)}}>
            {method}
          </div>
        }
        {label}
      </div>
    )
  }
  
export const PresetRouteDialog = ({onClose, open, data, folderId, presetId }:Props)=>{
    const { activeProjectName, serversHash, setHasDiffs, addUpdatePresetFolder, presetFoldersHash } = useProjectStore();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [_serverId, setServerId] = useState<string | null>(data?.serverId || null);
    const [_parentId, setParentId] = useState<string | null>(data?.parentId || null);
    const [_routeId, setRouteId] = useState<string | null>(data?.routeId || null);
    const [_responseId, setResponseId] = useState<string | null>(data?.responseId || null);
    
    const server = _serverId ? serversHash[_serverId] : null 
    const parent = server && _parentId ? server.parentRoutesHash[_parentId] : null

    const getRoute = ()=>{
        if(!parent || !_routeId){
            return null;
        }
        if(parent.type === 'GraphQl'){
            return parent?.graphQlRouteHash?.[_routeId] || null
        }else{
            return parent.routesHash?.[_routeId] || null
        }
    }
    const route = getRoute();
    const isEdit = !!data?.id;
    const isGraphqlParent = parent?.type === 'GraphQl'

    const isAllSelected = _serverId && _parentId && _routeId && _responseId


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
        socket.on(EVENT_KEYS.UPDATE_PRESET_FILE, onEvent);
        return ()=>{
            socket.off(EVENT_KEYS.UPDATE_PRESET_FILE, onEvent)
        }
    },[activeProjectName])
   

    const handleSave = ()=>{
        reportButtonClick(BUTTONS.PRESET_ROUTE_DIALOG_SAVE)

        if(!isAllSelected){
            return;
        }

        const presetRoute: PresetRoute = {
            id: data?.id || uuid(),
            routeId: _routeId,
            parentId: _parentId,
            serverId: _serverId,
            responseId: _responseId,
        }

        const presetFolder = cloneDeep(presetFoldersHash[folderId]);

        const preset = presetFolder?.presetsHash?.[presetId] || null;

        if(preset?.routesHash){
            preset.routesHash[presetRoute.id] = presetRoute;
        }


        setIsLoading(true);

        emitSocketEvent(EVENT_KEYS.UPDATE_PRESET_FILE, {
            presetFolder,
            projectName: activeProjectName,
        });   
    }

    const handleClose = ()=>{
        reportButtonClick(BUTTONS.PRESET_ROUTE_DIALOG_CLOSE)
        onClose()
    }

   
    return (
       <Dialog
        open={open}
        fullWidth
        maxWidth={'md'}
        onClose={handleClose}>
        <DialogTitle>Preset</DialogTitle>
        <DialogContent style={{ display:'flex', width:'100%', height:"350px"}}>
            <Divider orientation="vertical" variant='middle' flexItem />
           <div className={styles.section}>
                <div className={styles.sectionTitle}>
                    <Typography variant='h6'>server</Typography>
                </div>
                <div className={styles.sectionList}>
                    {Object.values(serversHash).map((item)=>{
                        return (
                            <MenuItem dense selected={_serverId === item.name} onClick={()=>{
                                reportElementClick(ELEMENTS.PRESET_ROUTE_DIALOG_SERVER_ROW)
                                setServerId(item.name)
                            }}>
                                <ListItemIcon>
                                    <CloudQueueIcon fontSize="small" />
                                </ListItemIcon>
                                <Tooltip title={item.name}>
                                    <ListItemText>{item.name}</ListItemText>
                                </Tooltip>
                            </MenuItem>)
                    })}
                </div>
           </div>
           <Divider orientation="vertical" variant="middle" flexItem />

           <div className={styles.section}>
                <div className={styles.sectionTitle}>
                    <Typography variant='h6'>parent</Typography>
                </div>
                <div className={styles.sectionList}>
                    <MenuList>
                        {Object.values(server?.parentRoutesHash || {}).map((item)=>{
                            const isGraphql = item.type === 'GraphQl'
                            return (
                                <MenuItem dense selected={_parentId === item.id}  onClick={()=>{
                                    reportElementClick(ELEMENTS.PRESET_ROUTE_DIALOG_PARENT_ROW)
                                    setParentId(item.id)
                                }}> 
                                    <Tooltip title={isGraphql?item.name:item.path}>
                                        <ListItemText>{isGraphql?item.name:item.path}</ListItemText>
                                    </Tooltip>
                                </MenuItem>
                            )
                        })}
                    </MenuList>
                </div>
           </div>
           <Divider orientation="vertical" variant="middle" flexItem />

           <div className={styles.section}>
                <div className={styles.sectionTitle}>
                    <Typography variant='h6'>route</Typography>
                </div>
                <div className={styles.sectionList}>
                    {isGraphqlParent ? Object.values(parent?.graphQlRouteHash || {}).map((item)=>{
                        
                        return (
                            <MenuItem dense selected={_routeId === item.id} onClick={()=>{
                                reportElementClick(ELEMENTS.PRESET_ROUTE_DIALOG_ROUTE_ROW)

                                setRouteId(item.id)}
                            }>
                                <Tooltip title={item.name}>
                                    <span>
                                        <GraphqlRouteLabel label={item.name} type={item.type}/>
                                    </span>
                                </Tooltip>
                            </MenuItem>
                        )
                    })
                    :Object.values(parent?.routesHash || {}).map((item)=>{
                        return (
                            <MenuItem dense selected={_routeId === item.id} onClick={()=>{
                                reportElementClick(ELEMENTS.PRESET_ROUTE_DIALOG_ROUTE_ROW)

                                setRouteId(item.id)}
                            }>
                                <Tooltip title={item.method +':' +item.routePath}>
                                    <span>
                                        <CustomRouteLabel  label={item.routePath} method={item.method}/>
                                    </span>
                                </Tooltip>
                            </MenuItem>
                        )
                    })
                    }
                </div>
           </div>
           <Divider orientation="vertical" variant="middle" flexItem />

           <div className={styles.section}>
                <div className={styles.sectionTitle}>
                    <Typography variant='h6'>response</Typography>
                </div>
                <div className={styles.sectionList}>
                    {Object.values(route?.responsesHash || {}).map((item)=>{
                         return (
                            <MenuItem dense selected={_responseId === item.id} onClick={()=>{
                                reportElementClick(ELEMENTS.PRESET_ROUTE_DIALOG_RESPONSE_ROW)

                                setResponseId(item.id)
                            }}>
                                <Tooltip title={item.name}>
                                    <ListItemText>{item.name}</ListItemText>
                                </Tooltip>
                            </MenuItem>
                        )
                    })}
                </div>
           </div>
           <Divider orientation="vertical" variant="middle" flexItem />

        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <LoadingButton
                variant="contained"
                onClick={handleSave}
                loading={isLoading}
                disabled={ !isAllSelected }
            >
                save
            </LoadingButton>
        </DialogActions>
     </Dialog>
    )
  }
  