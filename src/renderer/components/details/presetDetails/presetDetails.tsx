import { Button, Card, CardActionArea, Checkbox, Chip, Divider, IconButton, Link, Tooltip, Typography } from "@mui/material"
import { useEffect, useState } from "react";
import { GraphQlRoute, GraphQlRouteResponse, Preset, PresetRoute, ProjectServer, Route, RouteParent, RouteResponse, ServersHash } from "../../../../types";
import { useSelectedPreset } from "../../../hooks"
import { useGeneralStore } from "../../../state";
import { useProjectStore } from "../../../state/project";
import { checkIsAllRoutesExists, emitSocketEvent, getGraphqlRouteBGColor, getRouteBGColor, reportButtonClick, reportElementClick, socket } from "../../../utils";
import styles from './presetDetails.module.css'
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { DeletePresetRouteDialog } from "../../dialogs/deletePresetRouteDialog";
import { DeletePresetDialog } from "../../dialogs/deletePresetDialog";
import LoadingButton from "@mui/lab/LoadingButton";
import { PresetDialog, PresetRouteDialog } from "../../dialogs";
import { EVENT_KEYS } from "../../../../types/events";
import { BUTTONS, ELEMENTS } from "../../../../consts/analytics";

function groupPresetRoutesByServerAndParent(routes: PresetRoute[]): Record<string, Record<string, PresetRoute[]>> {
    const groupedRoutes: Record<string, Record<string, PresetRoute[]>> = {};
  
    routes.forEach(route => {
      if (!groupedRoutes[route.serverId]) {
        groupedRoutes[route.serverId] = {};
      }
  
      if (!groupedRoutes[route.serverId][route.parentId]) {
        groupedRoutes[route.serverId][route.parentId] = [];
      }
  
      groupedRoutes[route.serverId][route.parentId].push(route);
    });
  
    return groupedRoutes;
}

