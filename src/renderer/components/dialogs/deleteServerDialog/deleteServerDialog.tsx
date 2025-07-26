import LoadingButton from '@mui/lab/LoadingButton';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { BUTTONS } from '../../../../consts/analytics';
import { ProjectServer } from '../../../../types';
import { EVENT_KEYS } from '../../../../types/events';
import { useProjectStore } from '../../../state/project';
import { emitSocketEvent, reportButtonClick, socket } from '../../../utils';
import { PresetUsageWarning } from '../../presetUsageWarning';

export function DeleteServerDialog({
  server,
  open,
  onClose,
}: {
  server: ProjectServer;
  open: boolean;
  onClose: () => void;
}) {
  const { activeProjectName, removeServer, setHasDiffs } = useProjectStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingPresets, setIsCheckingPresets] = useState(false);
  const [usedInPresets, setUsedInPresets] = useState<
    { folderName: string; presetName: string }[]
  >([]);

  useEffect(() => {
    const onDeleteEvent = (arg: any) => {
      setIsLoading(false);
      const { success, projectName, serverName, hasDiffs } = arg;
      setHasDiffs(hasDiffs);
      if (success && projectName === activeProjectName) {
        removeServer(serverName);
        onClose();
      }
    };

    const onCheckPresetUsageEvent = (arg: any) => {
      setIsCheckingPresets(false);
      const { success, usedInPresets: presets } = arg;
      if (success) {
        setUsedInPresets(presets || []);
      }
    };

    socket.on(EVENT_KEYS.DELETE_SERVER, onDeleteEvent);
    socket.on(EVENT_KEYS.CHECK_SERVER_PRESET_USAGE, onCheckPresetUsageEvent);

    return () => {
      socket.off(EVENT_KEYS.DELETE_SERVER, onDeleteEvent);
      socket.off(EVENT_KEYS.CHECK_SERVER_PRESET_USAGE, onCheckPresetUsageEvent);
    };
  }, [activeProjectName, onClose, removeServer, setHasDiffs]);

  useEffect(() => {
    if (open && activeProjectName) {
      setIsCheckingPresets(true);
      setUsedInPresets([]);
      emitSocketEvent(EVENT_KEYS.CHECK_SERVER_PRESET_USAGE, {
        projectName: activeProjectName,
        serverName: server.name,
      });
    }
  }, [open, activeProjectName, server.name]);

  const handleDelete = () => {
    reportButtonClick(BUTTONS.DELETE_SERVER_DIALOG_DELETE);

    setIsLoading(true);
    emitSocketEvent(EVENT_KEYS.DELETE_SERVER, {
      projectName: activeProjectName,
      serverName: server.name,
    });
  };

  const handleClose = () => {
    reportButtonClick(BUTTONS.DELETE_SERVER_DIALOG_CANCEL);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">delete server</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          are you sure you want to delete this server?
        </DialogContentText>
        <DialogContentText id="alert-dialog-description">
          this will permanently delete the server and all its routes
        </DialogContentText>

        <PresetUsageWarning
          isChecking={isCheckingPresets}
          usedInPresets={usedInPresets}
          entityType="server"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} autoFocus>
          cancel
        </Button>
        <LoadingButton
          loadingPosition="start"
          variant="text"
          color="error"
          onClick={handleDelete}
          loading={isLoading}
        >
          Delete server
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
