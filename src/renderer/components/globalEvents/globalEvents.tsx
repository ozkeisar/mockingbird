import { useEffect, useState } from 'react';
import { AppSettings, ProjectData } from '../../../types';
import { EVENT_KEYS } from '../../../types/events';
import { useGeneralStore } from '../../state';
import { useLoggerStore } from '../../state/logger';
import { useProjectStore } from '../../state/project';
import {
  ActivationDialog,
  IpChangedDialog,
  ServerDownDialog,
  SettingsDialog,
} from '../dialogs';
import { ProjectDataInvalidDialog } from '../dialogs/projectDataInvalidDialog';
import { ProjectDataUnsupported } from '../projectDataUnsupported';
import { emitSocketEvent, isElectronEnabled, socket } from '../../utils';

export function GlobalEvents() {
  const [openIpDialog, setOpenIpDialog] = useState(false);
  const [openServerDownDialog, setOpenServerDownDialog] = useState(false);
  const [openActivationDialog, setOpenActivationDialog] = useState(false);
  const [openUnsupportedDialog, setOpenUnsupportedDialog] = useState(false);
  const [openInvalidProjectDataDialog, setOpenInvalidProjectDataDialog] =
    useState(false);
  const [unsupportedProjectName, setUnsupportedProjectName] = useState('');
  const [serverDisabledUntil, setServerDisabledUntil] = useState<Date | null>(
    null,
  );

  const { addServerLog, resetLoggerState } = useLoggerStore();
  const {
    setIsServerUp,
    isServerUp,
    setServerHost,
    setIsServerLoading,
    isSettingsDialogOpen,
    setOpenSettingsDialog,
    setProjectsNameList,
    setAppSettings,
  } = useGeneralStore();

  const {
    setProjectSettings,
    setActiveProjectName,
    setServers,
    updateRoute,
    resetProjectState,
    activeProjectName,
    setLoadingData,
    setHasDiffs,
    setPresetFolders,
    setCurrentBranch,
    setBranches,
    setIsGitInit,
  } = useProjectStore();

  useEffect(() => {
    function onConnect() {
      console.log('----on socket Connect');
    }

    function onDisconnect() {
      console.log('----on socket Disconnect');
    }

    function onReloadEvent(args: { projectName: string }) {
      if (args.projectName === activeProjectName) {
        emitSocketEvent(EVENT_KEYS.RELOAD, { projectName: activeProjectName });
      }
    }

    function onDebugLog(val: any) {
      console.log('Socket Debug: ', val);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('reload', onReloadEvent);
    socket.on('debugLog', onDebugLog);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('reload', onReloadEvent);
      socket.off('debugLog', onDebugLog);
    };
  }, [activeProjectName]);

  useEffect(() => {
    const onEvent = (arg: { success: boolean; appSettings: AppSettings }) => {
      const { success, appSettings } = arg;
      if (success && appSettings) {
        setAppSettings(appSettings);
      }
    };

    socket.on(EVENT_KEYS.APP_SETTINGS_UPDATED, onEvent);

    return () => {
      socket.off(EVENT_KEYS.APP_SETTINGS_UPDATED, onEvent);
    };
  }, [setAppSettings]);

  useEffect(() => {
    const onEvent = (arg: any) => {
      console.log(EVENT_KEYS.DEBUG_LOG, arg);
    };
    socket.on(EVENT_KEYS.DEBUG_LOG, onEvent);
    if (isElectronEnabled) {
      const removeListener = window.electron.ipcRenderer.on(
        EVENT_KEYS.DEBUG_LOG,
        onEvent,
      );

      return () => {
        removeListener();
        socket.off(EVENT_KEYS.DEBUG_LOG, onEvent);
      };
    }
    return () => {
      socket.off(EVENT_KEYS.DEBUG_LOG, onEvent);
    };
  }, []);

  useEffect(() => {
    const onEvent = () => {
      setLoadingData(true);
    };
    socket.on(EVENT_KEYS.IS_LOADING_DATA, onEvent);

    return () => {
      socket.off(EVENT_KEYS.IS_LOADING_DATA, onEvent);
    };
  }, [setLoadingData]);

  useEffect(() => {
    const onEvent = (arg: any) => {
      if (arg.success) {
        resetLoggerState();
      }
    };
    socket.on(EVENT_KEYS.CHANGE_PROJECT, onEvent);

    return () => {
      socket.off(EVENT_KEYS.CHANGE_PROJECT, onEvent);
    };
  }, [resetLoggerState, setLoadingData]);

  useEffect(() => {
    const onEvent = (arg: ProjectData) => {
      setLoadingData(false);

      const {
        projectName,
        projectDataIsUnsupported,
        success,
        serversHash,
        projectSettings,
        currentBranch,
        branches,
        hasDiffs,
        presetFoldersHash,
        isGitInit,
        projectDataInvalid,
      } = arg;

      // resetLoggerState();//?
      setHasDiffs(hasDiffs);
      setIsGitInit(isGitInit);

      if (projectDataIsUnsupported) {
        setUnsupportedProjectName(projectName);
        setOpenUnsupportedDialog(true);
      }

      if (projectDataInvalid) {
        setUnsupportedProjectName(projectName);
        setOpenInvalidProjectDataDialog(true);
      }

      if (isServerUp) {
        emitSocketEvent(EVENT_KEYS.RESTART_SERVER, {
          projectName: activeProjectName,
        });
      }

      if (success && !!projectName && !projectDataIsUnsupported) {
        setServers(serversHash);
        setActiveProjectName(projectName);
        setProjectSettings(projectSettings);
        setPresetFolders(presetFoldersHash || {});
      }

      if (currentBranch) {
        setCurrentBranch(currentBranch);
      }

      if (branches) {
        setBranches(branches);
      }
    };
    socket.on(EVENT_KEYS.PROJECT_DATA, onEvent);

    return () => {
      socket.off(EVENT_KEYS.PROJECT_DATA, onEvent);
    };
  }, [
    isServerUp,
    setServers,
    setActiveProjectName,
    setProjectSettings,
    setLoadingData,
    setHasDiffs,
    setIsGitInit,
    activeProjectName,
    setPresetFolders,
    setCurrentBranch,
    setBranches,
  ]);

  useEffect(() => {
    const onEvent = (arg: any) => {
      const { projectDataIsUnsupported, newProjectName, newProjectsNameList } =
        arg;

      resetLoggerState();

      if (newProjectsNameList) {
        setProjectsNameList(newProjectsNameList);
      }

      if (projectDataIsUnsupported) {
        setUnsupportedProjectName(newProjectName);
        setOpenUnsupportedDialog(true);
      }
    };
    socket.on(EVENT_KEYS.CREATE_PROJECT, onEvent);

    return () => {
      socket.off(EVENT_KEYS.CREATE_PROJECT, onEvent);
    };
  }, [resetLoggerState, setProjectsNameList]);

  useEffect(() => {
    const onEvent = (arg: any) => {
      const { success, content, filename, serverName, projectName, hasDiffs } =
        arg as any;
      setHasDiffs(hasDiffs);

      if (success && projectName === activeProjectName) {
        updateRoute(serverName, content, filename);
        if (isServerUp) {
          emitSocketEvent(EVENT_KEYS.RESTART_SERVER, {
            projectName: activeProjectName,
          });
        }
      }
    };
    socket.on(EVENT_KEYS.UPDATE_ROUTES_FILE, onEvent);

    return () => {
      socket.off(EVENT_KEYS.UPDATE_ROUTES_FILE, onEvent);
    };
  }, [isServerUp, updateRoute, activeProjectName, setHasDiffs]);

  useEffect(() => {
    const onEvent = (arg: any) => {
      const { success, projectsNameList } = arg;

      if (success) {
        resetLoggerState();
        resetProjectState();
        setProjectsNameList(projectsNameList);
      }
    };
    socket.on(EVENT_KEYS.DELETE_PROJECT, onEvent);

    return () => {
      socket.off(EVENT_KEYS.DELETE_PROJECT, onEvent);
    };
  }, [resetLoggerState, resetProjectState, setProjectsNameList]);

  useEffect(() => {
    const onEvent = (arg: any) => {
      const { log } = arg;
      addServerLog(log);
    };
    socket.on(EVENT_KEYS.SERVER_LOGGER, onEvent);

    return () => {
      socket.off(EVENT_KEYS.SERVER_LOGGER, onEvent);
    };
  }, [addServerLog]);

  useEffect(() => {
    if (isElectronEnabled) {
      const removeListener = window.electron.ipcRenderer.on(
        EVENT_KEYS.IP_CHANGED,
        () => {
          if (isServerUp) {
            setOpenIpDialog(true);
          }
        },
      );

      return () => removeListener();
    }
    return () => {};
  }, [setOpenIpDialog, isServerUp]);

  useEffect(() => {
    const onEvent = (arg: any) => {
      const { success, host, projectName } = arg;

      if (projectName !== activeProjectName) {
        return;
      }

      if (success) {
        setIsServerUp(true);
        setServerHost(host);
      }

      if (!success && serverDisabledUntil) {
        setOpenServerDownDialog(true);
      }
      setIsServerLoading(false);
    };

    socket.on(EVENT_KEYS.START_SERVER, onEvent);
    return () => {
      socket.off(EVENT_KEYS.START_SERVER, onEvent);
    };
  }, [
    activeProjectName,
    serverDisabledUntil,
    setIsServerLoading,
    setIsServerUp,
    setServerHost,
  ]);

  useEffect(() => {
    const onEvent = (arg: any) => {
      setIsServerLoading(false);

      if (serverDisabledUntil && isServerUp) {
        setServerDisabledUntil(serverDisabledUntil);
        setOpenServerDownDialog(true);
      }

      if (arg.success) {
        setIsServerUp(false);
      }
    };
    socket.on(EVENT_KEYS.CLOSE_SERVER, onEvent);

    return () => {
      socket.off(EVENT_KEYS.CLOSE_SERVER, onEvent);
    };
  }, [isServerUp, serverDisabledUntil, setIsServerLoading, setIsServerUp]);

  return (
    <>
      <IpChangedDialog
        open={openIpDialog}
        onClose={() => {
          setOpenIpDialog(false);
        }}
      />
      {openActivationDialog && (
        <ActivationDialog
          open={openActivationDialog}
          onClose={() => {
            setOpenActivationDialog(false);
          }}
        />
      )}
      {openServerDownDialog && !!serverDisabledUntil && (
        <ServerDownDialog
          open={openServerDownDialog}
          onActivate={() => {
            setOpenServerDownDialog(false);
            setOpenActivationDialog(true);
          }}
          onClose={() => {
            setOpenServerDownDialog(false);
          }}
          serverDisabledUntil={serverDisabledUntil}
        />
      )}
      {isSettingsDialogOpen && (
        <SettingsDialog
          open={isSettingsDialogOpen}
          onClose={() => {
            setOpenSettingsDialog(false);
          }}
        />
      )}
      {openUnsupportedDialog && (
        <ProjectDataUnsupported
          open={openUnsupportedDialog}
          projectName={unsupportedProjectName}
          onClose={() => {
            setOpenUnsupportedDialog(false);
          }}
        />
      )}
      {openInvalidProjectDataDialog && (
        <ProjectDataInvalidDialog
          open
          projectName={unsupportedProjectName}
          onClose={() => {
            setOpenInvalidProjectDataDialog(false);
          }}
        />
      )}
    </>
  );
}
