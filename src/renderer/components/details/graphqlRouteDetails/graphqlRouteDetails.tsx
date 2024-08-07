import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { GraphQlRouteResponse } from "../../../../types";
import { useGeneralStore } from "../../../state";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { emitSocketEvent, getGraphqlRouteBGColor, openInNewTab, reportButtonClick, socket } from "../../../utils";
import cloneDeep from "lodash/cloneDeep";
import { useProjectStore } from "../../../state/project";
import { useResponseActions, useRouteActions } from "../../../hooks/files";
import { useSelectedGraphQlRoute } from "../../../hooks";
import { DeleteResponseDialog, DeleteRouteDialog } from "../../dialogs";
import { EVENT_KEYS } from "../../../../types/events";
import { BUTTONS } from "../../../../consts/analytics";
import { GraphqlRouteDialog } from "../../dialogs/graphqlRouteDialog";
import { GraphqlResponseDetails } from "./graphqlResponseDetails";
import { GraphqlResponseDialog } from "../../dialogs/graphqlResponseDialog";
import { buildQueryFromSchema } from "../../../utils/graphql";
import ContentPasteIcon from '@mui/icons-material/ContentPaste';

export const GraphqlRouteDetails = ()=>{
    const { route, parent, server } = useSelectedGraphQlRoute();

    const { setSelectedRoute, host, isServerUp } = useGeneralStore();
    const { activeProjectName } = useProjectStore();
    const [isCopied, setIsCopied] = useState(false);
    const [isRouteDialogOpen, setIsRouteDialogOpen] = useState(false)
    const [isDeleteRouteDialogOpen, setIsDeleteRouteDialogOpen] = useState(false);
    const [editResponseData, setEditResponseData] = useState<GraphQlRouteResponse | null>(null);
    const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false)
    const [isDeleteResponseDialogOpen, setIsDeleteResponseDialogOpen] = useState(false);
    const {deleteRoute } = useRouteActions()
    const {deleteResponse} = useResponseActions()

    const linkUrl = host+':'+server?.settings.port + parent?.path +'/playground'//+ route?.name;
   
    const handleSetActive = (routeId: string, responseId: string)=>{
        const localParent = cloneDeep(parent)
        const localRoute = localParent?.graphQlRouteHash?.[routeId]

        if(!!localRoute && !!server){
          localRoute.activeResponseId = responseId;
  
          emitSocketEvent(EVENT_KEYS.UPDATE_ROUTES_FILE, {
            filename: localParent?.filename, 
            content: localParent,
            projectName: activeProjectName,
            serverName: server.name,
          });    
        }
    }
    
    const handleCloseResponseDialog = ()=>{
        setIsResponseDialogOpen(false)
        setEditResponseData(null)
      }

    const handleAddResponse = ()=>{
        reportButtonClick(BUTTONS.ROUTE_DETAILS_ADD_RESPONSE)
        setIsResponseDialogOpen(true)
        setEditResponseData(null)
    }

    const handleCloseRouteDialog = ()=>{
        setIsRouteDialogOpen(false)
    }

    return (
        <>
        <div className='route-details-container'>
        <Link
            className="link"
            component="button"
            variant="caption"
            onClick={() => {
                reportButtonClick(BUTTONS.ROUTE_DETAILS_PARENT_LINK)
                setSelectedRoute({serverName: server?.name || null, parentId: parent?.id || null,routeId: null})
            }}
            >
            {parent?.path}
        </Link>
        <div className="route-header">
        <div className="route-header-title">
            {!!route?.type && <div className="route-method" style={{backgroundColor: getGraphqlRouteBGColor(route.type)}}>
                {route.type}
            </div>}
            <Typography variant="h5">{route?.name}</Typography>
        </div>
        <div>
            <Tooltip title={'Edit route'}>
                <IconButton
                        edge="start"
                        color="inherit"
                        onClick={()=>{
                            reportButtonClick(BUTTONS.ROUTE_DETAILS_EDIT)
                            setIsRouteDialogOpen(true)
                        }}
                        aria-label="close"
                        className='delete-res-btn'
                >
                    <EditIcon />
                </IconButton>
            </Tooltip>
            <Tooltip title={'Delete route'}>
            <IconButton
                    edge="start"
                    color="inherit"
                    onClick={()=>{
                        reportButtonClick(BUTTONS.ROUTE_DETAILS_DELETE)

                        setIsDeleteRouteDialogOpen(true)
                    }}
                    aria-label="close"
                    className='delete-res-btn'
                >
                <DeleteIcon />
            </IconButton>
            </Tooltip>
        </div>
        </div>

        {
        isServerUp &&
        <div style={{display:'flex', alignItems:'center'}}>
        <Link
            className="link"
            style={{marginTop:'4px'}}
            component="button"
            variant="caption"
            onClick={() => {
                reportButtonClick(BUTTONS.ROUTE_DETAILS_ROUTE_LINK)
                openInNewTab(linkUrl)
             
            }}
            >
            {linkUrl}
        </Link>
        <Tooltip title={isCopied?'copied':'copy query'}>
            <IconButton
                edge="start"
                color="inherit"
                onClick={()=>{
                    setIsCopied(true)
                    setTimeout(()=>{
                        setIsCopied(false)
                    }, 2000)
                    const activeRes = route?.responsesHash?.[route.activeResponseId]
                    if(activeRes){
                        const query = buildQueryFromSchema(activeRes?.schema, activeRes?.schemaTypeName, parent?.schemaPath || '', route.name)
                        
                        navigator.clipboard.writeText(query)
                    }
                }}
                aria-label="copy"
                style={{marginLeft: '8px'}}
            >
                <ContentPasteIcon sx={{fontSize:'12px'}}/>
            </IconButton>
        </Tooltip>
        </div>
        }
        <Typography variant="subtitle2" gutterBottom>
            {route?.description}
        </Typography>
        {
        Object.values(route?.responsesHash || {}).map((response, i)=>{
            return (
            <GraphqlResponseDetails
                key={response.id}
                response={response}
                isActive={route?.activeResponseId === response.id} 
                onEdit={()=>{
                    setEditResponseData(response)
                    setIsResponseDialogOpen(true)
                }}
                onSetActive={()=>{
                    handleSetActive(route?.id || '', response.id)
                }}
                onDelete={()=>{
                    setIsDeleteResponseDialogOpen(true);
                    setEditResponseData(response)
                }}
            />
            )
        })
        }

        {!!route && <Button onClick={handleAddResponse} variant="contained">Add response</Button>}

    </div>
    {
        isRouteDialogOpen && !!parent && !!server && <GraphqlRouteDialog 
        open={isRouteDialogOpen} 
        onClose={handleCloseRouteDialog} 
        data={route || null} 
        parent={parent}
        server={server}
      />
    }
    {
          isDeleteRouteDialogOpen && !!route && !!parent && !!server && <DeleteRouteDialog
            onClose={()=>setIsDeleteRouteDialogOpen(false)}
            open={isDeleteRouteDialogOpen}
            onConfirm={()=>{
              deleteRoute(route, parent, server)
              setIsDeleteRouteDialogOpen(false);
            }}
          />
    }
    {
          isDeleteResponseDialogOpen && !!route && !!parent && !!server && !!editResponseData && <DeleteResponseDialog
            onClose={()=>setIsDeleteResponseDialogOpen(false)}
            open={isDeleteResponseDialogOpen}
            onConfirm={()=>{
              deleteResponse(server, parent, route, editResponseData)
              setIsDeleteResponseDialogOpen(false);
            }}
          />
        }
        {
        isResponseDialogOpen && !!parent && !!route && !!server && <GraphqlResponseDialog
            open={isResponseDialogOpen} 
            onClose={handleCloseResponseDialog} 
            data={editResponseData} 
            route={route}
            parent={parent}
            server={server}
          />
        }
    </>
    )
     
}