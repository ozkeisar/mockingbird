import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { useEffect, useState } from 'react';
import { useGeneralStore } from '../../state';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import './topBar.css';
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Tooltip } from '@mui/material';
import { useLoggerStore } from '../../state/logger';
import { useProjectStore } from '../../state/project';
import FilterDramaIcon from '@mui/icons-material/FilterDrama';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import { ReactComponent as LogoSvg } from './../../../../assets/icon.svg';
import { CloneDialog } from '../dialogs';
import { ServersIpDialog } from '../dialogs';
import { ReactComponent as GitIcon } from './../../../../assets/svg/Git-Icon-White.svg'; 
import { AddRemoteDialog } from '../dialogs/addRemoteDialog';
import { EVENT_KEYS } from '../../../types/events';
import { emitSocketEvent, reportButtonClick, reportElementClick, socket } from '../../utils';
import { BUTTONS, ELEMENTS } from '../../../consts/analytics';

export const TopBar = ()=> {
  const { serverLogs } = useLoggerStore();
  const { activeProjectName, hasDiffs, setHasDiffs, isGitInit } = useProjectStore();
  const { isServerUp, isServerLoading, clearSelectedRoute, setIsServerLoading, projectsNameList } = useGeneralStore();
  const [openPullDialog, setOpenPullDialog] = useState(false);
  const [isPullLoading, setIsPullLoading] = useState(false);
  const [isPushLoading, setIsPushLoading] = useState(false);
  const [isAddRemoteDialogOpen, setIsAddRemoteDialogOpen] = useState(false);
  const [isServersIpDialogOpen, setIsServersIpDialogOpen] = useState(false);
  const [openCloneDialog, setOpenCloneDialog] = useState(false);


  useEffect(()=>{
    const onEvent = () => {
      setIsPullLoading(false)
    }
    socket.on(EVENT_KEYS.PULL, onEvent);

    return ()=>{
      socket.off(EVENT_KEYS.PULL, onEvent)
    }
  },[])

  useEffect(()=>{
    const onEvent = (arg: any) => {
      setIsPushLoading(false)

      const {success } = arg;
      
      if(success){
        setHasDiffs(false);
      }     
    }
    socket.on(EVENT_KEYS.PUSH, onEvent);

    return ()=>{
      socket.off(EVENT_KEYS.PUSH, onEvent)
    }
  },[setHasDiffs])

  const handleCloseServerClick = ()=>{
    reportButtonClick(BUTTONS.TOP_BAR_CLOSE_SERVER)
    setIsServerLoading(true);
    emitSocketEvent(EVENT_KEYS.CLOSE_SERVER);
    
  }

  const handleStartServerClick = async ()=>{
    reportButtonClick(BUTTONS.TOP_BAR_START_SERVER)
    setIsServerLoading(true);
    emitSocketEvent(EVENT_KEYS.START_SERVER, {projectName: activeProjectName});
  }


  const handlePullClick = () => {
    reportButtonClick(BUTTONS.TOP_BAR_PULL)
    setOpenPullDialog(true);
  };

  const handleCloseDialog = () => {
    reportButtonClick(BUTTONS.PULL_DIALOG_CLOSE)
    setOpenPullDialog(false);
  };

  const handleConfirmPull = () => {
    reportButtonClick(BUTTONS.PULL_DIALOG_CONFIRM)
    setOpenPullDialog(false);
    setIsPullLoading(true);
    emitSocketEvent(EVENT_KEYS.PULL, { projectName: activeProjectName });
  };

  const handleChangeProject = (event: SelectChangeEvent) => {
    const selectedProjectName = event.target.value 
    if(isServerUp){
      emitSocketEvent(EVENT_KEYS.CLOSE_SERVER);
    }
    if(!projectsNameList.includes(selectedProjectName)){
        setOpenCloneDialog(true)
        return;
    }
    emitSocketEvent(EVENT_KEYS.CHANGE_PROJECT, {projectName: selectedProjectName });

  };

  const handlePushClick = ()=>{
    reportButtonClick(BUTTONS.TOP_BAR_PUSH)
    setIsPushLoading(true)
    emitSocketEvent(EVENT_KEYS.PUSH, {projectName: activeProjectName });
  }

  const handleInitGit = ()=>{
    reportButtonClick(BUTTONS.TOP_BAR_INIT_GIT)
    setIsAddRemoteDialogOpen(true)
  }
 
  
  return (
    <>
      <AppBar position="static" className='header'>
        <Toolbar>
          <div className='title-n-pull'>
            <LogoSvg onClick={()=>{
              reportElementClick(ELEMENTS.TOP_BAR_LOGO)
              clearSelectedRoute();
            }} className='icon-logo'></LogoSvg>
            <Typography variant="h6" component="div" >
              Mockingbird
            </Typography> 
            {projectsNameList.length > 0 && <FormControl variant='filled' style={{width: '200px',  marginLeft: '35px'}} disabled={isServerUp}>
                <InputLabel id="project-select">project</InputLabel>
                <Select
                    labelId="project-select"
                    id="project-select"
                    value={activeProjectName || undefined}
                    label="project"
                    onChange={handleChangeProject}
                >
                    {projectsNameList.map((projectName)=>{
                        return (
                            <MenuItem id={projectName} value={projectName}>{projectName}</MenuItem>
                        )
                    })}
                    <MenuItem value={'cloneNewProject'}>{'+ New project'}</MenuItem> 
                </Select>
            </FormControl>}
           {isGitInit && !!activeProjectName && !isServerUp && <LoadingButton
                loadingPosition="start"
                startIcon={<ArrowCircleDownIcon />}
                variant="outlined"
                onClick={handlePullClick}
                className="button"
                loading={isPullLoading}
              >
                pull
            </LoadingButton> }
            {isGitInit && !!activeProjectName && hasDiffs && !isServerUp && <LoadingButton
                loadingPosition="start"
                startIcon={<ArrowCircleUpIcon />}
                variant="outlined"
                onClick={handlePushClick}
                className="button"
                loading={isPushLoading}
              >
                Push
            </LoadingButton> }
            {
              !isGitInit && !isServerUp && !!activeProjectName && <LoadingButton
                  loadingPosition="start"
                  startIcon={<GitIcon className="git-icon"/>}
                  variant="outlined"
                  onClick={handleInitGit}
                  className="button"
                  loading={isPushLoading}
                >
                  connect git
              </LoadingButton>
            }
          </div>
          {!!activeProjectName && <>
            {
              isServerUp
              && <LoadingButton
                  loadingPosition="start"
                  startIcon={<FilterDramaIcon />}
                  variant="text"
                  onClick={()=>{
                    reportButtonClick(BUTTONS.TOP_BAR_SERVERS_IPS)
                    setIsServersIpDialogOpen(true)
                  }}
                  className="button"
                >
                  Servers IP's
                </LoadingButton>
            }
            {
            isServerUp
                ?<LoadingButton
                loading={isServerLoading}
                loadingPosition="start"
                startIcon={<StopCircleIcon />}
                variant="outlined"
                onClick={handleCloseServerClick}
                className="button"
              >
                stop server
              </LoadingButton> 
                :<LoadingButton
                loading={isServerLoading}
                loadingPosition="start"
                startIcon={<PlayCircleOutlineIcon />}
                variant="outlined"
                onClick={handleStartServerClick}
                className="button"
              >
                start server
              </LoadingButton> 
            }
          </>
          }
        </Toolbar>
      </AppBar>
      {openCloneDialog 
            && <CloneDialog open={openCloneDialog} onClose={
                (success)=>{
                    setOpenCloneDialog(false)
                }
            }></CloneDialog>
        }
      {isServersIpDialogOpen && <ServersIpDialog open={isServersIpDialogOpen} onClose={()=>{setIsServersIpDialogOpen(false)}} />}
      {isAddRemoteDialogOpen && <AddRemoteDialog open onClose={()=>setIsAddRemoteDialogOpen(false)}/>}
      <Dialog
        open={openPullDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Pull data from remote"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This will stash your local changes and get you the remote data.
            are you sure you want to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>cancel</Button>
          <Button onClick={handleConfirmPull} autoFocus>
            Pull
          </Button>
        </DialogActions>
      </Dialog>
      </>
    );
}