import { ServerLog } from "../../types";


class ServerLogsManager {
    private serverLogs:{[key:string]: ServerLog[]} = {}
    private logLimit: number = 200; // Set the log limit

    constructor() { }

    public addLog(projectName: string, serverLog: ServerLog){
        if(this.serverLogs[projectName]){
            this.serverLogs[projectName].push(serverLog);
             // Remove the oldest log if the limit is exceeded
             if (this.serverLogs[projectName].length > this.logLimit) {
                this.serverLogs[projectName].shift();
            }
        }else {
            this.serverLogs[projectName] = [serverLog]
        }
    }

    getLogs(projectName: string){
        return this.serverLogs[projectName] || [];
    }

    clearLogs(projectName: string){
        this.serverLogs[projectName] = [];
    }

}

// Create the singleton instance
const serverLogsManager = new ServerLogsManager();


export { serverLogsManager };
