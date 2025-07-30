import React, { useEffect, useRef, useState } from 'react';
import JsonView from '@uiw/react-json-view';
import { vscodeTheme } from '@uiw/react-json-view/vscode';
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Checkbox,
} from '@mui/material';
import { parse } from 'graphql';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  GraphQlRoute,
  GraphQlRouteResponse,
  GraphQlRouteType,
  Method,
  RouteParent,
  ServerLog,
  ServerLogType,
} from '../../../../types';
import styles from './graphqlLogRow.module.css';
import {
  formatDate,
  getGraphqlRouteBGColor,
  ParsedQuery,
  removeLastPartOfUri,
  reportButtonClick,
  reportElementClick,
} from '../../../utils';
import { useProjectStore } from '../../../state/project';
import { BUTTONS, ELEMENTS } from '../../../../consts/analytics';
import {
  constructObject,
  determineQueryType,
  extractVariables,
  findAllParents,
  findParentTest,
  QueryData,
} from '../../../utils/graphql';
import { useGeneralStore } from '../../../state';

const getBGColor = (type: ServerLogType) => {
  switch (type) {
    case 'error':
      return '#AC393B';

    case 'local':
      return '#19437D';

    case 'proxy':
      return '#511D66';

    default:
      return 'yellow';
  }
};

function getObjectByPath(obj: any, path: string) {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (!current || typeof current !== 'object') {
      return undefined;
    }
    const rawKey = key.split('(')[0];
    current = current[rawKey];
  }

  return current;
}

type props = {
  data: ServerLog[];
  index: number;
  setSize: (index: number, height: number) => void;
  windowWidth: number;
  onRowClick: (id: string) => void;
  openRows: { [key: string]: boolean };
  selectedLogIds?: Set<string>;
  onLogSelection?: (logId: string, selected: boolean) => void;
  onAddParentClick: ({
    serverName,
    data,
  }: {
    data: Partial<RouteParent>;
    serverName?: string;
  }) => void;
  onAddQueryClick: ({
    data,
    matchedParent,
  }: {
    data: Partial<GraphQlRoute>;
    matchedParent: RouteParent;
    serverName: string;
  }) => void;
  onAddQueryResponseClick: ({
    data,
    matchedParent,
    matchedRoute,
    serverName,
  }: {
    serverName: string;
    matchedParent: RouteParent;
    matchedRoute: GraphQlRoute;
    data: Partial<GraphQlRouteResponse>;
  }) => void;
};