export const PresetDetails = ()=>{
    const {presetFolder, preset} = useSelectedPreset();
    const {setSelectedPreset, setSelectedRoute} = useGeneralStore();
    const {serversHash, activeProjectName} = useProjectStore()
    const [isPresetRouteDialogOpen, setIsPresetRouteDialogOpen] = useState(false);
    const [isDeleteRouteDialogOpen, setIsDeleteRouteDialogOpen] = useState(false);
    const [isDeletePresetDialogOpen, setIsDeletePresetDialogOpen] = useState(false);
    const [deleteRouteId, setDeleteRouteId] = useState<string | null>(null);
    const [presetRouteData, setPresetRouteData] = useState<PresetRoute | null>(null)
    const [isPresetDialogOpen, setIsPresetDialogOpen] = useState(false);
    const [isApplyLoading, setIsApplyLoading] = useState(false)

    const data = groupPresetRoutesByServerAndParent(Object.values(preset?.routesHash || {}));
    const isAllRoutesExists = checkIsAllRoutesExists(serversHash, preset)

    useEffect(()=>{
        const onEvent = (arg: any) => {
            const {success, content, filename, serverName, projectName, hasDiffs } = arg;
            setIsApplyLoading(false)
            if(success && projectName === activeProjectName){
              //todo: handle success
            }
        }
        socket.on(EVENT_KEYS.APPLY_PRESET, onEvent);
  
        return ()=>{socket.off(EVENT_KEYS.APPLY_PRESET, onEvent)}
      },[activeProjectName]);

    const handleApplyPreset = ()=>{
        reportButtonClick(BUTTONS.PRESET_DETAILS_APPLY)
        setIsApplyLoading(true)
        emitSocketEvent(EVENT_KEYS.APPLY_PRESET, {
            preset,
            projectName: activeProjectName,
        }); 
    }

    const renderRoute = (presetRoute: PresetRoute, server: ProjectServer, parent: RouteParent, routeItem: Route | undefined, response: RouteResponse | undefined)=>{
        
        const routeParams = '{'+routeItem?.paramType + '.' +routeItem?.paramKey + ' = ' +routeItem?.paramValue+'}'
        const routeExist = !!routeItem 
        const responseExist = !!response 
        const routeTitle = routeExist && routeItem.routePath + `${routeItem.withParams ? routeParams: ''}`
        
        return (
            <div className={styles.routeBlock} key={presetRoute.routeId}>
              <Card variant="outlined" >
                <CardActionArea 
                    onClick={(e)=>{
                        reportElementClick(ELEMENTS.PRESET_DETAILS_ROUTE_ROW,{routeExist})
                        if(!routeExist){
                            return
                        }
                        setSelectedRoute({ serverName: presetRoute.serverId, routeId: presetRoute.routeId, parentId: presetRoute.parentId});
                    }}
                  >
                  <div className={styles.routeDetailsCard}>
                    {!!routeExist ? (
                    <>
                        <div className={styles.routeMethod} style={{backgroundColor: getRouteBGColor(routeItem.method)}}>
                        {routeItem.method}
                        </div>
                        <Tooltip title={routeTitle}>
                            <div className={styles.routeTitle}>
                                <div className={styles.routePath}>
                                    {routeItem.routePath} 
                                </div>
                                { !!routeItem?.withParams
                                    &&<div className={styles.params}>
                                        <div>{'{'+routeItem?.paramType + '.' +routeItem?.paramKey + ' = ' +routeItem?.paramValue+'}'}</div>
                                    </div>
                                } 
                            </div>
                        </Tooltip>
                   </>
                   )
                   : (
                        <div className={styles.roteDeletedTitle}>route deleted</div>
                   )}
                    <div className={styles.actionsWrapper}>
                        { routeExist && responseExist ? <Tooltip  title={'selected response'}>
                            <Chip variant="filled" label={response.name} />
                            </Tooltip>
                            : <Chip variant='outlined' color="error" label={'response deleted'} />
                        }
                       
                        <Tooltip title={'Edit'}>
                            <IconButton
                                    edge="start"
                                    color="inherit"
                                    onClick={(e)=>{
                                        reportButtonClick(BUTTONS.PRESET_DETAILS_EDIT_PRESET)
                                        e.stopPropagation()
                                        setPresetRouteData(presetRoute || null)
                                        setIsPresetRouteDialogOpen(true)
                                    }}
                                    aria-label="close"
                                    className='delete-res-btn'
                                >
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={'Delete'}>
                            <IconButton
                                    edge="start"
                                    color="inherit"
                                    onClick={(e)=>{
                                        reportButtonClick(BUTTONS.PRESET_DETAILS_DELETE)
                                        e.stopPropagation()
                                        setIsDeleteRouteDialogOpen(true)
                                        setDeleteRouteId(presetRoute.id)
                                    }}
                                    aria-label="close"
                                    className='delete-res-btn'
                                >
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </div>
                  </div>
                </CardActionArea>
              </Card>
            </div>
        )
    }

    const renderGraphqlRoute = (presetRoute: PresetRoute, server: ProjectServer, parent: RouteParent, routeItem: GraphQlRoute | undefined, response: GraphQlRouteResponse | undefined)=>{
        
        const routeExist = !!routeItem 
        const responseExist = !!response 
        
        return (
            <div className={styles.routeBlock} key={presetRoute.routeId}>
              <Card variant="outlined" >
                <CardActionArea 
                    onClick={(e)=>{
                        reportElementClick(ELEMENTS.PRESET_DETAILS_ROUTE_ROW,{routeExist})
                        if(!routeExist){
                            return
                        }
                        setSelectedRoute({ serverName: presetRoute.serverId, routeId: presetRoute.routeId, parentId: presetRoute.parentId});
                    }}
                  >
                  <div className={styles.routeDetailsCard}>
                    {!!routeExist ? (
                    <>
                        <div className={styles.routeMethod} style={{backgroundColor: getGraphqlRouteBGColor(routeItem.type)}}>
                            {routeItem.type}
                        </div>
                        <Tooltip title={routeItem?.name}>
                            <div className={styles.routeTitle}>
                                {routeItem.name}
                            </div>
                        </Tooltip>
                   </>
                   )
                   : (
                        <div className={styles.roteDeletedTitle}>route deleted</div>
                   )}
                    <div className={styles.actionsWrapper}>
                        { routeExist && responseExist ? <Tooltip  title={'selected response'}>
                            <Chip variant="filled" label={response.name} />
                            </Tooltip>
                            : <Chip variant='outlined' color="error" label={'response deleted'} />
                        }
                       
                        <Tooltip title={'Edit'}>
                            <IconButton
                                    edge="start"
                                    color="inherit"
                                    onClick={(e)=>{
                                        reportButtonClick(BUTTONS.PRESET_DETAILS_EDIT_PRESET)
                                        e.stopPropagation()
                                        setPresetRouteData(presetRoute || null)
                                        setIsPresetRouteDialogOpen(true)
                                    }}
                                    aria-label="close"
                                    className='delete-res-btn'
                                >
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={'Delete'}>
                            <IconButton
                                    edge="start"
                                    color="inherit"
                                    onClick={(e)=>{
                                        reportButtonClick(BUTTONS.PRESET_DETAILS_DELETE)
                                        e.stopPropagation()
                                        setIsDeleteRouteDialogOpen(true)
                                        setDeleteRouteId(presetRoute.id)
                                    }}
                                    aria-label="close"
                                    className='delete-res-btn'
                                >
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </div>
                  </div>
                </CardActionArea>
              </Card>
            </div>
        )
    }


    return (
        <>
        <div className={styles.container}>
            <div className={styles.topPage}>
                <Link
                    className="link"
                    component="button"
                    variant="caption"
                    onClick={()=>{
                        reportButtonClick(BUTTONS.PRESET_DETAILS_PRESET_FOLDER_LINK)
                        setSelectedPreset({folderId: presetFolder?.id || null, presetId: null})
                    }}
                
                    >
                        {presetFolder?.name}
                </Link>
                <Tooltip title='some routes not exists' disableHoverListener={isAllRoutesExists}>
                    <span>
                    <LoadingButton
                        loading={isApplyLoading}
                        loadingPosition="center"
                        variant="text"
                        onClick={handleApplyPreset}
                        autoFocus
                        disabled={!isAllRoutesExists}
                    >
                            apply
                    </LoadingButton>
                    </span>
                </Tooltip>
            </div>
            <div className={styles.presetDetails}>
                <div>
                    <Typography variant="h5">{preset?.name}</Typography>
                    <Typography variant='body2'>{preset?.description}</Typography>
                </div>
                
                <div>
                    <Tooltip title={'Edit'}>
                        <IconButton
                                edge="start"
                                color="inherit"
                                onClick={()=>{
                                    reportButtonClick(BUTTONS.PRESET_DETAILS_EDIT_ROUTE)
                                    setIsPresetDialogOpen(true)
                                }}
                                aria-label="close"
                                className='delete-res-btn'
                            >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={'Delete'}>
                        <IconButton
                                edge="start"
                                color="inherit"
                                onClick={()=>{
                                    reportButtonClick(BUTTONS.PRESET_DETAILS_DELETE_ROUTE)
                                    setIsDeletePresetDialogOpen(true)
                                }}
                                aria-label="close"
                                className='delete-res-btn'
                            >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </div>
            </div>
            <div className={styles.serverRoutes}>
                {
                    Object.keys(data).map((key)=>{
                        const item = data[key];
                        const server = serversHash[key]

                        return <Card variant="outlined" raised className={ styles.serverContainer}>
                            {!server ? 
                                (<div className={styles.serverTitleWrapper}>
                                    <CloudQueueIcon color="error"/>
                                    <Typography color='error' className={styles.serverTitle} variant="h6">deleted server</Typography>
                                </div>)
                            :( <div className={styles.serverTitleWrapper}>
                                    <CloudQueueIcon />
                                    <Typography className={styles.serverTitle} variant="h6">{server.name}</Typography>
                                </div>)
                            }
                            <div className={styles.serverBody}>
                                {
                                    Object.keys(item).map(_key=>{
                                        const _item = item[_key];
                                        const parent = server?.parentRoutesHash[_key]
                                        const isGraphql = parent.type === 'GraphQl';

                                        return <div className={styles.parentSection}>
                                            <Link
                                                className="link"
                                                component="button"
                                                variant="caption"
                                                color={ !parent ? 'error' : 'primary'}
                                                disabled={!parent}
                                                onClick={()=>{
                                                    reportButtonClick(BUTTONS.PRESET_DETAILS_PARENT_LINK)
                                                    setSelectedRoute({serverName: server.name, parentId: parent.id, routeId: null})
                                                }}
                                                >
                                                {isGraphql ? parent.name : parent?.path || 'deleted parent'}
                                            </Link>

                                            {_item.map((presetRoute)=>{
                                                if(isGraphql){
                                                    const route =parent?.graphQlRouteHash?.[presetRoute.routeId] 
                                                    const response = route?.responsesHash?.[presetRoute.responseId];

                                                    return renderGraphqlRoute(presetRoute, server, parent, route, response)
                                                }
                                                const route = parent?.routesHash?.[presetRoute.routeId]
                                                const response = route?.responsesHash?.[presetRoute.responseId];

                                                return renderRoute(presetRoute, server, parent, route, response)
                                            })}
                                        </div>
                                    })
                                }
                            </div>
                        </Card>
                    })
                } 
                <div className={styles.addBtnWrapper}>
                    <Button 
                        className={styles.addBtn}
                        onClick={()=>{
                            reportButtonClick(BUTTONS.PRESET_DETAILS_ADD_ROUTE)
                            setPresetRouteData(null)
                            setIsPresetRouteDialogOpen(true)
                        }}
                        variant='text'
                    >
                        Add route
                    </Button>
                </div>
            </div>
        </div>
        {isPresetRouteDialogOpen && !!presetFolder && !!preset && <PresetRouteDialog 
            open 
            onClose={()=>{
                setIsPresetRouteDialogOpen(false);
                setPresetRouteData(null)
            }}
            data={presetRouteData}
            folderId={presetFolder.id}
            presetId={preset.id}
        />}
        {
            isPresetDialogOpen && !!presetFolder?.id && <PresetDialog
              open
              data={preset || null}
              presetFolderId={presetFolder.id}
              onClose={()=>{
                setIsPresetDialogOpen(false)
              }}
            />
        }
        { isDeleteRouteDialogOpen && presetFolder && preset && deleteRouteId && <DeletePresetRouteDialog
            open
            onClose={()=>{
                setIsDeleteRouteDialogOpen(false)
                setDeleteRouteId(null)
            }}
            presetFolderId={presetFolder?.id}
            presetId={preset?.id}
            presetRouteId={deleteRouteId}
        />}
        {
            isDeletePresetDialogOpen && presetFolder && preset && <DeletePresetDialog 
                open
                onClose={()=>{
                    setIsDeletePresetDialogOpen(false)
                }}
                presetFolderId={presetFolder?.id}
                presetId={preset?.id}
            />
        }
    </>)
}