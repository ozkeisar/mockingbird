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
import { ProjectServer, RouteParent } from '../../../../types';
import { EVENT_KEYS } from '../../../../types/events';
import { useProjectStore } from '../../../state/project';
import { emitSocketEvent, reportButtonClick, socket } from '../../../utils';
import { PresetUsageWarning } from '../../presetUsageWarning';

export function DeleteParentDialog({
  server,
  parent,
  open,
  onClose,
}: {
  server: ProjectServer;
  parent: RouteParent;
  open: boolean;
  onClose: () => void;
}) {
  const { activeProjectName, removeParent, setHasDiffs } = useProjectStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingPresets, setIsCheckingPresets] = useState(false);
  const [usedInPresets, setUsedInPresets] = useState<
    { folderName: string; presetName: string }[]
  >([]);

  useEffect(() => {
    const onDeleteEvent = (arg: any) => {
      setIsLoading(false);
      const { success, projectName, serverName, parentId, hasDiffs } = arg;
      setHasDiffs(hasDiffs);
      if (success && projectName === activeProjectName) {
        removeParent(serverName, parentId);
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

    socket.on(EVENT_KEYS.DELETE_PARENT, onDeleteEvent);
    socket.on(EVENT_KEYS.CHECK_PARENT_PRESET_USAGE, onCheckPresetUsageEvent);

    return () => {
      socket.off(EVENT_KEYS.DELETE_PARENT, onDeleteEvent);
      socket.off(EVENT_KEYS.CHECK_PARENT_PRESET_USAGE, onCheckPresetUsageEvent);
    };
  }, [activeProjectName, onClose, removeParent, setHasDiffs]);

  useEffect(() => {
    if (open && activeProjectName) {
      setIsCheckingPresets(true);
      setUsedInPresets([]);
      emitSocketEvent(EVENT_KEYS.CHECK_PARENT_PRESET_USAGE, {
        projectName: activeProjectName,
        serverName: server.name,
        parentId: parent.id,
      });
    }
  }, [open, activeProjectName, server.name, parent.id]);

  const handleDelete = () => {
    reportButtonClick(BUTTONS.DELETE_PARENT_DIALOG_DELETE);

    setIsLoading(true);
    emitSocketEvent(EVENT_KEYS.DELETE_PARENT, {
      projectName: activeProjectName,
      serverName: server.name,
      parentFilename: parent.filename,
      parentId: parent.id,
    });
  };

  const handleClose = () => {
    reportButtonClick(BUTTONS.DELETE_PARENT_DIALOG_CANCEL);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">delete Folder</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          are you sure you want to delete this parent?
        </DialogContentText>
        <DialogContentText id="alert-dialog-description">
          this will permanently delete the parent and all its routes
        </DialogContentText>

        <PresetUsageWarning
          isChecking={isCheckingPresets}
          usedInPresets={usedInPresets}
          entityType="parent"
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
          Delete parent
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
