/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useMemo, useRef, useState } from 'react';

import './restLogRow.css';
import JsonView from '@uiw/react-json-view';
import { vscodeTheme } from '@uiw/react-json-view/vscode';
import { Button, IconButton, Tooltip } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  formatDate,
  getKeyValuePairReq,
  getRequestRoute,
  removeLastPartOfUri,
  reportButtonClick,
  reportElementClick,
} from '../../../utils';
import { useProjectStore } from '../../../state/project';
import { BUTTONS, ELEMENTS } from '../../../../consts/analytics';
import { useGeneralStore } from '../../../state';
import {
  Method,
  Route,
  RouteParent,
  RouteResponse,
  ServerLog,
} from '../../../../types';

const isParamMatching = (route: Route, logData: ServerLog) => {
  if (
    !!route.paramValue?.length &&
    !!route.paramKey?.length &&
    !!route.paramType
  ) {
    if (route.paramType === 'body') {
      return logData.request.body[route.paramKey] === route.paramValue;
    }
    if (route.paramType === 'params') {
      return logData.request.params[route.paramKey] === route.paramValue;
    }
    if (route.paramType === 'query') {
      return logData.request.query[route.paramKey] === route.paramValue;
    }
    return false;
  }
  return true;
};

// Helper function to check if a segment is a parameter
function isParameter(segment: string) {
  return segment.startsWith(':');
}

function compareUrls(url1: string, url2: string) {
  // Split URLs into path segments
  const url1Segments = url1.split('/');
  const url2Segments = url2.split('/');

  // If the number of segments is different, return false
  if (url1Segments.length !== url2Segments.length) {
    return false;
  }

  // Iterate over segments and compare them
  for (let i = 0; i < url1Segments.length; i++) {
    const segment1 = url1Segments[i];
    const segment2 = url2Segments[i];

    // If segments are different and not parameters, return false
    if (
      segment1 !== segment2 &&
      !isParameter(segment1) &&
      !isParameter(segment2)
    ) {
      return false;
    }
  }

  return true;
}

type props = {
  data: ServerLog[];
  index: number;
  setSize: (index: number, height: number) => void;
  windowWidth: number;
  onRowClick: (id: string) => void;
  openRows: { [key: string]: boolean };
  onAddParentClick: (data: {
    data: Partial<RouteParent>;
    serverName?: string;
  }) => void;
  onAddRouteClick: ({
    data,
    matchedParent,
  }: {
    data: Route;
    matchedParent: RouteParent;
    serverName: string;
  }) => void;
  onAddResponseClick: ({
    matchedParent,
    matchedRoute,
    data,
    serverName,
  }: {
    matchedParent: RouteParent;
    matchedRoute: Route;
    data: RouteResponse;
    serverName: string;
  }) => void;
};

