import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { setUserId } from '@amplitude/analytics-browser';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { SnackbarProvider } from 'notistack';
import { Main } from './screens';
import { GlobalEvents } from './components/globalEvents';
import { useGeneralStore } from './state';
import { AppSettings } from '../types';
import { useProjectStore } from './state/project';
import { ReactComponent as LogoIcon } from '../../assets/icon.svg';
import { ErrorBoundary } from './components/errorBoundary';
import { useLoggerStore } from './state/logger';
import { EVENT_KEYS } from '../types/events';
import { emitSocketEvent, socket } from './utils';
import {
  useHandleSocketEventsNotifications,
  useOpenDevtoolsShortcut,
} from './hooks';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    secondary: {
      main: '#805231',
    },
  },
});

export default function App() {
  const {
    setProjectsNameList,
    setAppSettings,
    resetGeneralState,
    setIsServerUp,
  } = useGeneralStore();

  const { setActiveProjectName, resetProjectState } = useProjectStore();
  useHandleSocketEventsNotifications();
  const { resetLoggerState } = useLoggerStore();

  const [isAppInit, setIsAppInit] = useState(false);

  useEffect(() => {
    const onEvent = (arg: {
      success: boolean;
      projectsNameList: string[];
      projectName: string | null;
      appSettings: AppSettings;
      isServerUp: boolean;
    }) => {
      setIsAppInit(true);

      const {
        success,
        projectsNameList,
        appSettings,
        projectName,
        isServerUp,
      } = arg;

      if (success && projectName && projectName?.length > 0) {
        setActiveProjectName(projectName);
      }

      if (projectsNameList) {
        setProjectsNameList(projectsNameList);
      }

      if (appSettings) {
        setAppSettings(appSettings);
        if (appSettings.userId) {
          setUserId(appSettings.userId);
        }
      }

      setIsServerUp(isServerUp);
    };
    socket.on(EVENT_KEYS.INIT, onEvent);

    return () => {
      socket.off(EVENT_KEYS.INIT, onEvent);
    };
  }, [
    setActiveProjectName,
    setProjectsNameList,
    setAppSettings,
    setIsServerUp,
  ]);

  useEffect(() => {
    emitSocketEvent(EVENT_KEYS.INIT);
  }, []);

  const handleReset = () => {
    resetGeneralState();
    resetProjectState();
    resetLoggerState();
    setIsAppInit(true);
    emitSocketEvent(EVENT_KEYS.INIT);
  };

  useOpenDevtoolsShortcut();

  if (!isAppInit) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'black',
        }}
      >
        <LogoIcon width={230} style={{ marginBottom: '75px' }} />
        <CircularProgress color="inherit" style={{ marginTop: '35px' }} />
      </div>
    );
  }

  return (
    <SnackbarProvider maxSnack={3}>
      <ErrorBoundary onReload={handleReset}>
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <Router>
            <Routes>
              <Route path="/" element={<Main />} />
            </Routes>
          </Router>
          <GlobalEvents />
        </ThemeProvider>
      </ErrorBoundary>
    </SnackbarProvider>
  );
}
