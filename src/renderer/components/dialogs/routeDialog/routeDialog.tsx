import './routeDialog.css';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import CloseIcon from '@mui/icons-material/Close';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { BUTTONS } from '../../../../consts/analytics';
import { useRouteActions } from '../../../hooks/files';
import { reportButtonClick } from '../../../utils';
import {
  Method,
  ParamType,
  ProjectServer,
  Route,
  RouteParent,
} from '../../../../types';
import { isRouteExist } from '../../../../utils/route';
import {
  createDefaultResponsesHash,
  getDefaultStatusCodesForMethod,
} from '../../../../utils/defaultResponses';

type Props = {
  onClose: Function;
  open: boolean;
  data: Partial<Route> | null;
  parent: RouteParent;
  server: ProjectServer;
};

const METHODS: Method[] = ['delete', 'get', 'patch', 'post', 'put'];
const PARAM_TYPE: ParamType[] = ['body', 'params', 'query'];

export function RouteDialog({ onClose, open, data, parent, server }: Props) {
  const isEdit = !!data?.id;
  const [description, setDescription] = useState<string>(
    data?.description || '',
  );
  const [routePath, setRoutePath] = useState<string>(data?.routePath || '/');
  const [method, setMethod] = useState<Method>(data?.method || 'get');
  const [paramType, setParamType] = useState<ParamType>(
    data?.paramType || 'body',
  );
  const [paramValue, setParamValue] = useState<string>(data?.paramValue || '');
  const [paramKey, setParamKey] = useState<string>(data?.paramKey || '');

  const initWithParams = isEdit
    ? paramKey.length > 0 && paramValue.length > 0
    : data?.withParams || false;
  const [withParams, setWithParams] = useState<boolean>(initWithParams);

  // State for creating default responses (only show for new routes)
  const [createDefaultResponses, setCreateDefaultResponses] =
    useState<boolean>(!isEdit);

  const { updateRoute } = useRouteActions();
  const handleMethodChange = (event: SelectChangeEvent) => {
    setMethod(event.target.value as Method);
  };

  const handleParamTypeChange = (event: SelectChangeEvent) => {
    setParamType(event.target.value as ParamType);
  };

  const handleSave = () => {
    reportButtonClick(BUTTONS.ROUTE_DIALOG_SAVE);

    // Prepare responses hash and active response ID
    let responsesHash = data?.responsesHash || {};
    let activeResponseId = data?.activeResponseId || '';

    // If creating a new route and user wants default responses
    if (!isEdit && createDefaultResponses) {
      const defaultResponsesData = createDefaultResponsesHash(method);
      responsesHash = defaultResponsesData.responsesHash;
      activeResponseId = defaultResponsesData.activeResponseId;
    }

    const newObj: Route = {
      description,
      routePath,
      method,
      activeResponseId,
      responsesHash,
      withParams: withParams && paramKey.length > 0 && paramValue.length > 0,
      paramKey: withParams ? paramKey : null,
      paramType,
      paramValue: withParams ? paramValue : null,
      id: data?.id || uuid(),
    };

    updateRoute(newObj, parent, server);

    onClose();
  };

  const handleClear = () => {
    reportButtonClick(BUTTONS.ROUTE_DIALOG_CLEAR);

    setParamValue('');
    setParamKey('');
  };

  const handleClose = () => {
    reportButtonClick(BUTTONS.ROUTE_DIALOG_CLOSE);
    onClose();
  };

  const alreadyExistError =
    isRouteExist(
      {
        id: data?.id || '',
        routePath,
        method,
        paramKey,
        paramType,
        paramValue,
        description,
        responsesHash: {},
        activeResponseId: '',
        withParams,
      },
      parent,
    ) &&
    !(data?.method === method && data.routePath === routePath && !!data.id);

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{isEdit ? 'Edit' : 'Add'} Route </DialogTitle>
      <DialogContent>
        <Typography>{parent.path}</Typography>
        <div className="path-e-method">
          <FormControl
            style={{ width: '150px', marginRight: '10px', marginTop: '2.5px' }}
          >
            <InputLabel id="demo-simple-select-label">Method</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={method}
              label="Method"
              onChange={handleMethodChange}
              error={alreadyExistError}
            >
              {METHODS.map((type) => {
                return <MenuItem value={type}>{type}</MenuItem>;
              })}
            </Select>
          </FormControl>
          <TextField
            autoFocus
            required
            margin="dense"
            id="routePath"
            name="routePath"
            label="Route path"
            type="text"
            fullWidth
            variant="outlined"
            value={routePath}
            onChange={(e) => {
              setRoutePath(e.target.value);
            }}
            error={alreadyExistError || !routePath.startsWith('/')}
          />
        </div>
        {!!alreadyExistError && (
          <Typography variant="subtitle2" gutterBottom style={{ color: 'red' }}>
            Route with this method already exist, try editing him instead
          </Typography>
        )}
        <TextField
          value={description}
          margin="dense"
          id="description"
          name="description"
          label="description"
          multiline
          maxRows={5}
          type="text"
          fullWidth
          variant="outlined"
          onChange={(e) => {
            setDescription(e.target.value);
          }}
        />

        {!isEdit && (
          <div
            className="default-responses-section"
            style={{ marginTop: '16px', marginBottom: '8px' }}
          >
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={createDefaultResponses}
                    onChange={(event) =>
                      setCreateDefaultResponses(event.target.checked)
                    }
                  />
                }
                label="Create default responses with common status codes"
              />
            </FormGroup>
            <Typography
              color={
                createDefaultResponses ? 'text.secondary' : 'text.disabled'
              }
              variant="body2"
              gutterBottom
              style={{ marginLeft: '14px' }}
            >
              Automatically creates responses for:{' '}
              {getDefaultStatusCodesForMethod(method).join(', ')}
            </Typography>
          </div>
        )}

        <div className="advanced-info">
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={withParams}
                  onChange={(event) => setWithParams(event.target.checked)}
                />
              }
              label="with param matching"
            />
          </FormGroup>
          <Typography
            color={!withParams ? 'gray' : 'main'}
            variant="subtitle2"
            gutterBottom
          >
            you can choose a variable to response only when the variable value
            is equal to the value inserted
          </Typography>
        </div>

        <div className="key-value">
          <FormControl
            disabled={!withParams}
            style={{ width: '330px', marginRight: '10px', marginTop: '3px' }}
          >
            <InputLabel id="paramType-label">Located</InputLabel>
            <Select
              labelId="paramType-label"
              id="paramType"
              value={paramType}
              label="type"
              onChange={handleParamTypeChange}
              error={alreadyExistError}
            >
              {PARAM_TYPE.map((type) => {
                return <MenuItem value={type}>{type}</MenuItem>;
              })}
            </Select>
          </FormControl>
          <TextField
            disabled={!withParams}
            style={{ marginRight: '10px' }}
            margin="dense"
            id="paramKey"
            name="paramKey"
            label="Param key"
            type="text"
            fullWidth
            variant="outlined"
            value={paramKey}
            onChange={(e) => {
              setParamKey(e.target.value);
            }}
          />
          <TextField
            disabled={!withParams}
            margin="dense"
            id="paramValue"
            name="paramValue"
            label="Param value"
            type="text"
            fullWidth
            variant="outlined"
            value={paramValue}
            onChange={(e) => {
              setParamValue(e.target.value);
            }}
          />
          <div style={{ marginLeft: '20px' }}>
            <IconButton
              disabled={!withParams}
              edge="start"
              color="inherit"
              onClick={handleClear}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          type="submit"
          onClick={handleSave}
          disabled={!!alreadyExistError || !routePath.startsWith('/')}
        >
          save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
