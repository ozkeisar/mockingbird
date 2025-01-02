import LoadingButton from '@mui/lab/LoadingButton';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import axios from 'axios';
import { BUTTONS } from '../../../../consts/analytics';
import { useProjectStore } from '../../../state/project';
import { reportButtonClick } from '../../../utils';
import { BASE_URL } from '../../../const/general';

export function ImportSwaggerDialog({
  open,
  onClose,
  serverName,
}: {
  open: boolean;
  onClose: () => void;
  serverName: string;
}) {
  const { activeProjectName } = useProjectStore();
  const [swaggerUrl, setSwaggerUrl] = useState('');
  const [swaggerJson, setSwaggerJson] = useState('');
  const [type, setType] = useState<'url' | 'json'>('url');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const isJson = type === 'json';

  const handleImport = async () => {
    reportButtonClick(BUTTONS.IMPORT_SWAGGER_DIALOG_IMPORT);

    setIsLoading(true);

    try {
      const res = await axios.post(`${BASE_URL}/servers/load-swagger`, {
        projectName: activeProjectName,
        serverName,
        type,
        swaggerUrl: isJson ? '' : swaggerUrl,
        swaggerJson: isJson ? swaggerJson : '',
      });
      setIsLoading(false);
      if (res.status === 200) {
        onClose();
      } else {
        setError(true);
      }
    } catch (_) {
      setIsLoading(false);
      setError(true);
    }
  };

  const handleClose = () => {
    reportButtonClick(BUTTONS.IMPORT_SWAGGER_DIALOG_CLOSE);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">import swagger</DialogTitle>
      <DialogContent style={{ minWidth: '450px' }}>
        <ToggleButtonGroup
          color="primary"
          value={type}
          exclusive
          onChange={(_, _type) => {
            if (_type) {
              setType(_type);
            }
          }}
          aria-label="Platform"
        >
          <ToggleButton value="url">url</ToggleButton>
          <ToggleButton value="json">json</ToggleButton>
        </ToggleButtonGroup>

        <TextField
          style={{ width: '100%', marginTop: '8px' }}
          value={isJson ? swaggerJson : swaggerUrl}
          onChange={(e) => {
            setError(false);
            if (isJson) {
              setSwaggerJson(e.target.value);
            } else {
              setSwaggerUrl(e.target.value);
            }
          }}
          multiline={isJson}
          minRows={5}
          maxRows={10}
          error={error}
          className="activation key"
          label={isJson ? 'swagger json' : 'swagger json url'}
          placeholder={
            isJson ? '{...}' : 'https://your.swagger.domain/swagger.json'
          }
          variant="filled"
        />
        {error && <Typography color="error">something went wrong</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} autoFocus>
          cancel
        </Button>
        <LoadingButton
          variant="contained"
          onClick={handleImport}
          loading={isLoading}
          disabled={
            isLoading ||
            (!swaggerUrl.length && !isJson) ||
            (isJson && !swaggerJson.length)
          }
        >
          import
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
