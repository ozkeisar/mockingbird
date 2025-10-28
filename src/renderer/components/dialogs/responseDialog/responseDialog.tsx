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
import { Tooltip, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useResponseActions } from '../../../hooks/files';
import { BUTTONS } from '../../../../consts/analytics';
import { getRouteBGColor, reportButtonClick, emitSocketEvent } from '../../../utils';
import {
  ProjectServer,
  ResponseType,
  Route,
  RouteParent,
  RouteResponse,
} from '../../../../types';
import { SideEffect } from '../../../../types/sideEffects';
import { SideEffectsList } from '../../sideEffects/SideEffectsList';
import { SideEffectDialog } from '../../sideEffects/SideEffectDialog';
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
  const [sideEffects, setSideEffects] = useState<SideEffect[]>(data?.sideEffects || []);
  const [sideEffectDialogOpen, setSideEffectDialogOpen] = useState(false);
  const [editingSideEffect, setEditingSideEffect] = useState<SideEffect | null>(null);
  const existingNames = Object.values(route.responsesHash || {}).map(
    (item) => item.name,
  );
  const { createResponse, updateResponse } = useResponseActions();
  const { activeProjectName } = useProjectStore();
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

  const handleSave = () => {
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
        sideEffects: sideEffects.length > 0 ? sideEffects : undefined,
      };

      if (isNewResponse) {
        createResponse(server, parent, route, responseData);
      } else {
        updateResponse(server, parent, route, responseData);
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

  // Side Effects handlers
  const handleAddSideEffect = () => {
    setEditingSideEffect(null);
    setSideEffectDialogOpen(true);
  };

  const handleEditSideEffect = (id: string) => {
    const effect = sideEffects.find(e => e.id === id);
    if (effect) {
      setEditingSideEffect(effect);
      setSideEffectDialogOpen(true);
    }
  };

  const handleDeleteSideEffect = (id: string) => {
    setSideEffects(sideEffects.filter(e => e.id !== id));
  };

  const handleToggleSideEffect = (id: string) => {
    setSideEffects(sideEffects.map(e => 
      e.id === id ? { ...e, enabled: !e.enabled } : e
    ));
  };

  const handleTestSideEffect = async (sideEffect: SideEffect) => {
    try {
      const response = await fetch('/side-effects/test-side-effect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sideEffect,
          serverName: server.name
        })
      });
      const result = await response.json();
      if (!result.success) {
        console.error('Test failed:', result.error);
      }
    } catch (error) {
      console.error('Failed to test side effect:', error);
    }
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
      
      <Accordion style={{ marginTop: '20px' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>
            Side Effects {sideEffects.length > 0 && `(${sideEffects.length})`}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <SideEffectsList
            sideEffects={sideEffects}
            onAdd={handleAddSideEffect}
            onEdit={handleEditSideEffect}
            onDelete={handleDeleteSideEffect}
            onToggle={handleToggleSideEffect}
            onTest={handleTestSideEffect}
          />
        </AccordionDetails>
      </Accordion>
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
      
      {sideEffectDialogOpen && (
        <SideEffectDialog
          open={sideEffectDialogOpen}
          onClose={() => {
            setSideEffectDialogOpen(false);
            setEditingSideEffect(null);
          }}
          onSave={(sideEffect) => {
            if (editingSideEffect) {
              // Update existing side effect
              setSideEffects(sideEffects.map(e =>
                e.id === sideEffect.id ? sideEffect : e
              ));
            } else {
              // Add new side effect
              setSideEffects([...sideEffects, sideEffect]);
            }
            setSideEffectDialogOpen(false);
            setEditingSideEffect(null);
          }}
          data={editingSideEffect}
          serverName={server.name}
        />
      )}
    </Dialog>
  );
}
