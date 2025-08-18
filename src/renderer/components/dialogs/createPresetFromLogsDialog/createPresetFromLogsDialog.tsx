import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import React, { useEffect, useState } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import axios from 'axios';
import {
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
} from '@mui/material';
import { useProjectStore } from '../../../state/project';
import { useLoggerStore } from '../../../state/logger';
import { PresetsFolder } from '../../../../types';
import { EVENT_KEYS } from '../../../../types/events';
import { reportButtonClick, socket } from '../../../utils';
import { BUTTONS } from '../../../../consts/analytics';
import { BASE_URL } from '../../../const/general';

type Props = {
  onClose: () => void;
  open: boolean;
  selectedLogIds: Set<string>;
};

interface ProcessedLogData {
  logId: string;
  serverName: string;
  method: string;
  url: string;
  status: number;
  endpoint: string;
}

export function CreatePresetFromLogsDialog({
  onClose,
  open,
  selectedLogIds,
}: Props) {
  const {
    activeProjectName,
    presetFoldersHash,
    setHasDiffs,
    addUpdatePresetFolder,
  } = useProjectStore();

  const { serverLogs } = useLoggerStore();

  const [presetName, setPresetName] = useState<string>('');
  const [selectedPresetFolder, setSelectedPresetFolder] =
    useState<PresetsFolder | null>(null);
  const [newPresetFolderName, setNewPresetFolderName] = useState<string>('');
  const [isCreatingNewFolder, setIsCreatingNewFolder] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [processedLogs, setProcessedLogs] = useState<ProcessedLogData[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const presetFolders = Object.values(presetFoldersHash);

  // Check if preset name already exists in the selected folder
  const getPresetNameError = () => {
    if (!presetName.trim()) return null;

    const targetFolder = isCreatingNewFolder ? null : selectedPresetFolder;
    if (!targetFolder?.presetsHash) return null;

    const existingPresetNames = Object.values(targetFolder.presetsHash).map(
      (preset) => preset.name.toLowerCase(),
    );

    if (existingPresetNames.includes(presetName.toLowerCase())) {
      return 'A preset with this name already exists in the selected folder';
    }

    return null;
  };

  const presetNameError = getPresetNameError();

  // Helper function to detect if a log is a GraphQL call
  const isGraphQLCall = React.useCallback((log: any): boolean => {
    return (
      log.request.method?.toLowerCase() === 'post' &&
      log.request.body &&
      typeof log.request.body.query === 'string' &&
      (log.request.url?.includes('/graphql') ||
        log.request.route?.includes('/graphql') ||
        log.request.body.query.trim().startsWith('query') ||
        log.request.body.query.trim().startsWith('mutation'))
    );
  }, []);

  const processSelectedLogs = React.useCallback(() => {
    const selectedLogs = serverLogs.filter((log) =>
      selectedLogIds.has(log.metadata.id),
    );

    // Filter out GraphQL logs - only process REST API calls
    const restLogs = selectedLogs.filter((log) => !isGraphQLCall(log));

    const processed: ProcessedLogData[] = [];
    const endpointCount: { [key: string]: number } = {};
    const newErrors: string[] = [];

    // Add error if GraphQL logs were selected
    const graphQLLogsCount = selectedLogs.length - restLogs.length;
    if (graphQLLogsCount > 0) {
      newErrors.push(
        `${graphQLLogsCount} GraphQL log${
          graphQLLogsCount > 1 ? 's' : ''
        } excluded. Only REST API calls can be added to presets.`,
      );
    }

    restLogs.forEach((log) => {
      const endpoint = `${log.request.method.toUpperCase()} ${log.request.url}`;
      endpointCount[endpoint] = (endpointCount[endpoint] || 0) + 1;

      processed.push({
        logId: log.metadata.id,
        serverName: log.metadata.serverName,
        method: log.request.method.toUpperCase(),
        url: log.request.url,
        status: log.response.status,
        endpoint,
      });
    });

    // Check for duplicate endpoints
    Object.entries(endpointCount).forEach(([endpoint, count]) => {
      if (count > 1) {
        newErrors.push(
          `Multiple entries found for ${endpoint}. Please select only one per endpoint.`,
        );
      }
    });

    setProcessedLogs(processed);
    setErrors(newErrors);
  }, [serverLogs, selectedLogIds, isGraphQLCall]);

  useEffect(() => {
    if (open && selectedLogIds.size > 0) {
      processSelectedLogs();
    }
  }, [open, selectedLogIds, processSelectedLogs]);

  useEffect(() => {
    const onReload = () => {
      // This will trigger when backend sends RELOAD event after successful preset creation
      // The project store will automatically reload data
    };
    socket.on(EVENT_KEYS.RELOAD, onReload);
    return () => {
      socket.off(EVENT_KEYS.RELOAD, onReload);
    };
  }, []);

  const handleSave = async () => {
    if (errors.length > 0 || presetNameError) {
      return;
    }

    reportButtonClick(BUTTONS.CREATE_PRESET_FROM_LOGS_SAVE);
    setIsLoading(true);

    try {
      // Transform processed logs to match backend expected format
      const logsForBackend = processedLogs
        .map((logData) => {
          const log = serverLogs.find((l) => l.metadata.id === logData.logId);
          if (!log) return null;

          return {
            serverName: log.metadata.serverName,
            method: log.request.method.toUpperCase(),
            url: log.request.url,
            status: log.response.status,
            responseData: log.response.data,
            responseHeaders: log.response.headers,
          };
        })
        .filter(Boolean);

      // Call REST API
      const response = await axios.post(
        `${BASE_URL}/presets/create-from-logs`,
        {
          presetName,
          presetFolderId: selectedPresetFolder?.id,
          newPresetFolderName,
          isCreatingNewFolder,
          processedLogs: logsForBackend,
          projectName: activeProjectName,
        },
      );

      if (response.data.success) {
        const { presetFolder, hasDiffs } = response.data;
        setHasDiffs(hasDiffs);
        addUpdatePresetFolder(presetFolder);
        onClose();
      } else {
        console.error('Failed to create preset:', response.data.message);
        // Could show error message to user here
      }
    } catch (error: any) {
      console.error('Error creating preset:', error);
      // Could show error message to user here based on error.response?.data?.message
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reportButtonClick(BUTTONS.CREATE_PRESET_FROM_LOGS_CLOSE);
    onClose();
  };

  const canSave =
    presetName.trim().length > 0 &&
    errors.length === 0 &&
    !presetNameError &&
    (selectedPresetFolder ||
      (isCreatingNewFolder && newPresetFolderName.trim().length > 0));

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Create Preset from {processedLogs.length} Console Logs
      </DialogTitle>
      <DialogContent style={{ minWidth: '600px' }}>
        {errors.length > 0 && (
          <Box mb={2}>
            {errors.map((error) => (
              <Alert key={error} severity="error" sx={{ mb: 1 }}>
                {error}
              </Alert>
            ))}
          </Box>
        )}

        <TextField
          autoFocus
          required
          margin="dense"
          id="presetName"
          name="presetName"
          label="Preset Name"
          type="text"
          fullWidth
          variant="outlined"
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          error={!!presetNameError}
          helperText={presetNameError}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
          <InputLabel>Preset Folder Option</InputLabel>
          <Select
            value={isCreatingNewFolder ? 'new' : 'existing'}
            onChange={(e) => setIsCreatingNewFolder(e.target.value === 'new')}
            label="Preset Folder Option"
          >
            <MenuItem value="existing">Use Existing Folder</MenuItem>
            <MenuItem value="new">Create New Folder</MenuItem>
          </Select>
        </FormControl>

        {isCreatingNewFolder ? (
          <TextField
            required
            margin="dense"
            id="newPresetFolderName"
            name="newPresetFolderName"
            label="New Preset Folder Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newPresetFolderName}
            onChange={(e) => setNewPresetFolderName(e.target.value)}
            sx={{ mb: 2 }}
          />
        ) : (
          <Autocomplete
            options={presetFolders}
            getOptionLabel={(option) => option.name}
            value={selectedPresetFolder}
            onChange={(_, newValue) => setSelectedPresetFolder(newValue)}
            renderInput={(params) => (
              <TextField
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...params}
                label="Select Preset Folder"
                variant="outlined"
                margin="dense"
                required
              />
            )}
            sx={{ mb: 2 }}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <LoadingButton
          variant="contained"
          onClick={handleSave}
          loading={isLoading}
          disabled={!canSave}
        >
          Create Preset
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
