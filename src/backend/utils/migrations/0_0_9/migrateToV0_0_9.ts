import fs from 'fs';
import { readdirSync } from 'fs';
import path from 'path';
import serialize from 'serialize-javascript';
import { replaceUndefined } from '../../utils';
import {ParentHash_migrationV0_0_9, ProjectServerOld_migrationV0_0_9, ProjectSettings_migrationV0_0_9, RouteHash_migrationV0_0_9, RouteParentOld_migrationV0_0_9, RouteResponse_migrationV0_0_9, ServerHash_migrationV0_0_9, ServerSettings_migrationV0_0_9 } from './utils'

const SUPPORTED_PROJECT_DATA_VERSION = '0.0.9'

const DEFAULT_SERVER_SETTINGS: ServerSettings_migrationV0_0_9 = Object.freeze({
    proxyBaseUrl:  null,
    forceProxy: false,
    delay: 0,
    port: 3001
})

const DEFAULT_PROJECT_SETTINGS: ProjectSettings_migrationV0_0_9 = Object.freeze({
    forceProxy: false,
    dataVersion: SUPPORTED_PROJECT_DATA_VERSION
})

const mainFolderPath = require('os').homedir() + '/.stub-on-prem/';
const projectsPath = mainFolderPath + 'repos/';
const appSettingsFolder = mainFolderPath + 'settings/';


const getProjectSettingsPath = (projectName: string)=>{
    const projectPath = getProjectPath(projectName);

    const projectSettingsPath = projectPath + '/' + 'settings/';

    if (!fs.existsSync(projectSettingsPath)){
        fs.mkdirSync(projectSettingsPath);
    }

    return projectSettingsPath;
}
  

const verifyProjectFoldersExist =()=>{
    if (!fs.existsSync(mainFolderPath)){
      fs.mkdirSync(mainFolderPath);
    }
    if (!fs.existsSync(projectsPath)){
      fs.mkdirSync(projectsPath);
    }
    if (!fs.existsSync(appSettingsFolder)){
      fs.mkdirSync(appSettingsFolder);
    }
}

const getProjectPath = (projectName: string)=>{
    const projectPath = projectsPath + projectName + '/';

    if (!fs.existsSync(projectsPath)){
        fs.mkdirSync(projectsPath);
    }

    if (!fs.existsSync(projectPath)){
        fs.mkdirSync(projectPath);
    }

    return projectPath
}
  
  
const verifyProjectFolderExist = (repoFolderName: string)=>{
    getProjectPath(repoFolderName);
    getServersFolderPath(repoFolderName);
    getProjectSettingsPath(repoFolderName);

    verifyProjectFoldersExist();
}

const verifyServerFoldersExist = (projectName: string, serverName: string)=>{
    getServerDataPath(projectName, serverName)
    getServerSettingsPath(projectName, serverName);
    getServerPath(projectName, serverName);
    
    verifyProjectFolderExist(projectName);
}

