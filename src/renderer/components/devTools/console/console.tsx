import './console.css'
import { VariableSizeList } from 'react-window';
import Box from '@mui/material/Box';
import AutoSizer from "react-virtualized-auto-sizer";
import { useLoggerStore } from '../../../state/logger';
import { useCallback, useRef, useState } from 'react';
import { useWindowResize } from '../../../hooks';
import LogRow from '../../logRow/logRow';
import { GraphQlRoute, GraphQlRouteResponse, Route, RouteParent, RouteResponse } from '../../../../types';
import { useProjectStore } from '../../../state/project';
import { ParentDialog, ResponseDialog, RouteDialog } from '../../dialogs';
import { GraphqlRouteDialog } from '../../dialogs/graphqlRouteDialog';
import { GraphqlResponseDialog } from '../../dialogs/graphqlResponseDialog';
import { Typography } from '@mui/material';


type Props = {
  search?: string | null;
}

  
export const Console = ({ search }:Props)=>{
    const {serverLogs } = useLoggerStore();
    const { serversHash } = useProjectStore();

    const [parent, setParent] = useState<RouteParent | null>(null);
    const [route, setRoute] = useState<Route | null>(null);
    const [query, setQuery] = useState<GraphQlRoute | null>(null);


    const [isParentDialogOpen, setIsParentDialogOpen] = useState(false);
    const [parentData, setParentData] = useState<Partial<RouteParent> | null>(null);
    const [isRouteDialogOpen, setIsRouteDialogOpen] = useState(false);
    const [isQueryDialogOpen, setIsQueryDialogOpen] = useState(false);
    const [isQueryResponseDialogOpen, setIsQueryResponseDialogOpen] = useState(false);
    const [routeData, setRouteData] = useState<Partial<Route> | null>(null);
    const [queryData, setQueryData] = useState<Partial<GraphQlRoute> | null>(null);
    const [serverName, setServerName] = useState<string | null>(null);
    const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
    const [responseData, setResponseData] = useState<Partial<RouteResponse> | null>(null);
    const [queryResponseData, setQueryResponseData] = useState<Partial<GraphQlRouteResponse> | null>(null);

    const [openRows, setOpenRows] = useState<{[key:string]: boolean}>({});
    const server = serversHash[serverName || ''];

    const filteredServerLogs = serverLogs.filter((item)=>{
      return JSON.stringify(item).toLowerCase().includes(search || '')
    })

    const listRef = useRef<any>();
    const sizeMap = useRef<{[key: number]: number}>({});
    const setSize = useCallback((index:number, size: number) => {
        sizeMap.current = { ...sizeMap.current, [index]: size };
        listRef?.current?.resetAfterIndex(index);
    }, []);

    const [windowWidth] = useWindowResize();

    const getSize = (index: number) =>{
        return sizeMap.current[index] || 50
    };

    const handleAddParentClick= ({serverName, data }:{serverName?: string ,data: Partial<RouteParent>})=>{
      setParentData(data);
      setServerName(serverName || null);
      setIsParentDialogOpen(true)
    }
    const handleAddRouteClick= ({data, matchedParent, serverName }: {serverName: string, data: Partial<Route>, matchedParent: RouteParent})=>{
      setParent(matchedParent);
      setRouteData(data);
      setServerName(serverName);
      setIsRouteDialogOpen(true);
    }
    const handleAddQueryClick= ({data, matchedParent, serverName }: {serverName: string, data: Partial<GraphQlRoute>, matchedParent: RouteParent})=>{
      setParent(matchedParent);
      setQueryData(data);
      setServerName(serverName);
      setIsQueryDialogOpen(true);
    }

    const handleAddResponseClick= ({data, matchedParent, matchedRoute, serverName}: {serverName: string, matchedParent: RouteParent, matchedRoute: Route, data: Partial<RouteResponse>})=>{
      setResponseData(data)
      setParent(matchedParent);
      setRoute(matchedRoute);
      setIsResponseDialogOpen(true);
      setServerName(serverName);
    }

    const handleAddQueryResponseClick = ({data, matchedParent, matchedRoute, serverName}: {serverName: string, matchedParent: RouteParent, matchedRoute: GraphQlRoute, data: Partial<GraphQlRouteResponse>})=>{
      setQueryResponseData(data);
      setParent(matchedParent);
      setQuery(matchedRoute)
      setServerName(serverName);
      setIsQueryResponseDialogOpen(true)
    }

    const closeDialogs = ()=>{
      setIsParentDialogOpen(false)
      setIsRouteDialogOpen(false);
      setIsResponseDialogOpen(false)
      setParentData(null);
      setRouteData(null);
      setResponseData(null)
      setQueryData(null)
      setIsQueryDialogOpen(false)
      setParent(null)
      setRoute(null)
      setQuery(null)
    }

    return (
      <>
        <Box
            sx={{ width: '100%', height: '100%', bgcolor: 'background.paper' }}
        >
            { serverLogs.length > 0 && <AutoSizer style={{width: '100%', height: '100%'}}>
                {({ height, width }: any) => {
                    return <VariableSizeList
                        ref={listRef}
                        height={height}
                        width={width}
                        itemCount={filteredServerLogs.length}
                        overscanCount={3}
                        itemSize={getSize}
                        itemData={filteredServerLogs}
                    >
                        {({ data, index, style }) => (
                            <div style={style}>
                                <LogRow
                                    data={data}
                                    index={index}
                                    setSize={setSize}
                                    windowWidth={windowWidth}
                                    onAddResponseClick={handleAddResponseClick}
                                    onAddRouteClick={handleAddRouteClick}
                                    onAddParentClick={handleAddParentClick}
                                    onAddQueryClick={handleAddQueryClick}
                                    onAddQueryResponseClick={handleAddQueryResponseClick}
                                    openRows={openRows}
                                    onRowClick={(id)=>{
                                      setOpenRows((prev)=>{
                                        prev[id] = !prev[id]
                                        return prev
                                      })
                                    }}
                                />
                            </div>
                        )}
                    </VariableSizeList>
                }}
            </AutoSizer>}
            {serverLogs.length === 0 && <div style={{width:'100%', height: '100%', display:'flex', alignItems:'center', justifyContent:'center'}}>
              <Typography variant='body2'>
                No api call has been made yet.
              </Typography>
            </div>}
        </Box>
      {isParentDialogOpen && <ParentDialog 
        onClose={closeDialogs} 
        open
        data={parentData}
        defaultServerName={server?.name}
      />}
      {isRouteDialogOpen && !!parent && !!server && <RouteDialog 
        onClose={closeDialogs} 
        open
        data={routeData}
        parent={parent}
        server={server}
      />}
      {isResponseDialogOpen && !!route && !!parent && !!server && <ResponseDialog 
        onClose={closeDialogs} 
        open
        data={responseData}
        parent={parent}
        route={route}
        server={server}
      />}
      {
          isQueryDialogOpen && !!parent && !!server && <GraphqlRouteDialog 
            open
            onClose={closeDialogs} 
            data={queryData} 
            parent={parent}
            server={server}
          />
        }
         {isQueryResponseDialogOpen && !!parent && !!query && !!server && <GraphqlResponseDialog
            open
            onClose={closeDialogs} 
            data={queryResponseData} 
            route={query}
            parent={parent}
            server={server}
          />
        }
      </>
    )
  }
  