import { Socket } from "socket.io";
import { checkIServerUp, closeProjectServers } from "../../server";
import { activateProgram, addCredentialsToGitURI, createExampleProject, createProjectPath, getActiveProjectName, getProjectPath, getProjectsNameList, isDirectoryEmpty, readAppSettings, updateAppSettings, verifyProjectFoldersExist } from "./../utils";
import { generateUniqueIdentifier } from "../utils/utils";
import { EVENT_KEYS } from "../../types/events";
import { updateClientProjectData } from "../utils/events";
import { v4 as uuid } from 'uuid';
import { execSync } from 'child_process';
import path from 'path';


export const generalEvents = (socket: Socket)=>{
    socket.on(EVENT_KEYS.INIT, async ()=>{
        try {
            await verifyProjectFoldersExist();
            const projectName = await getActiveProjectName();
        
            let appSettings = await readAppSettings();
        
            const projectsNameList = await getProjectsNameList();
        
            if(!appSettings.userId){
        
              const userId = generateUniqueIdentifier()
        
              await updateAppSettings({...appSettings, userId})
              appSettings = await readAppSettings();
        
            }
        
            const isServerUp = checkIServerUp();
        
            socket.emit(EVENT_KEYS.INIT, {
              success: true,
              projectName,
              projectsNameList,
              appSettings,
              isServerUp
            });
        
            if(projectName && projectName.length > 0){
              await updateClientProjectData(projectName);
            }
        
        
          } catch (error) {
            console.log('init error',error)
            socket.emit(EVENT_KEYS.INIT, {success: false, error});
          }
    });

    socket.on(EVENT_KEYS.CREATE_PROJECT, async (arg) => {
        try {
            const {sshUrl, httpsUrl, cloneType, username, password, projectName, directoryPath} = arg;
            await verifyProjectFoldersExist();
           
            const projectPath = cloneType === 'OPEN' ? directoryPath : createProjectPath(projectName);
        
            const appSettings = await readAppSettings();
            const newProject = {
              id: uuid(),
              name: projectName,
              directoryPath: projectPath,
            }
            await updateAppSettings({...appSettings, projects:[...(appSettings.projects || []), newProject]})
          
        
            if(cloneType === 'SSH'){
              await execSync('git clone ' + sshUrl + ' ' + projectPath, {
                stdio: [0, 1, 2], // we need this so node will print the command output
                cwd: path.resolve('', ''), // path to where you want to save the file
              })
            } else if(cloneType === 'HTTPS'){
              const updatedURI = addCredentialsToGitURI(httpsUrl, username, password);
        
              await execSync('git clone ' + updatedURI + ' ' + projectPath, {
                stdio: [0, 1, 2], // we need this so node will print the command output
                cwd: path.resolve('', ''), // path to where you want to save the file
              })
            } 
        
            if(await isDirectoryEmpty(projectName)){
              await createExampleProject(projectName)
            }
        
            const newProjectsNameList = await getProjectsNameList();
        
            await updateClientProjectData(projectName);
        
            socket.emit(EVENT_KEYS.CREATE_PROJECT, {
              success:true, 
              newProjectsNameList, 
              newProjectName: projectName
            });
        
          } catch (error) {
            console.log('Error create project ', error )
            socket.emit(EVENT_KEYS.CREATE_PROJECT, {success: false, error});
          }
    });

    socket.on(EVENT_KEYS.CHANGE_PROJECT, async (arg) => {
        try {
      
          const { projectName } = arg;
      
          const appSettings = await readAppSettings();
      
          await updateAppSettings({
            ...appSettings,
            activeProject: projectName,
          })
          socket.emit(EVENT_KEYS.CHANGE_PROJECT, {success: true});
      
          await updateClientProjectData(projectName);
        } catch (error) {
            socket.emit(EVENT_KEYS.CHANGE_PROJECT, {success: false, error});
        }
    });


    socket.on(EVENT_KEYS.DELETE_PROJECT, async (arg) => {
        const { projectName } = arg

        const currentRepoFolderPath = await getProjectPath(arg.projectName);
    
        try {
            closeProjectServers();
            socket.emit(EVENT_KEYS.CLOSE_SERVER, {success: true});
        
            const appSettings = await readAppSettings();
        
            await updateAppSettings({...appSettings, projects: appSettings?.projects?.filter((item)=>item.name !== projectName) || []})
            
            const projectsNameList = await getProjectsNameList();
        
            socket.emit(EVENT_KEYS.DELETE_PROJECT, {success: true, projectsNameList});
        } catch (error) {
            socket.emit(EVENT_KEYS.CLOSE_SERVER, {error, success: false});
            socket.emit(EVENT_KEYS.DELETE_PROJECT, {success: false, currentRepoFolderPath});
        }
        
    });

    socket.on(EVENT_KEYS.ACTIVATE, async (arg) => {
        try {
          const success = await activateProgram(arg.activationKey);
          socket.emit(EVENT_KEYS.ACTIVATE, {success});
      
        } catch (error) {
            socket.emit(EVENT_KEYS.ACTIVATE, {success: false});
        }
    });


    socket.on(EVENT_KEYS.RELOAD, async (arg) => {
        const { projectName } = arg;
      
        await updateClientProjectData(projectName);
    });

    socket.on(EVENT_KEYS.APPROVE_ANALYTICS, async()=>{
      const currentAppSettings = await readAppSettings()
      await updateAppSettings({...currentAppSettings, userApproveAnalytics: true})
      const appSettings = await readAppSettings()

      socket.emit(EVENT_KEYS.APP_SETTINGS_UPDATED, {success: true, appSettings})
    })

    socket.on(EVENT_KEYS.RUN_TERMINAL_COMMAND, async({command, projectName}) => {
      const directoryPath = await getProjectPath(projectName);

      try {
        const output = execSync(command, { cwd: directoryPath, encoding: 'utf-8' });

        socket.emit(EVENT_KEYS.TERMINAL_COMMAND_OUTPUT, {output,  success: true});
      } catch (error: any) {

        if(error.stdout?.length > 0){
          socket.emit(EVENT_KEYS.TERMINAL_COMMAND_OUTPUT, {output: error.stdout,  success: false});
        }else{
          socket.emit(EVENT_KEYS.TERMINAL_COMMAND_OUTPUT, {output: error.stderr, success: false});
        }
      } finally {
        await updateClientProjectData(projectName);
      }
    });

    socket.on(EVENT_KEYS.RELOAD_PROJECT, async({projectName}) => {
      try {
        await updateClientProjectData(projectName);
      } catch (error: any) {
        socket.emit(EVENT_KEYS.RELOAD_PROJECT, {success: false});
      } 
    });
}