const getProjectServersNameList = async (projectName: string)=>{
    const path = getServersFolderPath(projectName);
  
    return readdirSync(path, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
}
  


const getServersFolderPath = (projectName: string)=>{
    const projectPath = getProjectPath(projectName);
    
    const serversFolderPath = projectPath + 'servers/';
  
    if (!fs.existsSync(serversFolderPath)){
      fs.mkdirSync(serversFolderPath);
    }
  
    return serversFolderPath;
}
  
const getServerPath = (projectName: string, serverName: string)=>{
    const serversFolderPath = getServersFolderPath(projectName);
  
    const serverPath = serversFolderPath + serverName + '/';
  
    if (!fs.existsSync(serverPath)){
      fs.mkdirSync(serverPath);
    }
    
    return serverPath
}
  
const getServerDataPath = (projectName: string, serverName: string)=>{
    const serverPath = getServerPath(projectName, serverName);
  
    const serverDataPath = serverPath + 'data/';
  
    if (!fs.existsSync(serverDataPath)){
      fs.mkdirSync(serverDataPath);
    }
  
    return serverDataPath
}

const getServerSettingsPath = (projectName: string, serverName: string)=>{
    const serverPath = getServerPath(projectName, serverName);
  
    const serverSettingsPath = serverPath + 'settings/';
  
    if (!fs.existsSync(serverSettingsPath)){
      fs.mkdirSync(serverSettingsPath);
    }
  
    return serverSettingsPath;
}

const readServerSettings = async (projectName:string, serverName: string):Promise<ServerSettings_migrationV0_0_9>=>{
    try {
      const serverSettingsPath = getServerSettingsPath(projectName, serverName)
  
      if (fs.existsSync(serverSettingsPath)) {
          
        var settings = JSON.parse(await fs.readFileSync(serverSettingsPath + 'settings.json', 'utf8'));
  
        return {...DEFAULT_SERVER_SETTINGS, ...settings};
      }
      return DEFAULT_SERVER_SETTINGS;
    } catch (error) {
        return DEFAULT_SERVER_SETTINGS
    }
}

export const readProjectSettings = async (projectName: string): Promise<ProjectSettings_migrationV0_0_9>=>{
    const projectSettingsPath = getProjectSettingsPath(projectName);
    
    if (!fs.existsSync(projectSettingsPath)){
      fs.mkdirSync(projectSettingsPath);
    }
  
    try {
      const settings = JSON.parse(await fs.readFileSync(projectSettingsPath + 'settings.json', 'utf8'));
  
      return Object.freeze({...DEFAULT_PROJECT_SETTINGS, ...settings});
    } catch (error) {
      return DEFAULT_PROJECT_SETTINGS
    }
  }

export const updateProjectSettings = (projectName: string, settings: ProjectSettings_migrationV0_0_9)=>{
    const projectSettingsPath = getProjectSettingsPath(projectName);

    if (!fs.existsSync(projectSettingsPath)){
        fs.mkdirSync(projectSettingsPath);
    }

    fs.writeFileSync(projectSettingsPath + 'settings.json', JSON.stringify(replaceUndefined(settings)), 'utf8')
}
  
export const updateProjectSupportedDataVersion = async(projectName: string)=>{
    const projectSettings = await readProjectSettings(projectName);
  
    await updateProjectSettings(projectName, {
        ...projectSettings,
        dataVersion: SUPPORTED_PROJECT_DATA_VERSION
    })
  }

const readServerData = async (projectName: string, serverName: string): Promise<{data: RouteParentOld_migrationV0_0_9[]}>=>{
    const dataFolderPath = getServerDataPath(projectName, serverName)

    const filenames = await fs.readdirSync(dataFolderPath).filter(filename=>filename.endsWith('.json'))
    
    const data = await Promise.all(filenames.map(async (filename)=>{
        const modulePath = path.resolve(dataFolderPath, filename);

        var obj = JSON.parse(await fs.readFileSync(modulePath, 'utf8'));

        return obj
    }));

    return  {data}
}


function convertToServerHash(server: ProjectServerOld_migrationV0_0_9): ServerHash_migrationV0_0_9 {
    const newParentRoutesHash: { [key: string]: ParentHash_migrationV0_0_9 } = {};

    server.parentRoutes.forEach((parentRoute) => {
        const routesHash: { [key: string]: RouteHash_migrationV0_0_9 } = {};

        parentRoute.routes?.forEach((route) => {
            const responsesHash: { [key: string]: RouteResponse_migrationV0_0_9 } = {};

            route.responses.forEach((response) => {
                responsesHash[response.id] = response;
            });

            const activeResponse = route.responses[route.activeResponseIndex];
            
            const routeHash: RouteHash_migrationV0_0_9 = {
                id: route.id || '',
                description: route.description || '',
                routePath: route.routePath || '',
                method: route.method || 'post',
                activeResponseId: activeResponse.id || '',
                responsesHash: responsesHash || {},
                paramType: route.paramType || 'body',
                paramValue: route.paramValue || '',
                paramKey: route.paramKey || '',
                withParams: !!route?.paramType && !!route?.paramKey && !!route?.paramValue
            };

            routesHash[route.id] = routeHash;
        });

        const parentHash: ParentHash_migrationV0_0_9 = {
            id: parentRoute.id,
            filename: parentRoute.filename,
            routesHash: routesHash,
            path: parentRoute.path,
        };

        newParentRoutesHash[parentRoute.id] = parentHash;
    });

    return {
        name: server.name,
        parentRoutesHash: newParentRoutesHash,
        settings: server.settings,
    };
}


const updateFiles = async ({parent, projectName, serverName}:{parent: ParentHash_migrationV0_0_9, projectName:string, serverName:string}) => {

    const serverDataPath = getServerDataPath(projectName, serverName);

    const fileData = serialize(replaceUndefined(parent),{
        space: 2,
        unsafe: true,
    });

    fs.writeFileSync(serverDataPath+parent.filename+'.json', fileData, 'utf8')

}

export const migrationV0_0_9 = async (projectName: string)=>{
    const projectServersNameList = await getProjectServersNameList(projectName);

    const servers: ProjectServerOld_migrationV0_0_9[] = await Promise.all(projectServersNameList.map(async (serverName: string)=>{
        await verifyServerFoldersExist(projectName, serverName);

        const { data } = await readServerData(projectName, serverName);
        const serverSettings = await readServerSettings(projectName, serverName);

        return {
            parentRoutes: data,
            name: serverName,
            settings: serverSettings
        }
    }))

    const newServers = await Promise.all(servers.map(async(server)=>{
        const newServer = convertToServerHash(server);


        await Promise.all(Object.keys(newServer.parentRoutesHash).map(async (key)=>{
            const parent = newServer.parentRoutesHash[key]
            return updateFiles({parent, serverName: newServer.name, projectName})
        }))
        // save server data
        return newServer
    }))

    await updateProjectSupportedDataVersion(projectName)

}