export function RestLogRow({
  openRows,
  data,
  index,
  setSize,
  windowWidth,
  onRowClick,
  onAddParentClick,
  onAddRouteClick,
  onAddResponseClick,
}: props) {
  const { serversHash } = useProjectStore();
  const { setSelectedRoute } = useGeneralStore();

  const rowRef = useRef<any>(null);
  const logData = data[data.length - index - 1];
  const [isOpen, setIsOpen] = useState(!!openRows[logData.metadata.id]);
  const time = new Date(logData.timestamp);
  const requestUrl = logData.request.url;
  const requestMethod = logData.request.method.toLowerCase() as Method;
  const { serverName } = logData.metadata;
  const { type } = logData.metadata;

  const server = serversHash[serverName];
  const routesParents = server?.parentRoutesHash;

  const matchedParents = useMemo(
    () =>
      Object.values(routesParents || {}).filter((parent) =>
        requestUrl.includes(parent.path),
      ),
    [routesParents, requestUrl],
  );

  const { matchedRoute, matchedParent } = useMemo(
    () =>
      matchedParents?.reduce(
        (acc, parent) => {
          const requestRoute = getRequestRoute(requestUrl, parent.path);

          if (acc.matchedRoute) {
            return acc;
          }

          const route = Object.values(parent.routesHash || {}).find((item) => {
            return (
              compareUrls(item.routePath, requestRoute) &&
              item.method === requestMethod &&
              isParamMatching(item, logData)
            );
          });

          if (route?.id) {
            return { matchedRoute: route, matchedParent: parent };
          }
          return acc;
        },
        { matchedRoute: null, matchedParent: null } as {
          matchedRoute: Route | null;
          matchedParent: RouteParent | null;
        },
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [matchedParents],
  );

  const routeExist = !!matchedRoute;

  useEffect(() => {
    setSize(index, rowRef?.current?.getBoundingClientRect().height);
  }, [setSize, index, windowWidth, isOpen]);

  const getBGColor = () => {
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

  const handleAddResponse = (e: React.MouseEvent<HTMLElement>) => {
    reportButtonClick(BUTTONS.CONSOLE_LOG_ROW_ADD_RESPONSE);

    e.stopPropagation();
    if (!matchedParents) {
      return;
    }

    const sortedMatchedParent = matchedParents.sort((a, b) => {
      return a.path.length > b.path.length ? -1 : 1;
    });

    const _matchedParent = sortedMatchedParent[0];
    const requestRoute = getRequestRoute(requestUrl, _matchedParent.path);

    const _matchedRoute = Object.values(_matchedParent.routesHash || {}).find(
      (routeItem) => {
        return (
          compareUrls(routeItem.routePath, requestRoute) &&
          routeItem.method === requestMethod &&
          isParamMatching(routeItem, logData)
        );
      },
    );
    if (!_matchedRoute || !server) {
      return;
    }
    onAddResponseClick({
      serverName: server?.name,
      matchedParent: _matchedParent,
      matchedRoute: _matchedRoute,
      data: {
        name: '',
        description: '',
        res: {
          code: logData.response.status,
          data: logData.response.data,
          headers: logData.response.headers,
        },
        type: 'obj',
        url: null,
        exec: null,
      } as RouteResponse,
    });
  };

  const handleAddParent = (e: React.MouseEvent<HTMLElement>) => {
    reportButtonClick(BUTTONS.CONSOLE_LOG_ROW_ADD_PARENT);
    e.stopPropagation();
    const path = removeLastPartOfUri(requestUrl);
    onAddParentClick({ data: { path }, serverName: server?.name });
  };

  const handleAddRoute = (e: React.MouseEvent<HTMLElement>) => {
    reportButtonClick(BUTTONS.CONSOLE_LOG_ROW_ADD_ROUTE);

    e.stopPropagation();
    if (!matchedParents || !server) {
      return;
    }
    const sortedMatchedParent = matchedParents.sort((a, b) => {
      return a.path.length > b.path.length ? -1 : 1;
    });

    const { body, params, query } = logData.request;

    const { key, value, type: _type } = getKeyValuePairReq(body, query, params);

    const _matchedParent = sortedMatchedParent[0];

    const routePath = getRequestRoute(requestUrl, _matchedParent.path);

    onAddRouteClick({
      serverName: server?.name,
      matchedParent: _matchedParent,
      data: {
        paramKey: key,
        paramType: _type,
        paramValue: value,
        routePath,
        method: requestMethod,
        activeResponseIndex: 0,
        responses: [],
        description: 'created from proxy call',
      } as any,
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
          <div className="type" style={{ backgroundColor: getBGColor() }}>
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
          <Tooltip title={logData.request.url}>
            <div>
              <div
                style={{
                  fontSize: '10px',
                  lineHeight: '10px',
                  marginBottom: '-2px',
                }}
              >
                {logData.metadata.serverName}
              </div>
              <div className="row-url">{logData.request.url}</div>
            </div>
          </Tooltip>
          {!!matchedRoute && matchedParent && (
            <Tooltip title="open route">
              <IconButton
                edge="start"
                color="inherit"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRoute({
                    serverName,
                    parentId: matchedParent.id,
                    routeId: matchedRoute.id,
                  });
                }}
                aria-label="close"
                size="small"
                style={{ marginLeft: '8px' }}
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </div>
        <div className="time-e-add">
          {!matchedParents?.length && (
            <Button variant="text" color="inherit" onClick={handleAddParent}>
              add parent
            </Button>
          )}
          {!routeExist && (
            <Button
              variant="text"
              color="inherit"
              onClick={handleAddRoute}
              disabled={!matchedParents?.length}
            >
              add route
            </Button>
          )}
          <Button
            variant="text"
            color="inherit"
            onClick={handleAddResponse}
            disabled={!routeExist}
          >
            Add Response
          </Button>
          <div className="time">{formatDate(time)}</div>
        </div>
      </div>

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
