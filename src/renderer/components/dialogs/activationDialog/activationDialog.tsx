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
import { emitSocketEvent, reportButtonClick, socket } from '../../../utils';

export function ActivationDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [activationKey, setActivationKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInvalidCode, setIsInvalidCode] = useState(false);

  useEffect(() => {
    const onEvent = (arg: any) => {
      const { success } = arg;
      setIsLoading(false);
      if (success) {
        onClose();
      } else {
        setIsInvalidCode(true);
      }
    };

    socket.on(EVENT_KEYS.ACTIVATE, onEvent);

    return () => {
      socket.off(EVENT_KEYS.ACTIVATE, onEvent);
    };
  }, [setIsLoading, onClose]);

  const handleActivate = () => {
    reportButtonClick(BUTTONS.ACTIVATION_DIALOG_ACTIVATE);

    setIsLoading(true);
    emitSocketEvent(EVENT_KEYS.ACTIVATE, { activationKey });
  };

  const handleClose = () => {
    reportButtonClick(BUTTONS.ACTIVATION_DIALOG_CANCEL);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">insert activation key</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          please insert your activation key to activate the program.
        </DialogContentText>
        <TextField
          style={{ width: '100%' }}
          value={activationKey}
          onChange={(e) => {
            setActivationKey(e.target.value);
          }}
          error={isInvalidCode}
          className="activation key"
          label="activation key"
          variant="filled"
        />
        {isInvalidCode && <Typography color="error">Invalid key</Typography>}
        <Typography variant="body2">
          contact ozkeisar@gamil.com for activation key
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
          disabled={isLoading || !activationKey.length}
        >
          Activate
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
