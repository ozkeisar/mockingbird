import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import EditIcon from '@mui/icons-material/Edit';
import Button from "@mui/material/Button";
import CardActionArea from "@mui/material/CardActionArea";
import Card from "@mui/material/Card";
import DeleteIcon from '@mui/icons-material/Delete';
import { useSelectedRoute } from "../../../hooks";
import { useGeneralStore } from "../../../state";
import { useRef, useState } from "react";
import { getGraphqlRouteBGColor, getRouteBGColor, reportButtonClick, reportElementClick } from "../../../utils";
import { GraphQlRouteHash, RouteParent } from "../../../../types";
import { DeleteParentDialog, ParentDialog, RouteDialog } from "../../dialogs";
import { BUTTONS, ELEMENTS } from "../../../../consts/analytics";
import { GraphqlRouteDialog } from "../../dialogs/graphqlRouteDialog";
import { CopyBlock, dracula } from 'react-code-blocks';

const createPath = (schemaPath: string, routes: GraphQlRouteHash) => {
  const names = schemaPath?.split('.') || []

  const routeNames = Object.values(routes || {}).map((route)=>{
    return '   '.repeat(names.length) + route.name + '';
  })


  const data = names.reduce((acc,name,i)=>{
    acc.above += '   '.repeat(i) + name +' {\n'
    acc.below = '\n' +  '   '.repeat(i) + '}' + acc.below
    return acc

  }, {above:"",below:""})

   if(!schemaPath){
    return "{\n //queries \n}"
  }

  return data.above + routeNames.join('\n') + data.below
}


export const ParentDetails = ()=>{
  const { route, parent, server } = useSelectedRoute();
  const { setSelectedRoute, selectedParentId } = useGeneralStore();
  const isGraphql = parent?.type === 'GraphQl'

  const [editParentData, setEditParentData] = useState<RouteParent | null>(null);
  const [defaultServerName, setDefaultServerName] = useState<string | null>(null);
  const [isParentDialogOpen, setIsParentDialogOpen] = useState(false)
  
  const [isRouteDialogOpen, setIsRouteDialogOpen] = useState(false)
  const [isDeleteParentDialogOpen, setIsDeleteParentDialogOpen] = useState(false);

  const handleCloseRouteDialog = ()=>{
    setIsRouteDialogOpen(false)
  }

  const handleAddEditParent = ({data, serverName}:{data?: RouteParent, serverName?: string})=>{
    setEditParentData(data || null);
    setDefaultServerName(serverName || null);
    setIsParentDialogOpen(true)
  }

  const handleClose = ()=>{
    setEditParentData(null);
    setDefaultServerName(null);
    setIsParentDialogOpen(false);
  }

  const handleAddRouteClick = ()=>{
    reportButtonClick(BUTTONS.PARENT_DETAILS_ADD_ROUTE)
    setIsRouteDialogOpen(true)
  }

  const renderGraphqlRoutes = ()=>{
    return Object.values(parent?.graphQlRouteHash || {})?.map((routeItem,index)=>{
        return (
          <div className="route-block" key={routeItem.id }>
            <Card variant="outlined" >
              <CardActionArea 
                onClick={()=>{
                  reportElementClick(ELEMENTS.PARENT_DETAILS_ROUTE_ROW, {index})

                  setSelectedRoute({ serverName: server?.name || null, routeId: routeItem.id, parentId: selectedParentId});
                }}>
                <div className={'route-details-card'}>
                  <div className="route-method" style={{backgroundColor: getGraphqlRouteBGColor(routeItem.type)}}>
                    {routeItem.type}
                  </div>
                  <div className="route-path">
                    {routeItem.name}
                  </div>
                 
                  <div>{routeItem.description}</div>
                </div>
              </CardActionArea>
            </Card>
          </div>
        )
      })
    
  }

  const renderRestRoutes = ()=>{
    return Object.values(parent?.routesHash || {})?.map((routeItem,index)=>{
      return (
        <div className="route-block" key={routeItem.id }>
          <Card variant="outlined" >
            <CardActionArea 
              onClick={()=>{
                reportElementClick(ELEMENTS.PARENT_DETAILS_ROUTE_ROW, {index})

                setSelectedRoute({ serverName: server?.name || null, routeId: routeItem.id, parentId: selectedParentId});
              }}>
              <div className={'route-details-card'}>
                <div className="route-method" style={{backgroundColor: getRouteBGColor(routeItem.method)}}>
                  {routeItem.method}
                </div>
                <div className="route-path">
                  {routeItem.routePath} 
                </div>
                { !!routeItem?.withParams
                  && <div className="params">
                    <div>{'{'+routeItem?.paramType + '.' +routeItem?.paramKey + ' = ' +routeItem?.paramValue+'}'}</div>
                  </div>
                } 
                <div>{routeItem.description}</div>
              </div>
            </CardActionArea>
          </Card>
        </div>
      )
    })
  }


  const schemaPath = createPath(parent?.graphqlQueriesType + '.' +parent?.schemaPath || "", parent?.graphQlRouteHash || {})
  return (
    <>
      <div className="routes-container">
        <div className="route-header">
          <div>
            {isGraphql && <Typography variant="caption">{parent?.path}</Typography>}
            <Typography variant="h5" gutterBottom>{isGraphql ? parent.name : parent?.path}</Typography>
          </div>
          <div>
          <Tooltip title={'Edit parent'}>
            <IconButton
                  edge="start"
                  color="inherit"
                  onClick={()=>{
                    reportButtonClick(BUTTONS.PARENT_DETAILS_EDIT)
                    if(!!parent){
                        handleAddEditParent({data: parent});
                    }
                  }}
                  aria-label="close"
                  className='delete-res-btn'
              >
                <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={'Delete parent'}>
            <IconButton
                  edge="start"
                  color="inherit"
                  onClick={()=>{
                    reportButtonClick(BUTTONS.PARENT_DETAILS_DELETE)

                    setIsDeleteParentDialogOpen(true)
                  }}
                  aria-label="close"
                  className='delete-res-btn'
              >
                <DeleteIcon />
            </IconButton>
          </Tooltip>
          </div>
        </div>

        {isGraphql && (parent?.schemaPath?.length || 0) > 0 && <CopyBlock
          text={schemaPath}
          language={'graphql'}
          showLineNumbers={true}
          codeBlock
          theme={dracula}
            
        /> }

       {parent?.type === 'GraphQl' ? renderGraphqlRoutes() : renderRestRoutes()}

       <Button className="add-route" onClick={handleAddRouteClick} variant="contained">Add {isGraphql ? parent.graphqlQueriesType : 'Route'}</Button>
      </div>
        {
          isDeleteParentDialogOpen && !!parent && !!server &&  <DeleteParentDialog
            onClose={()=>setIsDeleteParentDialogOpen(false)}
            open={isDeleteParentDialogOpen}
            parent={parent}
            server={server}
          />
        }
        {
          isRouteDialogOpen && !!parent && !!server && !isGraphql && <RouteDialog 
            open={isRouteDialogOpen} 
            onClose={handleCloseRouteDialog} 
            data={null} 
            parent={parent}
            server={server}
          />
        }
        {
          isParentDialogOpen && 
            <ParentDialog 
              open
              onClose={handleClose}
              data={editParentData}
              defaultServerName={defaultServerName || undefined}
            />
        }
        {
          isRouteDialogOpen && !!parent && !!server && isGraphql && <GraphqlRouteDialog 
            open={isRouteDialogOpen} 
            onClose={handleCloseRouteDialog} 
            data={null} 
            parent={parent}
            server={server}
          />
        }
    </>

    )
  }