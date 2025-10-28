import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert
} from '@mui/material';
import MonacoEditor from '@uiw/react-monacoeditor';
import { v4 as uuid } from 'uuid';
import { WebSocketMessage } from '../../../types/sideEffects';

interface Props {
  open: boolean;
  message?: WebSocketMessage | null;
  onSave: (message: WebSocketMessage) => void;
  onClose: () => void;
  isSequence?: boolean;
}

export function WebSocketMessageEditor({
  open,
  message,
  onSave,
  onClose,
  isSequence = false
}: Props) {
  const [event, setEvent] = useState(message?.event || '');
  const [payload, setPayload] = useState(
    message?.payload 
      ? JSON.stringify(message.payload, null, 2)
      : JSON.stringify({ message: 'Hello WebSocket!' }, null, 2)
  );
  const [delay, setDelay] = useState(message?.delay || 0);
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    // Reset form when dialog opens
    if (open) {
      setEvent(message?.event || '');
      setPayload(
        message?.payload 
          ? JSON.stringify(message.payload, null, 2)
          : JSON.stringify({ message: 'Hello WebSocket!' }, null, 2)
      );
      setDelay(message?.delay || 0);
      setJsonError(null);
    }
  }, [message, open]);

  useEffect(() => {
    // Validate JSON
    try {
      if (payload.trim()) {
        JSON.parse(payload);
        setJsonError(null);
      }
    } catch (error: any) {
      setJsonError(error.message);
    }
  }, [payload]);

  const handleSave = () => {
    if (!event.trim()) {
      return;
    }

    let parsedPayload;
    try {
      parsedPayload = payload.trim() ? JSON.parse(payload) : {};
    } catch (error) {
      setJsonError('Invalid JSON format');
      return;
    }

    const newMessage: WebSocketMessage = {
      id: message?.id || uuid(),
      event: event.trim(),
      payload: parsedPayload,
      delay: isSequence && delay > 0 ? delay : undefined
    };

    onSave(newMessage);
  };

  const handleClose = () => {
    setJsonError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {message ? 'Edit WebSocket Message' : 'Add WebSocket Message'}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Event Name"
            value={event}
            onChange={(e) => setEvent(e.target.value)}
            fullWidth
            required
            autoFocus
            placeholder="e.g., user-update, notification, status-change"
            helperText="The Socket.IO event name to emit"
            error={!event.trim() && event !== ''}
          />
          
          {isSequence && (
            <TextField
              label="Delay (ms)"
              type="number"
              value={delay}
              onChange={(e) => setDelay(Math.max(0, parseInt(e.target.value) || 0))}
              fullWidth
              helperText="Delay before sending this message (only for sequences)"
            />
          )}
          
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Payload (JSON)
            </Typography>
            <Box sx={{ 
              border: '1px solid', 
              borderColor: jsonError ? 'error.main' : 'divider',
              borderRadius: 1,
              overflow: 'hidden'
            }}>
              <MonacoEditor
                language="json"
                value={payload}
                options={{
                  selectOnLineNumbers: true,
                  roundedSelection: false,
                  cursorStyle: 'line',
                  automaticLayout: true,
                  theme: 'vs-dark',
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  formatOnPaste: true,
                  formatOnType: true
                }}
                height="300px"
                onChange={(value) => {
                  if (value !== undefined) {
                    setPayload(value);
                  }
                }}
              />
            </Box>
            {jsonError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                Invalid JSON: {jsonError}
              </Alert>
            )}
          </Box>
          
          <Alert severity="info">
            This message will be broadcast to all connected WebSocket clients when the side effect is triggered.
          </Alert>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={!event.trim() || !!jsonError}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}