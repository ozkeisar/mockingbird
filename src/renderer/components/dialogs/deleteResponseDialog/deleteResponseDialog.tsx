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

export function DeleteResponseDialog({
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
    reportButtonClick(BUTTONS.DELETE_RESPONSE_DIALOG_DELETE);

    onConfirm();
  };

  const handleClose = () => {
    reportButtonClick(BUTTONS.DELETE_RESPONSE_DIALOG_CANCEL);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">delete response</DialogTitle>
      <DialogContent>
        {presets && presets.length > 0 && (
          <>
            <DialogContentText>
              this response is used in the following presets:
            </DialogContentText>
            <ul>
              {presets.map((p) => (
                <li
                  key={`${p.folder}-${p.preset}`}
                >{`${p.folder} / ${p.preset}`}</li>
              ))}
            </ul>
          </>
        )}
        <DialogContentText id="alert-dialog-description">
          are you sure you want to delete this response?
        </DialogContentText>
        <DialogContentText id="alert-dialog-description">
          this will permanently delete the response and its data
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} autoFocus>
          cancel
        </Button>
        <Button color="error" onClick={handleDelete}>
          Delete Response
        </Button>
      </DialogActions>
    </Dialog>
  );
}
