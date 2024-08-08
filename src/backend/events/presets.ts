import { Socket } from "socket.io";
import { replaceUndefined } from "../../backend/utils";
import { deletePresetFolder, getPresetsPath, getProjectServers, updateProjectSupportedDataVersion, updateServerData } from "../../backend/utils";
import serialize from 'serialize-javascript';
import { hasUncommittedChanges } from "../utils/git";
import fs from 'fs';
import { EVENT_KEYS } from "../../types/events";
import { listToHashmap } from "../utils/utils";
import { Preset } from "../../types";
import { updateClientProjectData } from "../utils/events";

export const presetsEvents = (socket: Socket)=>{
    socket.on(EVENT_KEYS.UPDATE_PRESET_FILE, async (arg) => {
        try {
            const {presetFolder, projectName } = arg;
            const presetsPath = await getPresetsPath(projectName);
    
            await updateProjectSupportedDataVersion(projectName)
    
            const fileData = serialize(replaceUndefined(presetFolder),{
                space: 2,
                unsafe: true,
            });
    
            fs.writeFileSync(presetsPath + presetFolder.filename + '.json', fileData, 'utf8')
    
            const hasDiffs = await hasUncommittedChanges(projectName)
    
            socket.emit(EVENT_KEYS.UPDATE_PRESET_FILE, {success: true, presetFolder, projectName, hasDiffs});
    
        } catch (error) {
            socket.emit(EVENT_KEYS.UPDATE_PRESET_FILE, {success: false});
        }
    });

    socket.on(EVENT_KEYS.DELETE_PRESET_FOLDER, async (arg) => {
        try {
            const {filename, folderId, projectName } = arg;
    
            await deletePresetFolder(projectName, filename);
    
            const hasDiffs = await hasUncommittedChanges(projectName)
          
            socket.emit(EVENT_KEYS.DELETE_PRESET_FOLDER, {success: true, projectName, filename, folderId, hasDiffs });
    
        } catch (error) {
            socket.emit(EVENT_KEYS.DELETE_PRESET_FOLDER, {success: false});
        }
    });

    socket.on(EVENT_KEYS.APPLY_PRESET, async (arg) => {
        try {
            const { projectName, preset } = arg as {projectName: string, preset: Preset};

            const servers = await getProjectServers(projectName);

            const serversHash = listToHashmap(servers, (server)=> server.name);

            Object.values(preset?.routesHash || {}).map((presetRoute)=>{
                const {serverId, parentId, routeId, responseId} = presetRoute;
                const parent = serversHash[serverId].parentRoutesHash[parentId];

                if(parent.type === 'GraphQl' && !!parent.graphQlRouteHash?.[routeId]){
                    parent.graphQlRouteHash[routeId].activeResponseId = responseId
                }else if(!!parent.routesHash?.[routeId]){
                    parent.routesHash[routeId].activeResponseId = responseId
                }
            });

            await Promise.all(Object.values(serversHash).map((server)=>{
                return updateServerData(projectName, server)
            }))

            await updateClientProjectData(projectName)

            socket.emit(EVENT_KEYS.APPLY_PRESET, {success: true, projectName });

        } catch (error) {
            socket.emit(EVENT_KEYS.APPLY_PRESET, {success: false});
        }
    });


}