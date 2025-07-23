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
import { PresetsFolder } from '../../../../types';
import { emitSocketEvent, reportButtonClick, socket } from '../../../utils';
import { useProjectStore } from '../../../state/project';
import { EVENT_KEYS } from '../../../../types/events';
import { BUTTONS } from '../../../../consts/analytics';
import { formatToValidFilename } from '../../../../utils/utils';

type Props = {
  onClose: Function;
  open: boolean;
  data: PresetsFolder | null;
};

export function PresetFolderDialog({ onClose, open, data }: Props) {
  const {
    activeProjectName,
    presetFoldersHash,
    setHasDiffs,
    addUpdatePresetFolder,
  } = useProjectStore();
  const [filename, setFilename] = useState<string>(data?.filename || '');
  const [name, setName] = useState<string>(data?.name || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isEdit = !!data?.id;

  const existingFilenames = Object.values(presetFoldersHash).map(
    (item) => item.filename,
  );
  const presetsFilenames = Object.values(presetFoldersHash).map(
    (item) => item.name,
  );
  const nameAlreadyExist =
    presetsFilenames?.includes(name) && data?.name !== name;
  const filenameAlreadyExist =
    existingFilenames?.includes(filename) && data?.filename !== filename;

  useEffect(() => {
    if (!isEdit) {
      setFilename(formatToValidFilename(name));
    }
  }, [isEdit, name]);

  useEffect(() => {
    const onEvent = (arg: any) => {
      setIsLoading(false);
      const { success, presetFolder, projectName, hasDiffs } = arg;
      setHasDiffs(hasDiffs);

      if (success && projectName === activeProjectName) {
        addUpdatePresetFolder(presetFolder);
        onClose();
      }
    };
    socket.on(EVENT_KEYS.UPDATE_PRESET_FILE, onEvent);
    return () => {
      socket.off(EVENT_KEYS.UPDATE_PRESET_FILE, onEvent);
    };
  }, [activeProjectName, addUpdatePresetFolder, onClose, setHasDiffs]);

  const handleSave = () => {
    reportButtonClick(BUTTONS.PRESET_FOLDER_DIALOG_SAVE);

    const presetFolder: PresetsFolder = {
      id: data?.id || uuid(),
      filename,
      name,
      presetsHash: data?.presetsHash || {},
    };
    setIsLoading(true);

    emitSocketEvent(EVENT_KEYS.UPDATE_PRESET_FILE, {
      presetFolder,
      projectName: activeProjectName,
    });
  };

  const handleClose = () => {
    reportButtonClick(BUTTONS.PRESET_FOLDER_DIALOG_CLOSE);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Preset Folder</DialogTitle>
      <DialogContent>
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
            folder already exist!
          </Typography>
        )}

        <TextField
          disabled
          value={`${filename}.json`}
          required
          margin="dense"
          id="filename"
          name="filename"
          label="filename"
          type="text"
          fullWidth
          variant="outlined"
          error={!!filenameAlreadyExist}
        />
        {!!filenameAlreadyExist && (
          <Typography variant="subtitle2" gutterBottom style={{ color: 'red' }}>
            Filename already exist!
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <LoadingButton
          variant="contained"
          onClick={handleSave}
          loading={isLoading}
          disabled={
            filename.length < 1 ||
            !!filenameAlreadyExist ||
            nameAlreadyExist ||
            name.length < 1
          }
        >
          save
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
