import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { DialogActions, DialogContent, DialogContentText } from '@mui/material';
import { useEffect, useState } from 'react';
import './settingsDialog.css';
import { LoadingButton } from '@mui/lab';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useGeneralStore } from '../../../state';
import { useProjectStore } from '../../../state/project';
import { CloneDialog } from '../cloneDialog';
import { EVENT_KEYS } from '../../../../types/events';
import {
  emitSocketEvent,
  isElectronEnabled,
  openInNewTab,
  reportButtonClick,
  socket,
} from '../../../utils';
import { BUTTONS } from '../../../../consts/analytics';

type props = {
  open: boolean;
  onClose: () => void;
};

export function SettingsDialog({ open, onClose }: props) {
  const { setProjectSettings, activeProjectName, setHasDiffs } =
    useProjectStore();
  const { isServerUp } = useGeneralStore();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openCloneDialog, setOpenCloneDialog] = useState(false);

  useEffect(() => {
    const onEvent = (arg: any) => {
      const {
        success,
        projectSettings: _projectSettings,
        projectName,
        hasDiffs,
      } = arg;
      if (success && activeProjectName === projectName) {
        setProjectSettings(_projectSettings);
        setHasDiffs(hasDiffs);
        if (isServerUp) {
          emitSocketEvent(EVENT_KEYS.RESTART_SERVER, {
            projectName: activeProjectName,
          });
        }
        onClose();
      }
    };
    socket.on(EVENT_KEYS.UPDATE_PROJECT_SETTINGS, onEvent);
    return () => {
      socket.off(EVENT_KEYS.UPDATE_PROJECT_SETTINGS, onEvent);
    };
  }, [isServerUp, activeProjectName, setProjectSettings, setHasDiffs, onClose]);

  const handleDeleteClick = () => {
    reportButtonClick(BUTTONS.SETTINGS_DIALOG_DELETE);
    setOpenDeleteDialog(true);
  };

  const deleteRepo = () => {
    reportButtonClick(BUTTONS.DELETE_PROJECT_DIALOG_DELETE);

    emitSocketEvent(EVENT_KEYS.DELETE_PROJECT, {
      projectName: activeProjectName,
    });
    setOpenDeleteDialog(false);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="SettingsDialog"
        aria-describedby="SettingsDialog"
      >
        <DialogTitle id="alert-dialog-title">App settings</DialogTitle>
        <DialogContent>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <LoadingButton
              endIcon={<OpenInNewIcon />}
              onClick={() => {
                if(isElectronEnabled){
                  openInNewTab('localhost:1511/api-docs');
                }else{
                  const baseURl = window.location.href
                  openInNewTab(baseURl+'api-docs');
                }
              }}
              variant="outlined"
              style={{ marginBottom: '15px' }}
            >
              Open Mockingbird swagger
            </LoadingButton>
            <Button
              variant="outlined"
              color="error"
              onClick={handleDeleteClick}
            >
              delete current project
            </Button>
          </div>
        </DialogContent>
        <DialogActions />
      </Dialog>
      {openCloneDialog && (
        <CloneDialog
          open={openCloneDialog}
          onClose={(success) => {
            setOpenCloneDialog(false);
            if (success) {
              onClose();
            }
          }}
        />
      )}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Delete repository</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This action will delete ALL of your data and you won`t be able to
            restore it
          </DialogContentText>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              reportButtonClick(BUTTONS.DELETE_PROJECT_DIALOG_CLOSE);
              setOpenDeleteDialog(false);
            }}
          >
            cancel
          </Button>
          <Button color="error" onClick={deleteRepo} autoFocus>
            Yes, delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
