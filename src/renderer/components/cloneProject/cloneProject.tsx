/* eslint-disable jsx-a11y/anchor-is-valid */
import TextField from '@mui/material/TextField';
import React, { useEffect, useState } from 'react';
import {
  IconButton,
  Link,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import CloseIcon from '@mui/icons-material/Close';
import styles from './cloneProject.module.css';
import { emitSocketEvent, reportButtonClick, socket } from '../../utils';
import { useGeneralStore } from '../../state';
import { ElectronEvents } from '../../utils/electron';
import { EVENT_KEYS } from '../../../types/events';
import { BUTTONS } from '../../../consts/analytics';
import { isElectronEnabled } from '../../const/general';

const httpsExample = 'https://github.com/ozkeisar/mockingbird.git';
const hssExample = 'git@github.com:ozkeisar/mockingbird.git';

type CloneType = 'LOCAL' | 'SSH' | 'HTTPS' | 'OPEN';

export function CloneProject({
  onCloneSuccess,
  onCancel,
}: {
  onCancel?: () => void;
  onCloneSuccess?: () => void;
}) {
  const { projectsNameList } = useGeneralStore();

  const [cloneType, setCloneType] = useState<CloneType>('LOCAL');
  const [projectName, setProjectName] = useState('');

  const [sshUrl, setShhUrl] = useState('');
  const [httpsUrl, setHttpsUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [directoryPath, setDirectoryPath] = useState('');
  const [isCloneLoading, setIsCloneLoading] = useState(false);

  const projectNameError = projectsNameList.includes(projectName);
  const hasError =
    projectNameError ||
    !projectName.length ||
    (!directoryPath?.length && cloneType === 'OPEN');

  useEffect(() => {
    const onEvent = (arg: { success: boolean }) => {
      const { success } = arg;
      setIsCloneLoading(false);

      if (success) {
        onCloneSuccess?.();
      }
    };
    socket.on(EVENT_KEYS.CREATE_PROJECT, onEvent);

    return () => {
      socket.off(EVENT_KEYS.CREATE_PROJECT, onEvent);
    };
  }, [onCloneSuccess]);

  useEffect(() => {
    const removeListener = ElectronEvents.on(
      EVENT_KEYS.SELECT_DIRECTORY,
      (arg) => {
        const { success, directoryPath: _directoryPath } = arg as any;
        if (success) {
          setDirectoryPath(_directoryPath);
        }
      },
    );

    return () => {
      removeListener();
    };
  }, []);

  const handleCloneClick = () => {
    setIsCloneLoading(true);
    reportButtonClick(BUTTONS.CLONE);

    emitSocketEvent(EVENT_KEYS.CREATE_PROJECT, {
      sshUrl,
      httpsUrl,
      cloneType,
      username,
      password,
      projectName,
      directoryPath,
    });
  };

  const handleAlignment = (
    event: React.MouseEvent<HTMLElement>,
    type: CloneType,
  ) => {
    if (type) {
      setCloneType(type);
    }
  };

  const getActionName = () => {
    switch (cloneType) {
      case 'HTTPS':
        return 'Clone';

      case 'OPEN':
        return 'Open';

      case 'SSH':
        return 'Clone';

      case 'LOCAL':
        return 'Create';

      default:
        return 'Create';
    }
  };

  return (
    <div className="empty-state-container">
      {!!onCancel && (
        <IconButton
          style={{ position: 'absolute', left: '15px', top: '15px' }}
          edge="start"
          color="inherit"
          onClick={() => {
            reportButtonClick(BUTTONS.CLONE_DIALOG_CLOSE);
            onCancel();
          }}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      )}
      <div className="clone-container">
        <Typography variant="h6" gutterBottom>
          {getActionName()} your Mockingbird project
        </Typography>
        <ToggleButtonGroup
          value={cloneType}
          exclusive
          onChange={handleAlignment}
          aria-label="text alignment"
          className="clone-type-radio-group"
        >
          <ToggleButton value="HTTPS" aria-label="left aligned">
            HTTPS
          </ToggleButton>
          <ToggleButton value="SSH" aria-label="centered">
            SSH
          </ToggleButton>
          <ToggleButton value="LOCAL" aria-label="centered">
            LOCAL
          </ToggleButton>
          {isElectronEnabled && (
            <ToggleButton value="OPEN" aria-label="centered">
              OPEN
            </ToggleButton>
          )}
        </ToggleButtonGroup>

        {cloneType === 'HTTPS' && (
          <div className={styles.inputsContainer}>
            <TextField
              style={{ marginBottom: '15px' }}
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
              }}
              label="project name"
              variant="outlined"
              fullWidth
              required
              error={projectNameError}
              autoFocus
            />
            <TextField
              style={{ marginBottom: '15px' }}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              className="url-text-btn"
              label="username"
              variant="outlined"
              fullWidth
            />
            <TextField
              style={{ marginBottom: '15px' }}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              className="url-text-btn"
              label="password"
              variant="outlined"
              fullWidth
              type="password"
            />
            <TextField
              value={httpsUrl}
              onChange={(e) => {
                setHttpsUrl(e.target.value);
              }}
              className="url-text-btn"
              label="https url"
              variant="outlined"
              fullWidth
            />
            <Typography
              style={{ marginBottom: '15px', marginTop: '5px' }}
              variant="caption"
              gutterBottom
            >
              {'Example repo '}
              <Link>{httpsExample}</Link>
            </Typography>
          </div>
        )}

        {cloneType === 'SSH' && (
          <div className={styles.inputsContainer}>
            <TextField
              style={{ marginBottom: '15px' }}
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
              }}
              label="project name"
              variant="outlined"
              fullWidth
              required
              autoFocus
              error={projectNameError}
            />
            <TextField
              value={sshUrl}
              onChange={(e) => {
                setShhUrl(e.target.value);
              }}
              className="url-text-btn"
              label="ssh url"
              variant="outlined"
              fullWidth
            />
            <Typography
              style={{ marginBottom: '15px', marginTop: '5px' }}
              variant="caption"
              gutterBottom
            >
              {'Example repo '}
              <Link>{hssExample}</Link>
            </Typography>
          </div>
        )}

        {cloneType === 'LOCAL' && (
          <div className={styles.inputsContainer}>
            <TextField
              style={{ marginBottom: '15px' }}
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
              }}
              label="project name"
              variant="outlined"
              fullWidth
              required
              autoFocus
              error={projectNameError}
            />
          </div>
        )}

        {cloneType === 'OPEN' && (
          <div className={styles.inputsContainer}>
            <TextField
              style={{ marginBottom: '15px' }}
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
              }}
              label="project name"
              variant="outlined"
              fullWidth
              required
              autoFocus
              error={projectNameError}
            />
            <Link
              className={styles.link}
              onClick={() =>
                ElectronEvents.sendMessage(EVENT_KEYS.SELECT_DIRECTORY)
              }
            >
              {directoryPath || 'select project directory'}
            </Link>
          </div>
        )}

        <LoadingButton
          loading={isCloneLoading}
          loadingPosition="center"
          variant="contained"
          onClick={handleCloneClick}
          autoFocus
          disabled={hasError}
        >
          {getActionName()}
        </LoadingButton>
      </div>
    </div>
  );
}