export function GraphqlLogRow({
  openRows,
  data,
  index,
  setSize,
  windowWidth,
  onRowClick,
  selectedLogIds = new Set(),
  onLogSelection,
  onAddParentClick,
  onAddQueryClick,
  onAddQueryResponseClick,
}: props) {
  const { serversHash } = useProjectStore();
  const { setSelectedRoute } = useGeneralStore();

  const rowRef = useRef<any>(null);
  const logData = data[data.length - index - 1];
  const [isOpen, setIsOpen] = useState(!!openRows[logData.metadata.id]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [menuType, setMenuType] = useState<
    'parent' | 'route' | 'response' | null
  >(null);
  const time = new Date(logData.timestamp);
  const requestUrl = logData.request.url;
  const requestMethod = logData.request.method.toLowerCase() as Method;
  const { serverName } = logData.metadata;
  const { type } = logData.metadata;

  const server = serversHash[serverName];

  const queryType = determineQueryType(
    logData.request.body.query,
  ) as GraphQlRouteType;
  const parsedQueryObj = parse(logData.request.body.query);
  const queryObj = constructObject(
    parsedQueryObj,
    extractVariables(parsedQueryObj),
  );
  const queriesData = findParentTest(
    queryObj,
    '',
    '',
    requestUrl,
    queryType,
    0,
    server,
  );
  const { parents, responses, routes } = findAllParents(
    queryObj,
    '',
    '',
    requestUrl,
    queryType,
    0,
    server,
  );

  const isSelected = selectedLogIds.has(logData.metadata.id);

  useEffect(() => {
    setSize(index, rowRef?.current?.getBoundingClientRect().height);
  }, [setSize, index, windowWidth, isOpen]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (onLogSelection) {
      onLogSelection(logData.metadata.id, e.target.checked);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (
    event: React.MouseEvent<HTMLLIElement | HTMLButtonElement>,
  ) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  const handleAddParentClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuType('parent');
    handleClick(event);
  };

  const handleAddRouteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuType('route');
    handleClick(event);
  };

  const handleAddResponseClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setMenuType('response');
    handleClick(event);
  };

  const handleAddResponse = (
    event: React.MouseEvent<HTMLLIElement | HTMLButtonElement>,
    item: QueryData | undefined,
  ) => {
    reportButtonClick(BUTTONS.CONSOLE_LOG_ROW_ADD_RESPONSE);
    handleClose(event);

    if (!item?.parent || !item?.route || !server) {
      return;
    }
    const resPath =
      item.schemaPath?.length > 0 ? `${item.schemaPath}.${item.key}` : item.key;
    onAddQueryResponseClick({
      serverName: server?.name,
      matchedParent: item.parent,
      matchedRoute: item.route,
      data: {
        name: '',
        description: '',
        res: getObjectByPath(logData.response?.data?.data, resPath) || {},
        type: 'obj',
        url: null,
        exec: null,
      },
    });
  };

  const handleAddParent = (
    event: React.MouseEvent<HTMLLIElement | HTMLButtonElement>,
    item: ParsedQuery,
  ) => {
    reportButtonClick(BUTTONS.CONSOLE_LOG_ROW_ADD_PARENT);
    handleClose(event);

    const path = removeLastPartOfUri(requestUrl);
    const name =
      item.schemaPath?.split('.')?.pop?.()?.split('(')[0] || item.key;
    onAddParentClick({
      data: {
        path,
        name,
        schemaPath: item.schemaPath,
        graphqlQueriesType: queryType,
        type: 'GraphQl',
        filename: name,
      },
      serverName: server?.name,
    });
  };

  const handleAddRoute = (
    event: React.MouseEvent<HTMLLIElement | HTMLButtonElement>,
    item: QueryData,
  ) => {
    reportButtonClick(BUTTONS.CONSOLE_LOG_ROW_ADD_ROUTE);
    handleClose(event);

    if (!item.parent || !server) {
      return;
    }

    onAddQueryClick({
      serverName: server?.name,
      matchedParent: item.parent,
      data: {
        type: queryType,
        activeResponseId: '',
        responsesHash: {},
        name: item.key,
        description: 'created from proxy call',
      },
    });
  };

  return (
    <div
      ref={rowRef}
      style={{
        fontFamily: 'system-ui',
        boxSizing: 'border-box',
        border: '1px solid #222',
      }}
    >
      <div
        className="collapse-header"
        onClick={() => {
          reportElementClick(ELEMENTS.CONSOLE_LOG_ROW, { isOpen: !isOpen });
          setIsOpen((prev) => !prev);
          onRowClick(logData.metadata.id);
        }}
      >
        <div className="type-e-url">
          <Checkbox
            size="small"
            checked={isSelected}
            onChange={handleCheckboxChange}
            onClick={handleCheckboxClick}
            sx={{ mr: 1 }}
            disabled
          />
          <div className="type" style={{ backgroundColor: getBGColor(type) }}>
            {type}
            <div
              style={{
                position: 'absolute',
                fontSize: '10px',
                backgroundColor: 'gray',
                top: '-5px',
                right: '-6px',
                borderRadius: '6px',
                padding: '0 2px',
              }}
            >
              {logData.response.status}
            </div>
          </div>
          <div
            className={styles.queryType}
            style={{ backgroundColor: getGraphqlRouteBGColor(queryType) }}
          >
            {queryType}
          </div>
          <div>
            <div
              style={{
                display: 'flex',
                gap: '10px',
                fontSize: '10px',
                lineHeight: '10px',
                marginBottom: '-2px',
              }}
            >
              <div>{requestMethod}</div>
              <div>{logData.metadata.serverName}</div>
              <div>{logData.request.url}</div>
            </div>
            <div style={{ display: 'flex' }}>
              {queriesData.map((queryData) => {
                return (
                  <>
                    <Tooltip title={`${queryData.schemaPath}.${queryData.key}`}>
                      <div className={styles.queryName}>{queryData.key}</div>
                    </Tooltip>
                    {!!queryData.parent && !!queryData.route && (
                      <Tooltip title="open route">
                        <IconButton
                          edge="start"
                          color="inherit"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (queryData.parent?.id && queryData.route?.id) {
                              setSelectedRoute({
                                serverName,
                                parentId: queryData.parent.id,
                                routeId: queryData.route.id,
                              });
                            }
                          }}
                          aria-label="close"
                          size="small"
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </>
                );
              })}
            </div>
          </div>
        </div>
        <div className="time-e-add">
          {queriesData.some((item) => !item.parent) && (
            <Button
              variant="text"
              color="inherit"
              onClick={handleAddParentClick}
            >
              add parent
            </Button>
          )}
          {queriesData.some((item) => !item.parent || !item.route) && (
            <Button
              variant="text"
              color="inherit"
              onClick={handleAddRouteClick}
              disabled={!routes.length}
            >
              add {queryType}
            </Button>
          )}
          <Button
            variant="text"
            color="inherit"
            onClick={handleAddResponseClick}
            disabled={queriesData.every((item) => !item.parent || !item.route)}
          >
            Add Response
          </Button>
          <div className="time">{formatDate(time)}</div>
        </div>
      </div>
      <Menu
        id="parents"
        anchorEl={anchorEl}
        open={open && menuType === 'parent'}
        onClose={handleClose}
      >
        {parents.map((item) => {
          return (
            <MenuItem
              disabled={!!item.parent}
              onClick={(e) => {
                handleAddParent(e, item);
              }}
            >
              {item.schemaPath ? item.schemaPath : `parent of ${item.key}`}
            </MenuItem>
          );
        })}
      </Menu>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open && menuType === 'route'}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {routes.map((item) => {
          return (
            <MenuItem
              disabled={!item.parent || !!item.route}
              onClick={(e) => {
                handleAddRoute(e, item);
              }}
            >
              {item.schemaPath ? `${item.schemaPath}.` : ''}
              {item.key}
            </MenuItem>
          );
        })}
      </Menu>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open && menuType === 'response'}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {responses.map((item) => {
          return (
            <MenuItem
              onClick={(e) => {
                handleAddResponse(e, item);
              }}
              disabled={!item.route || !item.parent}
            >
              {item.key}
            </MenuItem>
          );
        })}
      </Menu>
      {isOpen && (
        <div className="log-body">
          <div className="code-container">
            <JsonView
              value={logData}
              style={vscodeTheme}
              displayDataTypes={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
