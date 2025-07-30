import {
  GraphQlRoute,
  GraphQlRouteResponse,
  Route,
  RouteParent,
  RouteResponse,
  ServerLog,
} from '../../../types';
import './logRow.css';
import { isGraphQLRequest } from '../../utils';
import { RestLogRow } from './restLogRow';
import { GraphqlLogRow } from './graphqlLogRow';
import LogRowErrorBoundary from './logRowErrorBoundary';
import { FallbackGraphqlLogRow } from './fallbackGraphqlLogRow';

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
  onAddRouteClick: ({
    data,
    matchedParent,
  }: {
    data: Partial<Route>;
    matchedParent: RouteParent;
    serverName: string;
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
  onAddResponseClick: (data: {
    matchedParent: RouteParent;
    matchedRoute: Route;
    data: Partial<RouteResponse>;
    serverName: string;
  }) => void;
};

function LogRow({
  openRows,
  data,
  index,
  setSize,
  windowWidth,
  onRowClick,
  selectedLogIds = new Set(),
  onLogSelection,
  onAddParentClick,
  onAddRouteClick,
  onAddResponseClick,
  onAddQueryClick,
  onAddQueryResponseClick,
}: props) {
  const logData = data[data.length - index - 1];

  const isGraphqlReq = isGraphQLRequest(logData.request.body);

  if (isGraphqlReq) {
    return (
      <LogRowErrorBoundary
        fallback={
          <FallbackGraphqlLogRow
            openRows={openRows}
            data={data}
            index={index}
            setSize={setSize}
            windowWidth={windowWidth}
            onRowClick={onRowClick}
          />
        }
      >
        <GraphqlLogRow
          openRows={openRows}
          data={data}
          index={index}
          setSize={setSize}
          windowWidth={windowWidth}
          onRowClick={onRowClick}
          selectedLogIds={selectedLogIds}
          onLogSelection={onLogSelection}
          onAddParentClick={onAddParentClick}
          onAddQueryClick={onAddQueryClick}
          onAddQueryResponseClick={onAddQueryResponseClick}
        />
      </LogRowErrorBoundary>
    );
  }
  return (
    <RestLogRow
      openRows={openRows}
      data={data}
      index={index}
      setSize={setSize}
      windowWidth={windowWidth}
      onRowClick={onRowClick}
      selectedLogIds={selectedLogIds}
      onLogSelection={onLogSelection}
      onAddParentClick={onAddParentClick}
      onAddRouteClick={onAddRouteClick}
      onAddResponseClick={onAddResponseClick}
    />
  );
}

export default LogRow;
