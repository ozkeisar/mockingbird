import cloneDeep from "lodash/cloneDeep";
import { useEffect, useState } from "react"
import { GraphQlRoute, GraphQlRouteResponse, ProjectServer, Route, RouteParent, RouteResponse } from "../../types";
import { EVENT_KEYS } from "../../types/events";
import { useProjectStore } from "../state/project";
import { emitSocketEvent, socket } from "../utils";

export const useRouteActions = ()=>{
    const { activeProjectName } = useProjectStore();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(()=>{
        //todo: delete logic
        const onEvent = (arg: any) => {
            setIsLoading(false)
          }
        socket.on(EVENT_KEYS.UPDATE_ROUTES_FILE, onEvent)
        return ()=>{socket.off(EVENT_KEYS.UPDATE_ROUTES_FILE,onEvent)}
    },[]);
    

    const updateRoute = (route: Route | GraphQlRoute, parent: RouteParent, server: ProjectServer)=>{
        setIsLoading(true);

        const localParent = cloneDeep(parent)

        if(parent.type === 'GraphQl' ){
            if(localParent.graphQlRouteHash){
                localParent.graphQlRouteHash[route.id] = route as GraphQlRoute
            }else{
                localParent.graphQlRouteHash = {[route.id]: route as GraphQlRoute} 
            }
        } else {
            if(localParent.routesHash){
                localParent.routesHash[route.id] = route as Route
            }else{
                localParent.routesHash = {[route.id]: route as Route}
            }
        }

        emitSocketEvent(EVENT_KEYS.UPDATE_ROUTES_FILE, {
            filename: localParent?.filename, 
            content: localParent,
            projectName: activeProjectName,
            serverName: server.name,
        });    
    }

    const deleteRoute = (route: Route | GraphQlRoute, parent: RouteParent, server: ProjectServer )=>{
        setIsLoading(true);
        const localParent = cloneDeep(parent);

        if(localParent.type !== 'GraphQl' && localParent.routesHash){
            delete localParent.routesHash[route.id]
        }

        if(localParent.type === 'GraphQl' && localParent.graphQlRouteHash){
            delete localParent.graphQlRouteHash[route.id]
        }

        emitSocketEvent(EVENT_KEYS.UPDATE_ROUTES_FILE, {
            filename: localParent?.filename, 
            content: localParent,
            projectName: activeProjectName,
            serverName: server.name,
        });    
    }

    return {
        isLoading,
        updateRoute,
        deleteRoute,
    }
}

export const useResponseActions = ()=>{
    const { activeProjectName } = useProjectStore();
    const [isLoading, setIsLoading] = useState(false);

    const updateResponse = (server: ProjectServer, parent: RouteParent, route: Route | GraphQlRoute, response: RouteResponse | GraphQlRouteResponse)=>{
        const localParent = cloneDeep(parent)
        let localRoute;
        
        if(parent.type === 'GraphQl'){
            localRoute = localParent.graphQlRouteHash?.[route.id]
        }else{
            localRoute = localParent.routesHash?.[route.id]
        }

        if(!localRoute || !localRoute.responsesHash){
            return;
        }

        localRoute.responsesHash[response.id] = response
        localRoute.activeResponseId = response.id

        setIsLoading(true)
        emitSocketEvent(EVENT_KEYS.UPDATE_ROUTES_FILE, {
            filename: localParent?.filename, 
            content: localParent,
            projectName: activeProjectName,
            serverName: server.name
        });    

    }

    const createResponse = (server: ProjectServer, parent: RouteParent, route: Route | GraphQlRoute, response: RouteResponse | GraphQlRouteResponse)=>{
        const localParent = cloneDeep(parent)

        let localRoute;
       
        if(parent.type === 'GraphQl'){
            localRoute = localParent.graphQlRouteHash?.[route.id]
        }else{
            localRoute = localParent.routesHash?.[route.id]

        }

        if(!localRoute || !localRoute.responsesHash){
            return;
        }
        localRoute.responsesHash[response.id] = response
        localRoute.activeResponseId = response.id


        setIsLoading(true)
        emitSocketEvent(EVENT_KEYS.UPDATE_ROUTES_FILE, {
            filename: localParent?.filename, 
            content: localParent,
            projectName: activeProjectName,
            serverName: server.name
        });    

    }

    const deleteResponse = (server: ProjectServer, parent: RouteParent, route: Route | GraphQlRoute, response: RouteResponse | GraphQlRouteResponse)=>{
        const localParent = cloneDeep(parent)

        let localRoute;
       
        if(parent.type === 'GraphQl'){
            localRoute = localParent.graphQlRouteHash?.[route.id]
        }else{
            localRoute = localParent.routesHash?.[route.id]
        }

        if(!localRoute || !localRoute.responsesHash){
            return;
        }

        delete localRoute.responsesHash[response.id]
        
        setIsLoading(true)

        emitSocketEvent(EVENT_KEYS.UPDATE_ROUTES_FILE, {
            filename: localParent?.filename, 
            content: localParent,
            projectName: activeProjectName,
            serverName: server.name
        });    
    }

    return {
        isLoading,
        updateResponse,
        deleteResponse,
        createResponse
    }
}