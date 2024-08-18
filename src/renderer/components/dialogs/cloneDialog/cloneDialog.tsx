import Dialog from '@mui/material/Dialog';
import { DialogContent } from '@mui/material';
import { CloneProject } from '../../cloneProject';

type props = {
  open: boolean;
  onClose: (success: boolean) => void;
};

export function CloneDialog({ open, onClose }: props) {
  return (
    <Dialog
      open={open}
      onClose={() => onClose(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogContent>
        <CloneProject
          onCloneSuccess={() => {
            onClose(true);
          }}
          onCancel={() => {
            onClose(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
