import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography
} from '@mui/material';
import { v4 as uuid } from 'uuid';
import { SideEffect, SideEffectType, WebSocketConfig } from '../../../types/sideEffects';
import { WebSocketConfigEditor } from './WebSocketConfigEditor';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (sideEffect: SideEffect) => void;
  data?: SideEffect | null;
  serverName: string;
}

export function SideEffectDialog({
  open,
  onClose,
  onSave,
  data,
  serverName
}: Props) {
  const [type, setType] = useState<SideEffectType>(data?.type || 'websocket');
  const [name, setName] = useState(data?.name || '');
  const [description, setDescription] = useState(data?.description || '');
  const [enabled, setEnabled] = useState(data?.enabled !== false);
  const [delay, setDelay] = useState(data?.delay || 0);
  const [websocketConfig, setWebsocketConfig] = useState<WebSocketConfig>(
    data?.type === 'websocket' ? data.config : {
      eventType: 'single',
      messages: []
    }
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Reset form when dialog opens with new data
    if (data) {
      setType(data.type);
      setName(data.name);
      setDescription(data.description || '');
      setEnabled(data.enabled);
      setDelay(data.delay || 0);
      if (data.type === 'websocket') {
        setWebsocketConfig(data.config as WebSocketConfig);
      }
    } else {
      // Reset to defaults for new side effect
      setType('websocket');
      setName('');
      setDescription('');
      setEnabled(true);
      setDelay(0);
      setWebsocketConfig({
        eventType: 'single',
        messages: []
      });
    }
    setErrors({});
  }, [data, open]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (delay < 0) {
      newErrors.delay = 'Delay must be positive';
    }

    if (type === 'websocket') {
      if (websocketConfig.messages.length === 0) {
        newErrors.config = 'At least one message is required';
      } else {
        const hasEmptyEvent = websocketConfig.messages.some(msg => !msg.event?.trim());
        if (hasEmptyEvent) {
          newErrors.config = 'All messages must have an event name';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    const sideEffect: SideEffect = {
      id: data?.id || uuid(),
      type,
      name: name.trim(),
      description: description.trim() || undefined,
      enabled,
      delay: delay > 0 ? delay : undefined,
      config: websocketConfig
    };

    onSave(sideEffect);
    onClose();
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {data ? 'Edit Side Effect' : 'Add Side Effect'}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            required
            autoFocus
          />
          
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
          
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as SideEffectType)}
              label="Type"
            >
              <MenuItem value="websocket">WebSocket</MenuItem>
              <MenuItem value="kafka" disabled>
                Kafka (Coming Soon)
              </MenuItem>
              <MenuItem value="rest" disabled>
                REST (Coming Soon)
              </MenuItem>
              <MenuItem value="graphql" disabled>
                GraphQL (Coming Soon)
              </MenuItem>
              <MenuItem value="grpc" disabled>
                gRPC (Coming Soon)
              </MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Delay (ms)"
            type="number"
            value={delay}
            onChange={(e) => setDelay(Math.max(0, parseInt(e.target.value) || 0))}
            error={!!errors.delay}
            helperText={errors.delay || 'Delay before executing this side effect'}
            fullWidth
          />
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Configuration
            </Typography>
            
            {type === 'websocket' && (
              <WebSocketConfigEditor
                config={websocketConfig}
                onChange={setWebsocketConfig}
                error={errors.config}
              />
            )}
            
            {type !== 'websocket' && (
              <Typography variant="body2" color="text.secondary">
                Configuration for {type} is coming soon
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}