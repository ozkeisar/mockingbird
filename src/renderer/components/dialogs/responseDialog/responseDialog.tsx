import React, { useEffect, useRef, useState } from 'react';
import './responseDialog.css';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Alert from '@mui/material/Alert';
import { v4 as uuid } from 'uuid';

import Typography from '@mui/material/Typography';
import MonacoEditor from '@uiw/react-monacoeditor';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { Tooltip } from '@mui/material';
import axios from 'axios';
import { useResponseActions } from '../../../hooks/files';
import { BUTTONS } from '../../../../consts/analytics';
import { getRouteBGColor, reportButtonClick } from '../../../utils';
import {
  ProjectServer,
  ResponseType,
  Route,
  RouteParent,
  RouteResponse,
} from '../../../../types';
import { useProjectStore } from '../../../state/project';

type Props = {
  onClose: Function;
  open: boolean;
  data: Partial<RouteResponse> | null;
  parent: RouteParent;
  route: Route;
  server: ProjectServer;
};
// eslint-disable-next-line no-useless-escape
const urlRegex = /^(https?|ftp):\/\/(-\.)?([^\s/?\.#-]+\.?)+([^\s]*)$/i;

export function ResponseDialog({
  onClose,
  open,
  data,
  parent,
  route,
  server,
}: Props) {
  const [resType, setResType] = useState<ResponseType>(data?.type || 'obj');
  const [name, setName] = useState<string>(data?.name || '');
  const [description, setDescription] = useState<string>(
    data?.description || '',
  );
  const execRef = useRef(
    data?.exec ||
      '(req, res) => {\n\t\n\tres.status(200).send({ isFunc: true })\n}',
  );
  const [exec, setExec] = useState(execRef.current);
  const resRef = useRef(
    JSON.stringify(data?.res || { code: 200, data: {}, headers: {} }, null, 2),
  );
  const [res, setRes] = useState(resRef.current);
  const [url, setUrl] = useState<string | null>(data?.url || 'http://');
  const [blockProxy, setBlockProxy] = useState(data?.blockProxy || false);
  const [badSyntaxError, setBadSyntaxError] = useState<string | null>(null);
  const existingNames = Object.values(route.responsesHash || {}).map(
    (item) => item.name,
  );
  const { activeProjectName } = useProjectStore();
  const { createResponse } = useResponseActions();
  const isEdit = !!data?.id;

  useEffect(() => {
    try {
      if (resType === 'func') {
        // eslint-disable-next-line no-eval
        eval(`(${exec})`);
      } else if (resType === 'obj') {
        JSON.parse(res);
      } else if (resType === 'proxy') {
        if (!urlRegex.test(url || '')) {
          throw new Error('url is invalid!');
        }
      }
      setBadSyntaxError(null);
    } catch (error: any) {
      setBadSyntaxError(error?.message || 'data is invalid');
    }
  }, [exec, res, resType, url]);

  const handleAlignment = (
    event: React.MouseEvent<HTMLElement>,
    type: 'func' | 'obj' | 'proxy',
  ) => {
    if (type) {
      resRef.current = res;
      execRef.current = exec;
      setResType(type);
    }
  };

  const handleSave = async () => {
    reportButtonClick(BUTTONS.RESPONSE_DIALOG_SAVE);
    const isNewResponse = !data?.id;
    try {
      const responseData: RouteResponse = {
        id: data?.id || uuid(),
        name,
        description,
        res: resType === 'obj' ? JSON.parse(res) : data?.res,
        exec: resType === 'func' ? exec : data?.exec || null,
        url: resType === 'proxy' ? url : data?.url ?? null,
        type: resType,
        blockProxy,
      };

      if (isNewResponse) {
        createResponse(server, parent, route, responseData);
      } else {
        // updateResponse(server, parent, route, responseData);
        await axios.patch(
          `http://localhost:1511/routes/${activeProjectName}/${server.name}/${parent.id}/${route.id}}`,
          {
            updated: route,
          },
        );
      }
      onClose();
    } catch (error) {
      setBadSyntaxError('failed to save the response');
    }
  };

  const handleClose = () => {
    reportButtonClick(BUTTONS.RESPONSE_DIALOG_CLOSE);

    onClose();
  };

  const hasError = existingNames?.includes(name) && data?.name !== name;

  const renderTitleName = () => (
    <div className="route-header-title">
      {!!route?.method && (
        <div
          className="route-method"
          style={{ backgroundColor: getRouteBGColor(route.method) }}
        >
          {route.method}
        </div>
      )}
      <Typography variant="h5">{route?.routePath}</Typography>
      {!!route?.paramType && !!route?.paramKey && !!route?.paramValue && (
        <div className="route-params">
          <div>
            {`{${route?.paramType}.${route?.paramKey} = ${route?.paramValue}}`}
          </div>
        </div>
      )}
    </div>
  );

  const renderInputsSide = () => (
    <div style={{ width: '35%', height: '100%' }}>
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
        error={hasError}
      />
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
      <ToggleButtonGroup
        value={resType}
        exclusive
        onChange={handleAlignment}
        aria-label="text alignment"
        className="radio-group"
      >
        <ToggleButton value="func" aria-label="left aligned">
          Function
        </ToggleButton>
        <ToggleButton value="obj" aria-label="centered">
          JSON
        </ToggleButton>
        <ToggleButton value="proxy" aria-label="centered">
          Proxy
        </ToggleButton>
      </ToggleButtonGroup>
      <div className="switch">
        <Tooltip title="return mock even when server set to proxy">
          <FormControlLabel
            control={
              <Switch
                checked={blockProxy}
                onChange={(e) => setBlockProxy(e.target.checked)}
              />
            }
            label="block proxy"
          />
        </Tooltip>
      </div>
    </div>
  );

  const renderEditorSide = () => (
    <div style={{ width: '60%', height: '100%', position: 'relative' }}>
      {resType === 'obj' && (
        <MonacoEditor
          language="json"
          value={resRef.current}
          defaultValue={resRef.current}
          options={{
            selectOnLineNumbers: true,
            roundedSelection: false,
            cursorStyle: 'line',
            automaticLayout: false,
            theme: 'vs-dark',
            autoIndent: 'full',
            minimap: { enabled: false },
          }}
          height="100%"
          onChange={(item) => {
            if (!item) {
              return;
            }
            setRes(item);
          }}
        />
      )}
      {resType === 'func' && (
        <MonacoEditor
          language="javascript"
          value={execRef.current}
          defaultValue={execRef.current}
          options={{
            selectOnLineNumbers: true,
            roundedSelection: false,
            cursorStyle: 'line',
            automaticLayout: false,
            theme: 'vs-dark',
            autoIndent: 'full',
            minimap: { enabled: false },
          }}
          height="100%"
          onChange={(item) => {
            if (!item) {
              return;
            }
            setExec(item);
          }}
        />
      )}
      {resType === 'proxy' && (
        <TextField
          autoFocus
          value={url}
          required
          margin="dense"
          id="description"
          name="proxy url"
          label="proxy url"
          type="url"
          fullWidth
          variant="outlined"
          onChange={(e) => {
            setUrl(e.target.value);
          }}
          error={!!badSyntaxError}
        />
      )}
      {!!badSyntaxError && (
        <div style={{ position: 'absolute', width: '100%', bottom: '0' }}>
          <Alert severity="error">{badSyntaxError}</Alert>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={open} fullWidth maxWidth="xl" onClose={handleClose}>
      <DialogTitle style={{ display: 'flex', justifyContent: 'space-between' }}>
        {isEdit ? 'Edit' : 'Add'} Response
        {renderTitleName()}
      </DialogTitle>
      <DialogContent style={{ width: '100%', height: '75vh' }}>
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          {renderInputsSide()}
          {renderEditorSide()}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          disabled={hasError || !!badSyntaxError}
          type="submit"
          onClick={handleSave}
        >
          save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
