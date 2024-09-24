import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import cloneDeep from 'lodash/cloneDeep';
import { Route, RouteResponse } from '../../../../types';
import { useGeneralStore } from '../../../state';
import { ResponseDetails } from './responseDetails';
import {
  emitSocketEvent,
  getRouteBGColor,
  openInNewTab,
  reportButtonClick,
} from '../../../utils';
import { useProjectStore } from '../../../state/project';
import { useResponseActions, useRouteActions } from '../../../hooks/files';
import { useSelectedRestRoute } from '../../../hooks';
import {
  DeleteResponseDialog,
  DeleteRouteDialog,
  ResponseDialog,
  RouteDialog,
} from '../../dialogs';
import { EVENT_KEYS } from '../../../../types/events';
import { BUTTONS } from '../../../../consts/analytics';

export function RouteDetails() {
  const { route, parent, server } = useSelectedRestRoute();

  const { setSelectedRoute, host, isServerUp } = useGeneralStore();
  const { activeProjectName } = useProjectStore();
  const [editRouteData, setEditRouteData] = useState<Route | null>(null);
  const [isRouteDialogOpen, setIsRouteDialogOpen] = useState(false);
  const [isDeleteRouteDialogOpen, setIsDeleteRouteDialogOpen] = useState(false);
  const [editResponseData, setEditResponseData] =
    useState<RouteResponse | null>(null);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [isDeleteResponseDialogOpen, setIsDeleteResponseDialogOpen] =
    useState(false);
  const { deleteRoute } = useRouteActions();
  const { deleteResponse } = useResponseActions();

  const linkUrl = `${host}:${server?.settings.port}${parent?.path}${route?.routePath}`;

  const handleSetActive = (routeId: string, responseId: string) => {
    const localParent = cloneDeep(parent);
    const localRoute = localParent?.routesHash?.[routeId];

    if (!!localRoute && !!server) {
      localRoute.activeResponseId = responseId;

      emitSocketEvent(EVENT_KEYS.UPDATE_ROUTES_FILE, {
        filename: localParent?.filename,
        content: localParent,
        projectName: activeProjectName,
        serverName: server.name,
      });
    }
  };

  const handleCloseResponseDialog = () => {
    setIsResponseDialogOpen(false);
    setEditResponseData(null);
  };

  const handleAddResponse = () => {
    reportButtonClick(BUTTONS.ROUTE_DETAILS_ADD_RESPONSE);
    setIsResponseDialogOpen(true);
    setEditResponseData(null);
  };

  const handleCloseRouteDialog = () => {
    setIsRouteDialogOpen(false);
    setEditRouteData(null);
  };

  return (
    <>
      <div className="route-details-container">
        <Link
          className="link"
          component="button"
          variant="caption"
          onClick={() => {
            reportButtonClick(BUTTONS.ROUTE_DETAILS_PARENT_LINK);
            setSelectedRoute({
              serverName: server?.name || null,
              parentId: parent?.id || null,
              routeId: null,
            });
          }}
        >
          {parent?.path}
        </Link>
        <div className="route-header">
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
          <div>
            <Tooltip title="Edit route">
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => {
                  reportButtonClick(BUTTONS.ROUTE_DETAILS_EDIT);
                  setEditRouteData(route || null);
                  setIsRouteDialogOpen(true);
                }}
                aria-label="close"
                className="delete-res-btn"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete route">
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => {
                  reportButtonClick(BUTTONS.ROUTE_DETAILS_DELETE);

                  setIsDeleteRouteDialogOpen(true);
                }}
                aria-label="close"
                className="delete-res-btn"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        <Typography variant="subtitle2" gutterBottom>
          {route?.description}
        </Typography>
        {isServerUp && (
          <Link
            className="link"
            component="button"
            variant="caption"
            onClick={() => {
              reportButtonClick(BUTTONS.ROUTE_DETAILS_ROUTE_LINK);
              openInNewTab(`http://${linkUrl}`);
            }}
          >
            {linkUrl}
          </Link>
        )}

        {Object.values(route?.responsesHash || {}).map((response) => {
          return (
            <ResponseDetails
              key={response.id}
              response={response}
              isActive={route?.activeResponseId === response.id}
              onEdit={() => {
                setEditResponseData(response);
                setIsResponseDialogOpen(true);
              }}
              onSetActive={() => {
                handleSetActive(route?.id || '', response.id);
              }}
              onDelete={() => {
                setIsDeleteResponseDialogOpen(true);
                setEditResponseData(response);
              }}
            />
          );
        })}

        {!!route && (
          <Button onClick={handleAddResponse} variant="contained">
            Add response
          </Button>
        )}
      </div>
      {isRouteDialogOpen && !!parent && !!server && (
        <RouteDialog
          open={isRouteDialogOpen}
          onClose={handleCloseRouteDialog}
          data={editRouteData}
          parent={parent}
          server={server}
        />
      )}
      {isDeleteRouteDialogOpen && !!route && !!parent && !!server && (
        <DeleteRouteDialog
          onClose={() => setIsDeleteRouteDialogOpen(false)}
          open={isDeleteRouteDialogOpen}
          onConfirm={() => {
            deleteRoute(route, parent, server);
            setIsDeleteRouteDialogOpen(false);
          }}
        />
      )}
      {isDeleteResponseDialogOpen &&
        !!route &&
        !!parent &&
        !!server &&
        !!editResponseData && (
          <DeleteResponseDialog
            onClose={() => setIsDeleteResponseDialogOpen(false)}
            open={isDeleteResponseDialogOpen}
            onConfirm={() => {
              deleteResponse(server, parent, route, editResponseData);
              setIsDeleteResponseDialogOpen(false);
            }}
          />
        )}
      {isResponseDialogOpen && !!parent && !!route && !!server && (
        <ResponseDialog
          open={isResponseDialogOpen}
          onClose={handleCloseResponseDialog}
          data={editResponseData}
          route={route}
          parent={parent}
          server={server}
        />
      )}
    </>
  );
}
