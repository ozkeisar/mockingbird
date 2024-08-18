import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  GraphQlRoute,
  Preset,
  PresetsFolder,
  ProjectServer,
  Route,
  RouteParent,
} from '../../types';
import { EVENT_KEYS } from '../../types/events';
import { useGeneralStore } from '../state';
import { useProjectStore } from '../state/project';
import { ElectronEvents, socket } from '../utils';
import { handleReceiveEvent } from '../utils/events';

export const useSelectedServer = () => {
  const { selectedServerName } = useGeneralStore();
  const { serversHash } = useProjectStore();

  if (!selectedServerName) {
    return {};
  }

  const server = serversHash[selectedServerName];

  return { server };
};

export const useSelectedParent = () => {
  const { server } = useSelectedServer();
  const { selectedParentId } = useGeneralStore();

  if (!selectedParentId || !server) {
    return { server };
  }

  const parent = server.parentRoutesHash[selectedParentId];

  return { server, parent };
};

export const useSelectedRestRoute = (): {
  parent?: RouteParent;
  route?: Route;
  server?: ProjectServer;
} => {
  const { parent, server } = useSelectedParent();
  const { selectedRouteId } = useGeneralStore();

  if (parent?.type !== 'GraphQl' && parent?.routesHash && selectedRouteId) {
    const route = parent.routesHash[selectedRouteId];

    return { parent, route, server };
  }

  return { server, parent };
};

export const useSelectedGraphQlRoute = () => {
  const { parent, server } = useSelectedParent();
  const { selectedRouteId } = useGeneralStore();

  if (
    parent?.type === 'GraphQl' &&
    parent.graphQlRouteHash &&
    selectedRouteId
  ) {
    const route = parent.graphQlRouteHash[selectedRouteId];

    return { parent, route, server };
  }

  return { server, parent };
};

export const useSelectedRoute = (): {
  parent?: RouteParent;
  route?: Route | GraphQlRoute;
  server?: ProjectServer;
} => {
  const { parent, server, route: graphqlRoute } = useSelectedGraphQlRoute();
  const { route: restRoute } = useSelectedRestRoute();

  return { server, parent, route: restRoute || graphqlRoute };
};

export const useSelectedPreset = (): {
  presetFolder: PresetsFolder | null;
  preset: Preset | null;
} => {
  const { selectedFolderId, selectedPresetId } = useGeneralStore();
  const { presetFoldersHash } = useProjectStore();

  if (!selectedFolderId) {
    return { presetFolder: null, preset: null };
  }

  const presetFolder = presetFoldersHash[selectedFolderId];

  if (!selectedPresetId) {
    return { presetFolder, preset: null };
  }

  const preset = presetFolder?.presetsHash?.[selectedPresetId] || null;

  return { presetFolder, preset };
};

export const useWindowResize = () => {
  const [size, setSize] = useState([0, 0]);

  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }

    window.addEventListener('resize', updateSize);
    updateSize();

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return size;
};

export const useResizeElement = ({
  baseline,
  initSize,
}: {
  baseline: 'bottom' | 'left';
  initSize: number;
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [size, setSize] = useState<number | string>(initSize);
  const elementRef = useRef<any>(null);

  const startResizing = useCallback(
    (mouseDownEvent: React.MouseEvent<HTMLDivElement>) => {
      mouseDownEvent.stopPropagation();
      mouseDownEvent.preventDefault();
      setIsResizing(true);
    },
    [],
  );

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: any) => {
      if (isResizing) {
        if (baseline === 'left' && elementRef.current) {
          setSize(
            mouseMoveEvent.clientX -
              elementRef.current.getBoundingClientRect().left,
          );
        } else if (baseline === 'bottom') {
          setSize(
            elementRef.current.getBoundingClientRect().bottom -
              mouseMoveEvent.clientY,
          );
        }
      }
    },
    [isResizing, baseline],
  );

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  return {
    startResizing,
    elementRef,
    size,
    setSize,
  };
};

export const useHandleSocketEventsNotifications = () => {
  useEffect(() => {
    const onEvent = (event: EVENT_KEYS, args: any) => {
      handleReceiveEvent(event, args);
    };
    socket.onAny(onEvent);
    return () => {
      socket.offAny(onEvent);
    };
  }, []);
};

export const useOpenDevtoolsShortcut = () => {
  useEffect(() => {
    const handleKeyPress = (event: any) => {
      // Check if Command (⌘) and Shift keys are pressed along with 'D' key
      if (event.metaKey && event.shiftKey && ['d', 'D'].includes(event.key)) {
        ElectronEvents.sendMessage(EVENT_KEYS.DEVTOOLS);
      }
    };

    // Add event listener when component mounts
    window.addEventListener('keydown', handleKeyPress);

    // Remove event listener when component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);
};
