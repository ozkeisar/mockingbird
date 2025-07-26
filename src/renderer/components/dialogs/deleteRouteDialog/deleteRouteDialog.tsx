import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { BUTTONS } from '../../../../consts/analytics';
import { reportButtonClick } from '../../../utils';
import { PresetUsageWarning } from '../../presetUsageWarning';

export function DeleteRouteDialog({
  open,
  onClose,
  onConfirm,
  presets,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  presets?: { folder: string; preset: string }[];
}) {
  const handleDelete = () => {
    reportButtonClick(BUTTONS.DELETE_ROUTE_DIALOG_DELETE);
    onConfirm();
  };

  const handleClose = () => {
    reportButtonClick(BUTTONS.DELETE_ROUTE_DIALOG_CANCEL);

    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">delete route</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          are you sure you want to delete this route?
        </DialogContentText>
        <DialogContentText id="alert-dialog-description">
          this will permanently delete the route and all its responses
        </DialogContentText>

        <PresetUsageWarning usedInPresets={presets || []} entityType="route" />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} autoFocus>
          cancel
        </Button>
        <Button color="error" onClick={handleDelete}>
          Delete Route
        </Button>
      </DialogActions>
    </Dialog>
  );
}
