import Button from '@mui/material/Button';
import {
  Divider,
  FormControlLabel,
  IconButton,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import DeleteIcon from '@mui/icons-material/Delete';
import { useGeneralStore } from '../../../state';
import styles from './serverDetails.module.css';
import { useProjectStore } from '../../../state/project';
import { useSelectedRoute } from '../../../hooks';
import { DeleteServerDialog } from '../../dialogs';
import { EVENT_KEYS } from '../../../../types/events';
import { emitSocketEvent, reportButtonClick, socket } from '../../../utils';
import { BUTTONS } from '../../../../consts/analytics';
import { ServerSettings } from '../../../../types';
import { ReactComponent as SwaggerIcon } from '../../../../../assets/svg/Swagger.svg';
import { ImportSwaggerDialog } from '../../dialogs/importSwaggerDialog';

export function ServerDetails() {
  const { server } = useSelectedRoute();

  const { isServerUp, host } = useGeneralStore();
  const { updateServerSettings, activeProjectName, setHasDiffs } =
    useProjectStore();
  const [isImportSwaggerOpen, setIsImportSwaggerOpen] = useState(false);
  const [_proxyBaseUrl, setProxyBaseUrl] = useState(
    server?.settings.proxyBaseUrl || '',
  );
  const [_forceProxy, setForceProxy] = useState(
    server?.settings.forceProxy || false,
  );
  const [_duplicateCookies, setDuplicateCookies] = useState(
    server?.settings.duplicateCookies || false,
  );
  const [_reWriteCookieDomain, setReWriteCookieDomain] = useState(
    server?.settings.reWriteCookieDomain || false,
  );
  const [_simplifyCookies, setSimplifyCookies] = useState(
    server?.settings.simplifyCookies || false,
  );
  const [_delay, setDelay] = useState(server?.settings.delay || 0);
  const [_port, setPort] = useState(server?.settings.port || 3001);
  const [_websocketPort, setWebsocketPort] = useState(server?.settings.websocketPort || 0);
  const [_websocketEnabled, setWebsocketEnabled] = useState(server?.settings.websocketEnabled || false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteServerDialogOpen, setIsDeleteServerDialogOpen] =
    useState(false);
  const hasError = _proxyBaseUrl === `http://${host}:${_port}`;

  useEffect(() => {
    setProxyBaseUrl(server?.settings.proxyBaseUrl || '');
    setForceProxy(server?.settings?.forceProxy || false);
    setDuplicateCookies(server?.settings?.duplicateCookies || false);
    setReWriteCookieDomain(server?.settings?.reWriteCookieDomain || false);
    setSimplifyCookies(server?.settings?.simplifyCookies || false);
    setDelay(server?.settings?.delay || 0);
    setPort(server?.settings?.port || 3001);
    setWebsocketPort(server?.settings?.websocketPort || 0);
    setWebsocketEnabled(server?.settings?.websocketEnabled || false);
  }, [server]);

  useEffect(() => {
    const onEvent = (arg: any) => {
      setIsLoading(false);
      const { success, serverSettings, projectName, serverName, hasDiffs } =
        arg;
      setHasDiffs(hasDiffs);

      if (
        success &&
        projectName === activeProjectName &&
        serverName === server?.name
      ) {
        updateServerSettings(serverName, serverSettings);
        if (isServerUp) {
          emitSocketEvent(EVENT_KEYS.RESTART_SERVER, {
            projectName: activeProjectName,
          });
        }
      }
    };
    socket.on(EVENT_KEYS.UPDATE_SERVER_SETTINGS, onEvent);
    return () => {
      socket.off(EVENT_KEYS.UPDATE_SERVER_SETTINGS, onEvent);
    };
  }, [
    isServerUp,
    activeProjectName,
    setHasDiffs,
    server?.name,
    updateServerSettings,
  ]);

  const handleSave = () => {
    reportButtonClick(BUTTONS.SERVER_DETAILS_SAVE);

    setIsLoading(true);
    const settings: ServerSettings = {
      proxyBaseUrl: _proxyBaseUrl,
      forceProxy: _forceProxy,
      delay: _delay,
      port: _port,
      reWriteCookieDomain: _reWriteCookieDomain,
      simplifyCookies: _simplifyCookies,
      duplicateCookies: _duplicateCookies,
      websocketPort: _websocketPort,
      websocketEnabled: _websocketEnabled,
    };
    emitSocketEvent(EVENT_KEYS.UPDATE_SERVER_SETTINGS, {
      settings,
      projectName: activeProjectName,
      serverName: server?.name,
    });
  };

  const handleCancel = () => {
    reportButtonClick(BUTTONS.SERVER_DETAILS_CANCEL);
    setProxyBaseUrl(server?.settings.proxyBaseUrl || '');
    setForceProxy(server?.settings.forceProxy || false);
    setDuplicateCookies(server?.settings.duplicateCookies || false);
    setSimplifyCookies(server?.settings.simplifyCookies || false);
    setReWriteCookieDomain(server?.settings.reWriteCookieDomain || false);
    setDelay(server?.settings.delay || 0);
    setPort(server?.settings.port || 3001);
    setWebsocketPort(server?.settings?.websocketPort || 0);
    setWebsocketEnabled(server?.settings?.websocketEnabled || false);
  };

  const isDataModified =
    server?.settings.proxyBaseUrl !== _proxyBaseUrl ||
    server?.settings.delay !== _delay ||
    server?.settings.forceProxy !== _forceProxy ||
    server?.settings.port !== _port ||
    server?.settings.duplicateCookies !== _duplicateCookies ||
    server?.settings.reWriteCookieDomain !== _reWriteCookieDomain ||
    server?.settings.simplifyCookies !== _simplifyCookies ||
    server?.settings.websocketPort !== _websocketPort ||
    server?.settings.websocketEnabled !== _websocketEnabled;

  return (
    <div className={styles.container}>
      <div className={styles.body}>
        <div className={styles.title}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h5">{server?.name}</Typography>
            <div>
              <Tooltip title="import routes from swagger">
                <Button
                  variant="contained"
                  startIcon={
                    <SwaggerIcon
                      style={{
                        width: '20',
                      }}
                    />
                  }
                  style={{
                    backgroundColor: 'rgba(132,234,44,1)',
                    marginRight: 15,
                    height: '30px',
                    padding: '12px 9px 12px 12px',
                    textTransform: 'lowercase',
                  }}
                  onClick={() => {
                    reportButtonClick(BUTTONS.SERVER_DETAILS_IMPORT);

                    setIsImportSwaggerOpen(true);
                  }}
                >
                  import from swagger
                </Button>
              </Tooltip>
              <Tooltip title="Delete server">
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={() => {
                    reportButtonClick(BUTTONS.SERVER_DETAILS_DELETE_SERVER);
                    setIsDeleteServerDialogOpen(true);
                  }}
                  aria-label="close"
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </div>
          </div>
          <Divider />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <TextField
            style={{ minWidth: '350px' }}
            error={hasError}
            value={_proxyBaseUrl}
            onChange={(e) => {
              setProxyBaseUrl(e.target.value);
            }}
            label="target base url"
            id="proxyUrl"
            placeholder="https://real-server-url.com"
            variant="filled"
          />
          <TextField
            style={{ marginLeft: '15px' }}
            value={_delay}
            onChange={(e) => {
              setDelay(parseInt(e.target.value, 10));
            }}
            type="number"
            label="delay in millisecond's"
            variant="filled"
          />
        </div>
        <TextField
          style={{ marginTop: '15px', marginBottom: '20px' }}
          value={_port}
          onChange={(e) => {
            setPort(parseInt(e.target.value, 10));
          }}
          type="number"
          label="server port"
          variant="filled"
        />
        <div className={styles.switch}>
          <FormControlLabel
            control={
              <Switch
                checked={_forceProxy}
                onChange={(e) => setForceProxy(e.target.checked)}
              />
            }
            label="set as proxy"
            disabled={!_proxyBaseUrl || hasError}
          />
        </div>
        <div className={styles.switch}>
          <FormControlLabel
            control={
              <Switch
                checked={_duplicateCookies}
                onChange={(e) => setDuplicateCookies(e.target.checked)}
              />
            }
            label="duplicate cookies"
            disabled={!_proxyBaseUrl || hasError}
          />
        </div>
        <div className={styles.switch}>
          <FormControlLabel
            control={
              <Switch
                checked={_reWriteCookieDomain}
                onChange={(e) => setReWriteCookieDomain(e.target.checked)}
              />
            }
            label="rewrite cookies domain"
            disabled={!_proxyBaseUrl || hasError}
          />
        </div>
        <div className={styles.switch}>
          <FormControlLabel
            control={
              <Switch
                checked={_simplifyCookies}
                onChange={(e) => setSimplifyCookies(e.target.checked)}
              />
            }
            label="simplify cookies"
            disabled={!_proxyBaseUrl || hasError}
          />
        </div>
        <Divider style={{ margin: '20px 0' }} />
        <Typography variant="h6" gutterBottom>
          WebSocket Settings (Side Effects)
        </Typography>
        <div className={styles.switch}>
          <FormControlLabel
            control={
              <Switch
                checked={_websocketEnabled}
                onChange={(e) => setWebsocketEnabled(e.target.checked)}
              />
            }
            label="Enable WebSocket Server"
          />
        </div>
        {_websocketEnabled && (
          <div style={{ marginTop: '10px' }}>
            <TextField
              style={{ width: '250px' }}
              value={_websocketPort}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value) && value > 0 && value < 65536) {
                  setWebsocketPort(value);
                }
              }}
              type="number"
              label="WebSocket Port"
              variant="filled"
              helperText="Port for WebSocket server (side effects)"
              error={_websocketPort === _port}
            />
            {_websocketPort === _port && (
              <Typography
                variant="caption"
                style={{ color: 'red', display: 'block', marginTop: '5px' }}
              >
                WebSocket port cannot be the same as server port
              </Typography>
            )}
          </div>
        )}
      </div>
      <div className={styles.buttons}>
        <Button onClick={handleCancel}>cancel</Button>
        <LoadingButton
          loading={isLoading}
          loadingPosition="center"
          variant="text"
          onClick={handleSave}
          autoFocus
          disabled={!isDataModified}
        >
          Save
        </LoadingButton>
      </div>
      {isDeleteServerDialogOpen && !!server && (
        <DeleteServerDialog
          open={isDeleteServerDialogOpen}
          server={server}
          onClose={() => setIsDeleteServerDialogOpen(false)}
        />
      )}
      {isImportSwaggerOpen && (
        <ImportSwaggerDialog
          open
          serverName={server?.name || ''}
          onClose={() => setIsImportSwaggerOpen(false)}
        />
      )}
    </div>
  );
}
