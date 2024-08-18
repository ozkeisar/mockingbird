import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Alert from '@mui/material/Alert';
import { v4 as uuid } from 'uuid';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import Typography from '@mui/material/Typography';
import { Fab, Tooltip } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import toJsonSchema from 'to-json-schema';
import { buildSchema, GraphQLError } from 'graphql';
import MonacoEditor from 'react-monaco-editor';
import {
  prepareObjectToSchema,
  getGraphqlRouteBGColor,
  reportButtonClick,
  combineNestedObjects,
} from '../../../utils';
import { useResponseActions } from '../../../hooks/files';
import { BUTTONS } from '../../../../consts/analytics';
import { getGraphqlSchemaFromJsonSchema } from '../../../../utils/jsonToSchema';
import { validateGraphQLType } from '../../../utils/graphql';
import {
  GraphQlRoute,
  GraphQlRouteResponse,
  ProjectServer,
  ResponseType,
  RouteParent,
} from '../../../../types';

function isValidGraphQLSchema(schemaString: string) {
  try {
    buildSchema(schemaString);
    return { isSchemaValid: true, errorMessage: null };
  } catch (error) {
    if (error instanceof GraphQLError) {
      console.error('GraphQL Schema Error:', error.message);
      return { isSchemaValid: false, errorMessage: error.message };
    }
    console.error('Unexpected error:', error);
    return { isSchemaValid: false, errorMessage: 'response types are invalid' };
  }
}

const getResponseTypeName = (resType: ResponseType) => {
  switch (resType) {
    case 'func':
      return 'Function';
    case 'obj':
      return 'JSON';
    case 'proxy':
      return 'Proxy';
    default:
      return null;
  }
};

