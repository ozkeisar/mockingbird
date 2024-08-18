import LoadingButton from '@mui/lab/LoadingButton';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import cloneDeep from 'lodash/cloneDeep';
import { useEffect, useState } from 'react';
import { BUTTONS } from '../../../../consts/analytics';
import { EVENT_KEYS } from '../../../../types/events';
import { useGeneralStore } from '../../../state';
import { useProjectStore } from '../../../state/project';
import { emitSocketEvent, reportButtonClick, socket } from '../../../utils';

export function DeletePresetDialog({
  presetFolderId,
  presetId,
  open,
  onClose,
}: {
  presetFolderId: string;
  presetId: string;
  open: boolean;
  onClose: () => void;
}) {
  const {
    activeProjectName,
    setHasDiffs,
    addUpdatePresetFolder,
    presetFoldersHash,
  } = useProjectStore();
  const { setSelectedPreset } = useGeneralStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const onEvent = (arg: any) => {
      setIsLoading(false);
      const { success, presetFolder, projectName, hasDiffs } = arg;
      setHasDiffs(hasDiffs);

      if (success && projectName === activeProjectName) {
        setSelectedPreset({ presetId: null, folderId: presetFolderId });
        addUpdatePresetFolder(presetFolder);
        onClose();
      }
    };
    socket.on(EVENT_KEYS.UPDATE_PRESET_FILE, onEvent);
    return () => {
      socket.off(EVENT_KEYS.UPDATE_PRESET_FILE, onEvent);
    };
  }, [
    activeProjectName,
    addUpdatePresetFolder,
    onClose,
    presetFolderId,
    setHasDiffs,
    setSelectedPreset,
  ]);

  const handleDelete = () => {
    reportButtonClick(BUTTONS.DELETE_PRESET_DIALOG_DELETE);
    const presetFolder = cloneDeep(presetFoldersHash[presetFolderId]);

    delete presetFolder?.presetsHash?.[presetId];

    setIsLoading(true);

    emitSocketEvent(EVENT_KEYS.UPDATE_PRESET_FILE, {
      presetFolder,
      projectName: activeProjectName,
    });
  };

  const handleClose = () => {
    reportButtonClick(BUTTONS.DELETE_PRESET_DIALOG_CANCEL);

    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">delete preset</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          are you sure you want to delete this preset?
        </DialogContentText>
        <DialogContentText id="alert-dialog-description">
          this will permanently delete this preset and all its routes
        </DialogContentText>
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
          Delete
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
