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

type Props = {
  onCommit: () => void;
  onUndo: () => void;
  open: boolean;
  onClose: () => void;
};

export function CheckoutBranchDialog({
  open,
  onClose,
  onCommit,
  onUndo,
}: Props) {
  const handleCommit = () => {
    reportButtonClick(BUTTONS.CHECK_BRANCH_DIALOG_COMMIT);
    onCommit();
  };

  const handleUndo = () => {
    reportButtonClick(BUTTONS.CHECK_BRANCH_DIALOG_UNDO);
    onUndo();
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">unsaved changes</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          you have unsaved changes in your current brach
        </DialogContentText>
        <DialogContentText id="alert-dialog-description">
          what would you like to do?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleUndo}>undo & checkout</Button>
        <Button onClick={handleCommit} autoFocus>
          commit & checkout
        </Button>
      </DialogActions>
    </Dialog>
  );
}
