import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import Typography from '@mui/material/Typography';
import { enqueueSnackbar } from 'notistack';
import { reportButtonClick } from '../../../utils';
import { useRouteActions } from '../../../hooks/files';
import { BUTTONS } from '../../../../consts/analytics';
import {
  GraphQlRoute,
  GraphQlRouteType,
  ProjectServer,
  RouteParent,
} from '../../../../types';
import {
  getNonNativeTypesFromSignature,
} from '../../../utils/graphql';
import { findMatchedGraphqlParent } from '../../../../utils/parent';

type Props = {
  onClose: Function;
  open: boolean;
  data: Partial<GraphQlRoute> | null;
  parent: RouteParent;
  server: ProjectServer;
};

const METHODS: GraphQlRouteType[] = ['Query', 'Mutation'];

export function GraphqlRouteDialog({
  onClose,
  open,
  data,
  parent,
  server,
}: Props) {
  const [description, setDescription] = useState<string>(
    data?.description || '',
  );
  const [name, setName] = useState<string>(data?.name || '');
  const [type, setType] = useState<GraphQlRouteType | null>(
    data?.type || parent.graphqlQueriesType,
  );
  const [selectedParent, setSelectedParent] = useState<RouteParent>(
    parent || Object.values(server.parentRoutesHash)[0],
  );

  const isEdit = !!data?.id;

  const schemaPath =
    (parent.schemaPath?.length || 0) > 0
      ? `${parent.schemaPath}.${name}`
      : name;
  const matchedParent = findMatchedGraphqlParent(
    schemaPath,
    parent.path,
    parent.graphqlQueriesType,
    server,
  );

  const matchedQuery = Object.values(parent.graphQlRouteHash || {}).find(
    (item) => item.name === name,
  );

  const alreadyExistError = !(isEdit && name === data?.name) && !!matchedQuery;

  const disableSaveBtn = !name.length || alreadyExistError || !!matchedParent;

  const nonNativeTypes = getNonNativeTypesFromSignature(name);

  const customTypeError = nonNativeTypes?.length > 0;

  const { updateRoute } = useRouteActions();
  const handleMethodChange = (event: SelectChangeEvent) => {
    setType(event.target.value as GraphQlRouteType);
  };

  const handleSave = () => {
    reportButtonClick(BUTTONS.ROUTE_DIALOG_SAVE);

    if (!type) {
      enqueueSnackbar('Query Type can`t be null', { variant: 'error' });
      return;
    }
    const newObj: GraphQlRoute = {
      id: data?.id || uuid(),
      type,
      name: name.trim(),
      description,
      activeResponseId: data?.activeResponseId || '',
      responsesHash: data?.responsesHash || {},
    };

    updateRoute(newObj, parent, server);

    onClose();
  };

  const handleClose = () => {
    reportButtonClick(BUTTONS.ROUTE_DIALOG_CLOSE);
    onClose();
  };

  const handleParentChange = (event: SelectChangeEvent) => {
    setSelectedParent(server.parentRoutesHash[event.target.value]);
  };
  return (
    <Dialog open={open} maxWidth="xl" onClose={handleClose}>
      <DialogTitle>{isEdit ? 'Edit' : 'Add'} graphQL Route </DialogTitle>
      <DialogContent style={{ minWidth: '700px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <FormControl
            disabled
            variant="filled"
            style={{
              width: '150px',
              marginBottom: '10px',
              marginRight: '13px',
            }}
          >
            <InputLabel id="demo-simple-select-label">Parent</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={selectedParent.id}
              label="Method"
              onChange={handleParentChange}
            >
              {Object.values(server.parentRoutesHash).map((_parent) => {
                return <MenuItem value={_parent.id}>{_parent.name}</MenuItem>;
              })}
            </Select>
          </FormControl>
          <FormControl
            variant="filled"
            disabled
            style={{
              width: '150px',
              marginRight: '10px',
              marginBottom: '10px',
            }}
          >
            <InputLabel id="demo-simple-select-label">Method</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={type || ''}
              label="Method"
              onChange={handleMethodChange}
              error={alreadyExistError}
            >
              {METHODS.map((_type) => {
                return <MenuItem value={_type}>{_type}</MenuItem>;
              })}
            </Select>
          </FormControl>
        </div>
        <div className="path-e-method">
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="name"
            label={`${type} name`}
            type="text"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            error={alreadyExistError || (!!matchedParent && name.length > 0)}
          />
        </div>
        {!!alreadyExistError && (
          <Typography variant="subtitle2" gutterBottom style={{ color: 'red' }}>
            name already exist
          </Typography>
        )}
        {!!matchedParent && name.length > 0 && (
          <Typography variant="subtitle2" gutterBottom style={{ color: 'red' }}>
            Schema path already exist on {matchedParent.name}
          </Typography>
        )}
        {!!customTypeError && (
          <Typography
            variant="subtitle2"
            gutterBottom
            style={{ color: 'yellow' }}
          >
            types '{nonNativeTypes.join(',')}' not exists, change to type 'Any'.
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
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit" onClick={handleSave} disabled={disableSaveBtn}>
          save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
