import { execSync } from "child_process";
import { Socket } from "socket.io";
import { getProjectPath } from "../../backend/utils";
import path from 'path';
import { updateClientProjectData } from "../utils/events";
import { EVENT_KEYS } from "../../types/events";
import { checkoutToBranch, commitAndPushChanges, connectFolderToGit, getBranches, getCurrentBranch, hasUncommittedChanges, pushChanges } from "../utils/git";

export const gitEvents = (socket: Socket)=>{

    socket.on(EVENT_KEYS.PULL, async (arg) => {
        try {
          const { projectName } = arg

          const projectPath = await getProjectPath(projectName);
          await execSync('git add . ', {
            stdio: [0, 1, 2], // we need this so node will print the command output
            cwd: path.resolve('', projectPath), // path to where you want to save the file
          });
      
          const username = require("os").userInfo().username;
      
          await execSync('git stash save "' + username + '-' + new Date().getTime() + '"', {
            stdio: [0, 1, 2], // we need this so node will print the command output
            cwd: path.resolve('', projectPath), // path to where you want to save the file
          });
      
          await execSync('git pull', {
            stdio: [0, 1, 2], // we need this so node will print the command output
            cwd: path.resolve('', projectPath), // path to where you want to save the file
          });
      
          await updateClientProjectData(projectName)
      
          socket.emit(EVENT_KEYS.PULL, {success:true, newProjectName: projectName});
      
        } catch (error) {
            console.log('---Error pull',error)
            socket.emit(EVENT_KEYS.PULL, {success: false});
        }
    });

    socket.on(EVENT_KEYS.BRANCH_LIST, async (arg) => {
        try {
          const { projectName } = arg
          const branches = await getBranches(projectName, true);
      
          const currentBranch = await getCurrentBranch(projectName)
      
          const hasDiff = await hasUncommittedChanges(projectName)
      
          socket.emit(EVENT_KEYS.BRANCH_LIST, {success:true, branches, projectName, hasDiff, currentBranch});
      
        } catch (error) {
            socket.emit(EVENT_KEYS.BRANCH_LIST, {success: false});
        }
    });

    socket.on(EVENT_KEYS.CHECKOUT_TO_BRANCH, async (arg) => {
        try {
            const { projectName, branchName, withCommit, createNewBranch } = arg
            if(withCommit){
              await commitAndPushChanges(projectName, 'checkout to new branch');
            }
        
            await checkoutToBranch(projectName, branchName, createNewBranch);
        
            await updateClientProjectData(projectName);
        
            socket.emit(EVENT_KEYS.CHECKOUT_TO_BRANCH, {success: true });
        
        } catch (error) {
            socket.emit(EVENT_KEYS.CHECKOUT_TO_BRANCH, {success: false, error });
        }
    });

    socket.on(EVENT_KEYS.PUSH, async (arg) => {
        try {
          const { projectName } = arg
        
          await pushChanges(projectName)
          
          socket.emit(EVENT_KEYS.PUSH, {success: true });
        
        } catch (error) {
            socket.emit(EVENT_KEYS.PUSH, {success: false });
        }
    });

    socket.on(EVENT_KEYS.ADD_REMOTE, async (arg) => {
        try {
          const { projectName, remoteUrl } = arg
        
          await connectFolderToGit(projectName, remoteUrl);
          await updateClientProjectData(projectName);
      
          socket.emit(EVENT_KEYS.ADD_REMOTE, {success: true });
        
        } catch (error) {
            socket.emit(EVENT_KEYS.ADD_REMOTE, {success: false });
        }
    });

}