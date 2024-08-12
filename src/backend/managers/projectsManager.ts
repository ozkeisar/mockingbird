import { SUPPORTED_PROJECT_DATA_VERSION } from "../../consts";
import { getProjectPath, getProjectPresets, getProjectServers, isFirstVersionGreater, readProjectSettings } from "../../backend/utils";
import { migrateProjectData } from "../utils/migrations";
import { listToHashmap } from "../utils/utils";
import { ProjectDataNew} from "../../types";
// import chokidar from 'chokidar';
import path from 'path';
import { checkIsGitInit, getBranches, getCurrentBranch, hasUncommittedChanges } from "../utils/git";
// import { socketIo } from "../app";


class ProjectsManager {
    private projects: {
        [key: string]: ProjectDataNew
    } = {};

    constructor() { }

    public async getProjectServersHash(projectName: string){
        await this.loadProject(projectName)
        return this.projects[projectName].serversHash
    }
    public async getProjectPresetFoldersHash(projectName: string){
        await this.loadProject(projectName)
        return this.projects[projectName].presetFoldersHash
    }
    public async getProjectSettings(projectName: string){
        await this.loadProject(projectName)
        return this.projects[projectName].settings
    }
    public async getProjectData(projectName: string){
        await this.loadProject(projectName)
        return this.projects[projectName]
    }

    private handleProjectDataChanged(projectName: string, changeType: string, itemPath: string): void {
        const relativePath = path.relative(process.cwd(), itemPath);
        console.log(`changes in: ${projectName} :${changeType}: ${relativePath}`);
        this.readProjectData(projectName)
        // socketIo.emit('reload', {projectName});
    }

    private async watchProjectFolder(projectName: string) {
        const projectPath = await getProjectPath(projectName);

        // const watcher = chokidar.watch(projectPath, {
        //     ignored: /(^|[\/\\])\.git/, 
        //     persistent: true,
        //     ignoreInitial: true,
        //     depth: 99 // Adjust depth as needed
        // });
        
        // watcher
        //     .on('add', filePath => this.handleProjectDataChanged(projectName,'File added', filePath))
        //     .on('change', filePath => this.handleProjectDataChanged(projectName,'File changed', filePath))
        //     .on('unlink', filePath => this.handleProjectDataChanged(projectName,'File removed', filePath))
        //     .on('addDir', dirPath => this.handleProjectDataChanged(projectName,'Directory added', dirPath))
        //     .on('unlinkDir', dirPath => this.handleProjectDataChanged(projectName,'Directory removed', dirPath))
        //     .on('error', error => console.error('Error watching files:', error));
        
        console.log(`---Watching changes for ${projectName} in: ${projectPath}`);
    }


    private async loadProject(projectName: string){
        if(this.projects[projectName]){
            console.log('project already loaded');
        }else{
            await this.readProjectData(projectName);
            await this.watchProjectFolder(projectName);
        }
    }

    private async readProjectData(projectName: string): Promise<void> {
        const isGitInit = await checkIsGitInit(projectName)
        const currentBranch = await getCurrentBranch(projectName);
        const branches = await getBranches(projectName) as string[]
        const hasDiffs = await hasUncommittedChanges(projectName);
        try {
            const projectSettings = await readProjectSettings(projectName);
      
            const dataVersion = projectSettings?.dataVersion || '0.0.5'
      
            const isProjectDataVersionSmaller = isFirstVersionGreater(SUPPORTED_PROJECT_DATA_VERSION, dataVersion)
            if(isProjectDataVersionSmaller){
              await migrateProjectData(projectName, dataVersion)
            }
          
            const servers = await getProjectServers(projectName);
            const serversHash = listToHashmap(servers, (server)=> server.name);
            const presetFolders = await getProjectPresets(projectName)
            const presetFoldersHash = listToHashmap(presetFolders, (item)=>item.id)
            
            const isDataUnsupported = isFirstVersionGreater(projectSettings?.dataVersion || SUPPORTED_PROJECT_DATA_VERSION, SUPPORTED_PROJECT_DATA_VERSION)

            this.projects[projectName] = {
                presetFoldersHash: presetFoldersHash,
                serversHash: serversHash,
                settings: projectSettings,
                name: projectName,
                isDataUnsupported,
                isDataInvalid: false,
                isGitInit,
                currentBranch,
                branches,
                hasDiffs
            }
          
          } catch (error) {
            this.projects[projectName] = {
                presetFoldersHash: null,
                serversHash: null,
                settings: null,
                name: projectName,
                isDataUnsupported: false,
                isDataInvalid: true,
                isGitInit,
                currentBranch,
                branches,
                hasDiffs
            }
            console.log(`Error loadProject ${projectName}: `, error)
          }
    }
}

// Create the singleton instance
const projectsManager = new ProjectsManager();


export { projectsManager };
