import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useEffect, useState } from 'react';

import Typography from '@mui/material/Typography';
import { v4 as uuid } from 'uuid';
import LoadingButton from '@mui/lab/LoadingButton';
import cloneDeep from 'lodash/cloneDeep';
import { useProjectStore } from '../../../state/project';
import { Preset } from '../../../../types';
import { EVENT_KEYS } from '../../../../types/events';
import { emitSocketEvent, reportButtonClick, socket } from '../../../utils';
import { BUTTONS } from '../../../../consts/analytics';

type Props = {
  onClose: Function;
  open: boolean;
  data: Preset | null;
  presetFolderId: string;
};

export function PresetDialog({ onClose, open, data, presetFolderId }: Props) {
  const {
    activeProjectName,
    presetFoldersHash,
    setHasDiffs,
    addUpdatePresetFolder,
  } = useProjectStore();

  const [description, setDescription] = useState<string>(
    data?.description || '',
  );
  const [name, setName] = useState<string>(data?.name || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const presetFolder = Object.values(presetFoldersHash).find(
    (item) => item.id === presetFolderId,
  );

  const presetsNames = Object.values(presetFolder?.presetsHash || {}).map(
    (item) => item.name,
  );
  const nameAlreadyExist = presetsNames?.includes(name) && data?.name !== name;

  useEffect(() => {
    const onEvent = (arg: any) => {
      setIsLoading(false);
      const {
        success,
        presetFolder: _presetFolder,
        projectName,
        hasDiffs,
      } = arg;
      setHasDiffs(hasDiffs);

      if (success && projectName === activeProjectName) {
        addUpdatePresetFolder(_presetFolder);
        onClose();
      }
    };
    socket.on(EVENT_KEYS.UPDATE_PRESET_FILE, onEvent);
    return () => {
      socket.off(EVENT_KEYS.UPDATE_PRESET_FILE, onEvent);
    };
  }, [activeProjectName, addUpdatePresetFolder, onClose, setHasDiffs]);

  const handleSave = () => {
    reportButtonClick(BUTTONS.PRESET_DIALOG_SAVE);
    const preset: Preset = {
      id: data?.id || uuid(),
      description,
      name,
      routesHash: data?.routesHash || {},
    };

    const _presetFolder = presetFoldersHash[presetFolderId];

    if (!_presetFolder) {
      return;
    }

    const __presetFolder = cloneDeep(presetFolder);

    if (__presetFolder?.presetsHash) {
      __presetFolder.presetsHash[preset.id] = preset;
    }

    setIsLoading(true);

    emitSocketEvent(EVENT_KEYS.UPDATE_PRESET_FILE, {
      presetFolder: __presetFolder,
      projectName: activeProjectName,
    });
  };

  const handleClose = () => {
    reportButtonClick(BUTTONS.PRESET_DIALOG_CLOSE);

    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Preset</DialogTitle>
      <DialogContent style={{ minWidth: '400px', width: '400px' }}>
        <TextField
          autoFocus
          required
          margin="dense"
          id="name"
          name="name"
          label="name"
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          error={!!nameAlreadyExist}
        />

        {!!nameAlreadyExist && (
          <Typography variant="subtitle2" gutterBottom style={{ color: 'red' }}>
            preset name already exist!
          </Typography>
        )}

        <TextField
          value={description}
          margin="dense"
          id="description"
          name="description"
          label="description"
          type="text"
          fullWidth
          variant="outlined"
          onChange={(e) => {
            setDescription(e.target.value);
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <LoadingButton
          variant="contained"
          onClick={handleSave}
          loading={isLoading}
          disabled={nameAlreadyExist || name.length < 1}
        >
          save
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
