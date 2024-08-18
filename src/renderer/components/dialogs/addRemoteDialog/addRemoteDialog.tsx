import LoadingButton from '@mui/lab/LoadingButton';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { BUTTONS } from '../../../../consts/analytics';
import { EVENT_KEYS } from '../../../../types/events';
import { useProjectStore } from '../../../state/project';
import { emitSocketEvent, reportButtonClick, socket } from '../../../utils';

export function AddRemoteDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { activeProjectName } = useProjectStore();
  const [remoteUrl, setRemoteUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInvalidCode] = useState(false);

  useEffect(() => {
    const onEvent = (arg: any) => {
      const { success } = arg;
      setIsLoading(false);
      if (success) {
        onClose();
      } else {
        // setIsInvalidCode(true)
      }
    };
    socket.on(EVENT_KEYS.ADD_REMOTE, onEvent);

    return () => {
      socket.off(EVENT_KEYS.ADD_REMOTE, onEvent);
    };
  }, [setIsLoading, onClose]);

  const handleActivate = () => {
    reportButtonClick(BUTTONS.ADD_REMOTE_DIALOG_CONNECT);

    setIsLoading(true);
    emitSocketEvent(EVENT_KEYS.ADD_REMOTE, {
      remoteUrl,
      projectName: activeProjectName,
    });
  };

  const handleClose = () => {
    reportButtonClick(BUTTONS.ADD_REMOTE_DIALOG_CANCEL);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">insert remote url</DialogTitle>
      <DialogContent style={{ minWidth: '450px' }}>
        <DialogContentText id="alert-dialog-description">
          please insert your git repository remote url.
        </DialogContentText>

        <TextField
          style={{ width: '100%' }}
          value={remoteUrl}
          onChange={(e) => {
            setRemoteUrl(e.target.value);
          }}
          error={isInvalidCode}
          className="activation key"
          label="remote url"
          variant="filled"
        />
        {isInvalidCode && (
          <Typography color="error">Invalid remote url</Typography>
        )}
        <Typography variant="caption">
          For example: https://github.com/username/repository.git
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} autoFocus>
          cancel
        </Button>
        <LoadingButton
          loadingPosition="start"
          variant="contained"
          onClick={handleActivate}
          loading={isLoading}
          disabled={isLoading || !remoteUrl.length}
        >
          connect
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
