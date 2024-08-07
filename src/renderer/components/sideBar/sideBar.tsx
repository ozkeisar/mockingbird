import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { useGeneralStore } from '../../state';
import './sideBar.css';
import { getRouteBGColor, reportButtonClick, reportElementClick } from '../../utils';
import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import { Method, PresetsFolderHash, RouteHash, RouteParent, RouteParentHash, ServersHash } from '../../../types';
import FormControl from '@mui/material/FormControl';
import ClearIcon from '@mui/icons-material/Clear';
import { FilledInput, InputAdornment, InputLabel, Tooltip } from '@mui/material';
import { useProjectStore } from '../../state/project';
import { TreeItem2 } from '@mui/x-tree-view/TreeItem2';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import { PresetFolderDialog } from '../dialogs';
import { PresetDialog } from '../dialogs';
import { ServerDialog } from '../dialogs';
import { BUTTONS, ELEMENTS } from '../../../consts/analytics';
import { GraphqlRouteLabel } from '../graphqlRouteLabel';
import { MainSideBarTabs } from '../../../types/general';


const CustomLabel = ({label, Icon}: {label: string, Icon?: any})=>{
  return <div className='CustomLabel-row'>
    {!!Icon && <Icon fontSize={'small'}/>}
    <div className='CustomLabel-item' style={{marginLeft: '5px'}}>{label}</div>
  </div>
}