type Props = {
  onClose: Function;
  open: boolean;
  data: Partial<GraphQlRouteResponse> | null;
  parent: RouteParent;
  route: GraphQlRoute;
  server: ProjectServer;
};
// eslint-disable-next-line no-useless-escape
const urlRegex = /^(https?|ftp):\/\/(-\.)?([^\s/?\.#-]+\.?)+([^\s]*)$/i;

export function GraphqlResponseDialog({
  onClose,
  open,
  data,
  parent,
  route,
  server,
}: Props) {
  const [resType, setResType] = useState<ResponseType>(data?.type || 'obj');
  const [name, setName] = useState<string>(data?.name || '');
  const schemaRef = useRef(data?.schema || '');
  const [schema, setSchema] = useState<string>(schemaRef.current);
  const [description, setDescription] = useState<string>(
    data?.description || '',
  );
  const [schemaTypeName, setSchemaTypeName] = useState<string>(
    data?.schemaTypeName || '',
  );
  const execRef = useRef(
    data?.exec || '(arg, context, info) => {\n\treturn {\n\t\t\n\t}\n}',
  );
  const [exec, setExec] = useState(execRef.current);
  const resRef = useRef(JSON.stringify(data?.res || {}, null, 2));
  const [res, setRes] = useState(resRef.current);
  const [url, setUrl] = useState<string | null>(data?.url || 'http://');
  const [badSyntaxError, setBadSyntaxError] = useState<string | null>(null);
  const [typesSyntaxError, setTypesSyntaxError] = useState<string | null>(null);
  const existingNames = Object.values(route.responsesHash || {}).map(
    (item) => item.name,
  );
  const { createResponse, updateResponse } = useResponseActions();
  const isEdit = !!data?.id;

  const isSchemaTypeNameValid = validateGraphQLType(schemaTypeName, schema);

  const isDataValid = useCallback(() => {
    try {
      if (resType === 'func') {
        // eslint-disable-next-line no-eval
        eval(exec);
        setBadSyntaxError(null);
      } else if (resType === 'obj') {
        const resObj = JSON.parse(res);
        if (Object.keys(resObj).length < 1) {
          setBadSyntaxError('Object must contain at least one property');
          return false;
        }
        if (Object.keys(resObj).some((key) => key.length < 1)) {
          setBadSyntaxError('Object key must contain at least one character');
          return false;
        }
        setBadSyntaxError(null);
        return true;
      } else if (resType === 'proxy') {
        const isValidUrl = urlRegex.test(url || '');
        if (!isValidUrl) {
          setBadSyntaxError('url is invalid');
          return false;
        }
        setBadSyntaxError(null);
        return true;
      }
      return true;
    } catch (error) {
      console.log('---', error);
      setBadSyntaxError('Response data is invalid');
      return false;
    }
  }, [setBadSyntaxError, url, res, resType, exec]);

  useEffect(() => {
    if (badSyntaxError) {
      isDataValid();
    }
  }, [isDataValid, badSyntaxError]);

  useEffect(() => {
    const { errorMessage } = isValidGraphQLSchema(schema);
    setTypesSyntaxError(errorMessage);
  }, [setTypesSyntaxError, schema]);

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
      if (!isDataValid()) {
        enqueueSnackbar('Response data is not valid', { variant: 'error' });

        return;
      }

      const resToSave = resType === 'obj' ? JSON.parse(res) : data?.res;

      const responseData: GraphQlRouteResponse = {
        id: data?.id || uuid(),
        name,
        description,
        res: resToSave,
        exec: resType === 'func' ? exec : data?.exec || null,
        url: resType === 'proxy' ? url : data?.url || null,
        type: resType,
        schema,
        schemaTypeName,
      };

      if (isNewResponse) {
        createResponse(server, parent, route, responseData);
      } else {
        updateResponse(server, parent, route, responseData);
      }
      onClose();
    } catch (error) {
      console.log('error', error);
      enqueueSnackbar('Fail to save response', { variant: 'error' });
      setBadSyntaxError('Response data is invalid');
    }
  };

  const handleClose = () => {
    reportButtonClick(BUTTONS.RESPONSE_DIALOG_CLOSE);

    onClose();
  };

  const generateTypes = (response: string) => {
    const names = route.name.split('(');
    const schemaPathArr = parent.schemaPath?.split('.');
    const schemaPath = schemaPathArr?.join('_');
    const nameArr = [parent.graphqlQueriesType || '', names[0]];
    if (schemaPath && schemaPath?.length > 0) {
      nameArr.push(schemaPath);
    }
    const rootName = nameArr
      .map((word): string => `${word[0].toUpperCase()}${word.slice(1)}`)
      .join('_');

    const combinedObject = combineNestedObjects(JSON.parse(response));

    const preparedObject = prepareObjectToSchema(combinedObject);

    const jsonSchemaObject = toJsonSchema(preparedObject) as any;

    const schemaArr = getGraphqlSchemaFromJsonSchema({
      rootName,
      schema: jsonSchemaObject,
    });

    return {
      types: schemaArr.typeDefinitions.join('\n'),
      typeName: schemaArr.typeName,
    };
  };

  const handleGenerateTypes = () => {
    const { types, typeName } = generateTypes(res);
    setSchema(types);
    setSchemaTypeName(typeName);
  };

  const hasError = existingNames?.includes(name) && data?.name !== name;

  const renderTitle = () => (
    <DialogTitle style={{ display: 'flex', justifyContent: 'space-between' }}>
      {isEdit ? 'Edit' : 'Add'} Response
      <div className="route-header-title">
        {!!route?.type && (
          <div
            className="route-method"
            style={{ backgroundColor: getGraphqlRouteBGColor(route.type) }}
          >
            {route.type}
          </div>
        )}
        <Typography variant="h5">{route?.name}</Typography>
      </div>
    </DialogTitle>
  );

  const renderInputSide = () => (
    <div style={{ width: '28%', height: '100%' }}>
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
        multiline
        minRows={2}
        maxRows={5}
        onChange={(e) => {
          setDescription(e.target.value);
        }}
      />

      <TextField
        value={schemaTypeName}
        margin="dense"
        id="schemaTypeName"
        name="response type"
        label="response type"
        type="text"
        fullWidth
        variant="outlined"
        error={!isSchemaTypeNameValid && !typesSyntaxError}
        onChange={(e) => {
          setSchemaTypeName(e.target.value);
        }}
      />
      {!isSchemaTypeNameValid && !typesSyntaxError && (
        <Typography color="error" variant="body2">
          response type name doesn't exist in response type
        </Typography>
      )}

      <ToggleButtonGroup
        value={resType}
        exclusive
        onChange={handleAlignment}
        aria-label="text alignment"
        className="radio-group"
      >
        <ToggleButton value="func">Function</ToggleButton>
        <ToggleButton value="obj">JSON</ToggleButton>
        <ToggleButton value="proxy">Proxy</ToggleButton>
      </ToggleButtonGroup>
    </div>
  );

  const renderResponseEditor = () => (
    <div style={{ width: '35%', height: '100%', position: 'relative' }}>
      <div>
        <Typography variant="subtitle1">
          Response {getResponseTypeName(resType)}
        </Typography>
      </div>
      {resType === 'obj' && (
        <MonacoEditor
          language="json"
          value={res}
          theme="vs-dark"
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
          value={exec}
          theme="vs-dark"
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

      {resType === 'obj' && !badSyntaxError && (
        <Tooltip arrow placement="top" title="generate response type">
          <Fab
            style={{
              position: 'absolute',
              bottom: 10,
              left: 10,
              backgroundColor: '#805231',
            }}
            onClick={handleGenerateTypes}
            variant="extended"
            aria-label="generate"
          >
            <AutoFixHighIcon color="action" />
            <Typography
              variant="body1"
              style={{
                color: 'white',
                marginLeft: 5,
                textTransform: 'capitalize',
              }}
            >
              Generate
            </Typography>
          </Fab>
        </Tooltip>
      )}
    </div>
  );

  const renderTypesEditor = () => (
    <div style={{ width: '35%', height: '100%', position: 'relative' }}>
      <div>
        <Typography variant="subtitle1">Response type</Typography>
      </div>

      <MonacoEditor
        language="graphql"
        value={schema}
        theme="vs-dark"
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
          setSchema(item);
        }}
      />
      {!!typesSyntaxError && (
        <div style={{ position: 'absolute', width: '100%', bottom: '0' }}>
          <Alert severity="error">{typesSyntaxError}</Alert>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={open} maxWidth="xl" fullWidth onClose={handleClose}>
      {renderTitle()}
      <DialogContent style={{ width: '100%', height: '75vh' }}>
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            overflow: 'hidden',
            justifyContent: 'space-between',
          }}
        >
          {renderInputSide()}
          {renderResponseEditor()}
          {renderTypesEditor()}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          disabled={
            hasError ||
            !!badSyntaxError ||
            !!typesSyntaxError ||
            !isSchemaTypeNameValid ||
            name.length < 1
          }
          type="submit"
          onClick={handleSave}
        >
          save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
