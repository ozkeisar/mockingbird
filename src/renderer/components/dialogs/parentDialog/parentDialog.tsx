import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import React, { useState } from 'react';

import Typography from '@mui/material/Typography';
import { v4 as uuid } from 'uuid';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { BUTTONS } from '../../../../consts/analytics';
import { EVENT_KEYS } from '../../../../types/events';
import { useProjectStore } from '../../../state/project';
import {
  emitSocketEvent,
  formatFileName,
  isValidFilename,
  reportButtonClick,
} from '../../../utils';
import {
  GraphQlRouteType,
  ParentType,
  ProjectServer,
  RouteParent,
} from '../../../../types';
import styles from './parentDialog.module.css';
import {
  findMatchedGraphqlParent,
  findMatchedGraphqlRoute,
} from '../../../utils/graphql';

const METHODS: GraphQlRouteType[] = ['Query', 'Mutation'];

type Props = {
  onClose: Function;
  open: boolean;
  data: Partial<RouteParent> | null;
  defaultServerName?: string;
};

export function ParentDialog({
  onClose,
  open,
  data,
  defaultServerName,
}: Props) {
  const { serversHash, activeProjectName } = useProjectStore();

  const [filename, setFilename] = useState<string>(data?.filename || '');
  const [name, setName] = useState<string>(data?.name || '');
  const [type, setType] = useState<ParentType>(data?.type || 'Rest');
  const [restPath, setRestPath] = useState<string>(data?.path || '/');
  const [schemaPath, setSchemaPath] = useState<string>(data?.schemaPath || '');
  const [graphqlQueriesType, setGraphqlQueriesType] =
    useState<GraphQlRouteType>(data?.graphqlQueriesType || 'Query');
  const [selectedServer, setSelectedServer] = useState<ProjectServer>(
    serversHash[defaultServerName || Object.keys(serversHash)[0]],
  );
  const isEdit = !!data?.id;
  const isGraphQl = type === 'GraphQl';

  const { filenames, paths, graphQlNames, restPaths, graphQlPaths } =
    Object.values(selectedServer.parentRoutesHash || {}).reduce(
      (acc, parent) => {
        acc.filenames.push(parent.filename.toLowerCase());
        acc.paths.push(parent.path.toLowerCase());

        if (parent.type === 'GraphQl') {
          acc.graphQlPaths.push(parent.path.toLowerCase());
        } else {
          acc.restPaths.push(parent.path.toLowerCase());
        }
        if (parent.name) {
          acc.graphQlNames.push(parent.name.toLowerCase());
        }

        return acc;
      },
      {
        filenames: [],
        paths: [],
        graphQlNames: [],
        restPaths: [],
        graphQlPaths: [],
      } as {
        filenames: string[];
        paths: string[];
        restPaths: string[];
        graphQlPaths: string[];
        graphQlNames: string[];
      },
    );

  const [graphqlPath, setGraphqlPath] = useState<string>(
    data?.path || graphQlPaths[0] || '/graphql',
  );

  const filenameAlreadyExist =
    filenames?.includes(filename.toLowerCase()) &&
    data?.filename?.toLowerCase() !== filename.toLowerCase();
  const nameAlreadyExist =
    graphQlNames?.includes(name.toLowerCase()) &&
    data?.name?.toLowerCase() !== name.toLowerCase();
  const pathAlreadyExist =
    paths?.includes(restPath.toLowerCase()) &&
    data?.path?.toLowerCase() !== restPath.toLowerCase();
  const restPathAlreadyExist =
    restPaths?.includes(graphqlPath.toLowerCase()) &&
    data?.path?.toLowerCase() !== graphqlPath.toLowerCase();

  const matchedParent = findMatchedGraphqlParent(
    schemaPath || '',
    graphqlPath,
    graphqlQueriesType,
    selectedServer,
  );
  const matchedQueries = findMatchedGraphqlRoute(
    schemaPath || '',
    graphqlPath,
    graphqlQueriesType,
    selectedServer,
  );

  const schemaAlreadyExistError =
    (!!matchedQueries ||
      (!!matchedParent &&
        (!isEdit || (isEdit && data?.id !== matchedParent?.id)))) &&
    !!schemaPath;

  const isSaveBtnDisabled =
    filename.length < 1 ||
    !!filenameAlreadyExist ||
    (isGraphQl ? !restPath.startsWith('/') : !graphqlPath.startsWith('/')) ||
    (isGraphQl ? restPathAlreadyExist : pathAlreadyExist) ||
    (isGraphQl && schemaAlreadyExistError);

  const handleSave = () => {
    reportButtonClick(BUTTONS.PARENT_DIALOG_SAVE);

    const content: RouteParent = {
      id: data?.id || uuid(),
      filename,
      path: isGraphQl ? graphqlPath : restPath,
      routesHash: data?.routesHash || {},
      graphQlRouteHash: data?.graphQlRouteHash || {},
      type,
      name: name.trim(),
      schemaPath,
      graphqlQueriesType,
    };

    emitSocketEvent(EVENT_KEYS.UPDATE_ROUTES_FILE, {
      content,
      filename,
      projectName: activeProjectName,
      serverName: selectedServer.name,
    });

    onClose();
  };

  const handleClose = () => {
    reportButtonClick(BUTTONS.PARENT_DIALOG_CLOSE);
    onClose();
  };

  const handleTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    _type: ParentType,
  ) => {
    if (_type) {
      setType(_type);
    }
  };

  const handleNameChanged = (e: any) => {
    setName(e.target.value);

    if (
      (filename.length === 0 || e.target.value.includes(filename)) &&
      !isEdit
    ) {
      setFilename(formatFileName(e.target.value));
    }
  };

  const handleSchemaPathChanged = (e: any) => {
    setSchemaPath(e.target.value);
  };

  const handleRestPathChanged = (e: any) => {
    setRestPath(e.target.value);

    if (
      (!isEdit && filename.length === 0) ||
      e.target.value.includes(filename)
    ) {
      setFilename(formatFileName(e.target.value));
    }
  };

  const handleServerChange = (event: SelectChangeEvent) => {
    setSelectedServer(serversHash[event.target.value]);
  };

  const handleMethodChange = (event: SelectChangeEvent) => {
    setGraphqlQueriesType(event.target.value as GraphQlRouteType);
  };

  const renderRestType = () => {
    return (
      <>
        <TextField
          autoFocus
          required
          margin="dense"
          id="path"
          name="path"
          label="path"
          type="text"
          fullWidth
          variant="outlined"
          value={restPath}
          onChange={handleRestPathChanged}
          error={!!pathAlreadyExist || !restPath.startsWith('/')}
        />

        {!!pathAlreadyExist && (
          <Typography variant="subtitle2" gutterBottom style={{ color: 'red' }}>
            Path already exist!
          </Typography>
        )}
      </>
    );
  };

  const renderGraphQlType = () => {
    return (
      <>
        <div style={{ display: 'flex', gap: '10px' }}>
          <FormControl
            disabled={isEdit}
            required
            style={{ width: '150px', marginRight: '10px', marginTop: '8px' }}
          >
            <InputLabel id="demo-simple-select-label">Method</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={graphqlQueriesType || ''}
              label="Method"
              onChange={handleMethodChange}
              error={schemaAlreadyExistError}
            >
              {METHODS.map((_type) => {
                return <MenuItem value={_type}>{_type}</MenuItem>;
              })}
            </Select>
          </FormControl>

          <TextField
            autoFocus
            required
            margin="dense"
            id="path"
            name="path"
            label="path"
            type="text"
            fullWidth
            variant="filled"
            value={graphqlPath}
            onChange={(e) => {
              setGraphqlPath(e.target.value);
            }}
            error={!!pathAlreadyExist || !graphqlPath.startsWith('/')}
          />
        </div>

        <TextField
          autoFocus
          margin="dense"
          id="schema path"
          name="schema path"
          label="schema path"
          placeholder="path.to.queries"
          type="text"
          fullWidth
          variant="outlined"
          value={schemaPath}
          onChange={handleSchemaPathChanged}
          error={schemaAlreadyExistError}
        />
        {!!restPathAlreadyExist && (
          <Typography variant="subtitle2" gutterBottom style={{ color: 'red' }}>
            This path is taken!
          </Typography>
        )}
        {!!matchedParent && schemaAlreadyExistError && (
          <Typography variant="subtitle2" gutterBottom style={{ color: 'red' }}>
            Parent {matchedParent.name} have same Schema path
          </Typography>
        )}
        {!!matchedQueries && schemaAlreadyExistError && (
          <Typography variant="subtitle2" gutterBottom style={{ color: 'red' }}>
            {matchedQueries.type} {matchedQueries.name} have same Schema path
          </Typography>
        )}

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
          onChange={handleNameChanged}
          error={!!nameAlreadyExist}
        />

        {!!nameAlreadyExist && (
          <Typography variant="subtitle2" gutterBottom style={{ color: 'red' }}>
            This name is taken!
          </Typography>
        )}
      </>
    );
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{isEdit ? 'Edit' : 'Add'} Parent</DialogTitle>
      <DialogContent style={{ width: '490px' }}>
        <div className={styles.toggleContainer}>
          <FormControl
            disabled
            variant="filled"
            style={{ maxWidth: '49%', minWidth: '39%' }}
          >
            <InputLabel id="demo-simple-select-label">Server</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={selectedServer.name}
              label="Method"
              onChange={handleServerChange}
            >
              {Object.values(serversHash).map((server) => {
                return <MenuItem value={server.name}>{server.name}</MenuItem>;
              })}
            </Select>
          </FormControl>
          <ToggleButtonGroup value={type} exclusive onChange={handleTypeChange}>
            <ToggleButton
              className={styles.toggle}
              value="Rest"
              aria-label="Rest"
            >
              Rest
            </ToggleButton>
            <ToggleButton
              className={styles.toggle}
              value="GraphQl"
              aria-label="GraphQl"
            >
              GraphQl
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
        {type === 'Rest' ? renderRestType() : renderGraphQlType()}
        <TextField
          disabled={isEdit}
          value={filename}
          required
          margin="dense"
          id="filename"
          name="filename"
          label="filename"
          type="text"
          fullWidth
          variant="outlined"
          onChange={(e) => {
            if (
              isValidFilename(e.target.value) ||
              e.target.value.length === 0
            ) {
              setFilename(e.target.value);
            }
          }}
          error={!!filenameAlreadyExist}
        />
        {!!filenameAlreadyExist && (
          <Typography variant="subtitle2" gutterBottom style={{ color: 'red' }}>
            Filename already exist!
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit" onClick={handleSave} disabled={isSaveBtnDisabled}>
          save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