const RestRouteLabel = ({label, method}:{label: string, method: Method})=>{
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



// FilterServersHash function
function filterServersHash(serversHash: ServersHash, searchString: string): ServersHash {
  const filteredServersHash: ServersHash = {};
  const lowerCaseSearchString = searchString.toLowerCase();

  for (const serverKey in serversHash) {
    if (serversHash.hasOwnProperty(serverKey)) {
      const server = serversHash[serverKey];
      const filteredRouteParentHash: RouteParentHash = {};

      for (const routeParentKey in server.parentRoutesHash) {
        if (server.parentRoutesHash.hasOwnProperty(routeParentKey)) {
          const routeParent = server.parentRoutesHash[routeParentKey];
          const filteredRouteHash: RouteHash = {};

          for (const routeKey in routeParent.routesHash) {
            if (routeParent.routesHash.hasOwnProperty(routeKey)) {
              const route = routeParent.routesHash[routeKey];
              if (Object.values(routeParent).some(value => typeof value === 'string' && value.toLowerCase().includes(lowerCaseSearchString)) ||
                  Object.values(route).some(value => typeof value === 'string' && value.toLowerCase().includes(lowerCaseSearchString))) {
                filteredRouteHash[routeKey] = route;
              }
            }
          }

          if (Object.keys(filteredRouteHash).length > 0) {
            filteredRouteParentHash[routeParentKey] = {
              ...routeParent,
              routesHash: filteredRouteHash
            };
          }
        }
      }

      if (Object.keys(filteredRouteParentHash).length > 0) {
        filteredServersHash[serverKey] = {
          ...server,
          parentRoutesHash: filteredRouteParentHash
        };
      }
    }
  }

  return filteredServersHash;
}


export const SideBar = ({onAddParent, selectedTab }: {onAddParent:(data: {serverName: string,  data: RouteParent | null})=>void, selectedTab: MainSideBarTabs | null}) =>{
  const { setSelectedRoute, setSelectedPreset } = useGeneralStore();
  const {
    serversHash,
    presetFoldersHash
  } = useProjectStore();
  const [search, setSearch] = useState<string>('')
  const [isServerDialogOpen, setIsServerDialogOpen] = useState(false)
  const [isPresetFolderDialogOpen, setIsPresetFolderDialogOpen] = useState(false)
  const [isPresetDialogOpen, setIsPresetDialogOpen] = useState(false)
  const [presetFolderId, setPresetFolderId] = useState<string | null>(null)
  

  const renderRoutes = (serversHash: ServersHash, isSearch: boolean)=>{
   
    return (
        <SimpleTreeView
          defaultExpandedItems={Object.values(serversHash).map((server)=>JSON.stringify({serverName: server.name}))}
          onSelectedItemsChange={(e, nodeId)=>{
            const {parentId, routeId, serverName} = JSON.parse(nodeId || '{}') as {serverName: string, parentId: string | null, routeId: string| null};
            
            if(serverName === 'createServer'){
              reportElementClick(ELEMENTS.SIDE_BAR_ROUTES_TREE_CREATE_SERVER_ROW)
              setIsServerDialogOpen(true)
              return
            }

            if(parentId === 'createParent'){
              reportElementClick(ELEMENTS.SIDE_BAR_ROUTES_TREE_CREATE_PARENT_ROW)

              onAddParent({serverName, data: null})
              return
            }
            if(serverName && parentId && routeId){
              reportElementClick(ELEMENTS.SIDE_BAR_ROUTES_TREE_ROUTE_ROW)

            }else if(serverName && parentId && !routeId){
              reportElementClick(ELEMENTS.SIDE_BAR_ROUTES_TREE_PARENT_ROW)
              
            }else if(serverName && !parentId && !routeId){
              reportElementClick(ELEMENTS.SIDE_BAR_ROUTES_TREE_SERVER_ROW)

            }
            setSelectedRoute({serverName, parentId, routeId});
          }}
          aria-label="file system navigator"
          sx={{  flexGrow: 1, maxWidth: '100%', overflowY: 'auto' }}
        >
        {
          Object.keys(serversHash).map((serverKey)=>{
            const server = serversHash[serverKey]
            const serverId = JSON.stringify({serverName: server.name})

            return <TreeItem2 itemId={serverId} label={<CustomLabel label={server.name} Icon={CloudQueueIcon} />}>
              {
                Object.keys(server.parentRoutesHash).map((parentKey)=>{

                  const parent = server.parentRoutesHash[parentKey]
                  const parentId = JSON.stringify({serverName: server.name, parentId: parent.id})

                  
                  if(parent.type === 'GraphQl'){
                    return <TreeItem2 itemId={parentId} label={<CustomLabel label={parent.name || ''}/>} >
                      {Object.values(parent.graphQlRouteHash || {})?.map((route)=>{
                          const routeId = JSON.stringify({serverName: server.name, parentId: parent.id, routeId: route.id})
                          return <TreeItem itemId={routeId} label={<GraphqlRouteLabel label={route.name} type={route.type}/>} />
                      })}
                    </TreeItem2>
                  }
                  return <TreeItem2 itemId={parentId} label={<CustomLabel label={parent.path}/>} >
                    {Object.values(parent.routesHash || {})?.map((route)=>{
                        const routeId = JSON.stringify({serverName: server.name, parentId: parent.id, routeId: route.id})

                        return <TreeItem itemId={routeId} label={<RestRouteLabel label={route.routePath} method={route.method}/>} />
                    })}
                  </TreeItem2>
                })
              }
              {!isSearch && <TreeItem itemId={JSON.stringify({serverName: server.name, parentId: 'createParent'}) } label={<CustomLabel label={'New Parent'} Icon={CreateNewFolderOutlinedIcon} /> } />}
            </TreeItem2>
          })
        }
       {!isSearch && <TreeItem2 itemId={JSON.stringify({serverName: 'createServer'}) } label={<CustomLabel label={'new server'} Icon={AddOutlinedIcon} /> } />}
      </SimpleTreeView>
     
    )
  }

  const renderRoutesTab = ()=>{
    return (
      <div className='parent-tree-view-container'>
        {renderRoutes(serversHash, false)}
      </div>
    )
  }

  const renderSearch = ()=>{
    if (!serversHash){
      return <></>;
    }

    const filteredServersHash = filterServersHash(serversHash, search)

    return (
      
      <div className='parent-tree-view-container'>
        <FormControl sx={{ width: '100%' }} variant="filled">
          <FilledInput
            id="filled-adornment-password"
            type={'text'}
            value={search}
            onChange={(e)=>{
              setSearch(e.target.value)
            }}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={()=>{
                    reportButtonClick(BUTTONS.SIDE_BAR_SEARCH_CLEAR)
                    setSearch('')
                  }}
                  edge="end"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            }
          />
          <InputLabel htmlFor="filled-adornment-password">Search</InputLabel>
        </FormControl>
        {renderRoutes(filteredServersHash, true)}
      </div>
    )
  }

  const renderPresets = (data: PresetsFolderHash, isSearch: boolean)=>{
    const _data = Object.values(data);

    return (
      <SimpleTreeView
        defaultExpandedItems={_data.map((folder)=>JSON.stringify({folderId: folder.id}))}
        onSelectedItemsChange={(e, nodeId)=>{
          const {presetId, folderId} = JSON.parse(nodeId || '{}') as {folderId: string, presetId: string | null};
          
          if(folderId === 'createPresetsFolder'){
            setIsPresetFolderDialogOpen(true)
            return
          }

          if(presetId === 'createPreset'){
            setPresetFolderId(folderId)
            setIsPresetDialogOpen(true)
            return
          }
          setSelectedPreset({presetId, folderId})
        }}
        aria-label="file system navigator"
        sx={{  flexGrow: 1, maxWidth: '100%', overflowY: 'auto' }}
      >
      {
        _data.map((folder)=>{
          const folderId = JSON.stringify({folderId: folder.id})

          return <TreeItem2 itemId={folderId} label={<CustomLabel label={folder.name} Icon={FolderOutlinedIcon} />}>
            {
              Object.values(folder?.presetsHash || {}).map((preset)=>{
                const presetId = JSON.stringify({folderId: folder.id, presetId: preset.id})

                return <TreeItem2 itemId={presetId} label={<CustomLabel label={preset.name}/>} />
              })
            }
            {!isSearch && <TreeItem itemId={JSON.stringify({folderId: folder.id, presetId: 'createPreset'}) } label={<CustomLabel label={'New preset'} Icon={AddOutlinedIcon} /> } />}
          </TreeItem2>
        })
      }
     {!isSearch && <TreeItem2 itemId={JSON.stringify({folderId: 'createPresetsFolder'}) } label={<CustomLabel label={'New folder'} Icon={CreateNewFolderOutlinedIcon} /> } />}
    </SimpleTreeView>
    )
  }

  const renderPresetsTab = ()=>{
    return (
      <div className='parent-tree-view-container'>
        {renderPresets(presetFoldersHash, false)}
      </div>
    )
  }

  return (
      <>
        <div className='side-bar-container'>
          
          {!!selectedTab 
          && <div className='detailed-side-bar'>
            {selectedTab === 'routes' && renderRoutesTab()}
            {selectedTab === 'search' && renderSearch()}
            {selectedTab === 'presets' && renderPresetsTab()}
          </div>}
        </div>
        {isPresetFolderDialogOpen && <PresetFolderDialog 
          open
          data={null}
          onClose={()=>{
            setIsPresetFolderDialogOpen(false)
          }}
        />}
        {
          isPresetDialogOpen && !!presetFolderId && <PresetDialog
            open
            data={null}
            presetFolderId={presetFolderId}
            onClose={()=>{
              setIsPresetDialogOpen(false)
            }}
          />
        }
        {isServerDialogOpen && <ServerDialog open={isServerDialogOpen} onClose={()=>{setIsServerDialogOpen(false)}}/>}
      </>
    );
}
  
  