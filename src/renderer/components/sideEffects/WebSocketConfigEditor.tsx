import React from 'react';
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { v4 as uuid } from 'uuid';
import { WebSocketConfig, WebSocketMessage } from '../../../types/sideEffects';
import { WebSocketMessageEditor } from './WebSocketMessageEditor';

interface Props {
  config: WebSocketConfig;
  onChange: (config: WebSocketConfig) => void;
  error?: string;
}

export function WebSocketConfigEditor({ config, onChange, error }: Props) {
  const [editingMessage, setEditingMessage] = React.useState<WebSocketMessage | null>(null);
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = React.useState(false);

  const handleEventTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newType: 'single' | 'sequence' | null
  ) => {
    if (newType) {
      onChange({
        ...config,
        eventType: newType,
        // If switching to single, keep only first message
        messages: newType === 'single' && config.messages.length > 1 
          ? [config.messages[0]]
          : config.messages
      });
    }
  };

  const handleAddMessage = () => {
    setEditingMessage(null);
    setEditingIndex(null);
    setMessageDialogOpen(true);
  };

  const handleEditMessage = (index: number) => {
    setEditingMessage(config.messages[index]);
    setEditingIndex(index);
    setMessageDialogOpen(true);
  };

  const handleDeleteMessage = (index: number) => {
    const newMessages = config.messages.filter((_, i) => i !== index);
    onChange({
      ...config,
      messages: newMessages
    });
  };

  const handleSaveMessage = (message: WebSocketMessage) => {
    let newMessages: WebSocketMessage[];
    
    if (editingIndex !== null) {
      // Editing existing message
      newMessages = [...config.messages];
      newMessages[editingIndex] = message;
    } else {
      // Adding new message
      if (config.eventType === 'single') {
        // Replace existing message for single type
        newMessages = [message];
      } else {
        // Append for sequence type
        newMessages = [...config.messages, message];
      }
    }

    onChange({
      ...config,
      messages: newMessages
    });

    setMessageDialogOpen(false);
    setEditingMessage(null);
    setEditingIndex(null);
  };

  const formatPayload = (payload: any): string => {
    if (!payload) return 'Empty payload';
    if (typeof payload === 'string') return payload;
    try {
      return JSON.stringify(payload, null, 2).substring(0, 100) + '...';
    } catch {
      return String(payload);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup
          value={config.eventType}
          exclusive
          onChange={handleEventTypeChange}
          size="small"
          fullWidth
        >
          <ToggleButton value="single">
            Single Message
          </ToggleButton>
          <ToggleButton value="sequence">
            Message Sequence
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {config.eventType === 'single' ? (
        <Box>
          {config.messages.length === 0 ? (
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                No message configured
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddMessage}
                variant="outlined"
                size="small"
              >
                Add Message
              </Button>
            </Paper>
          ) : (
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2">
                  Event: {config.messages[0].event}
                </Typography>
                <Box>
                  <IconButton size="small" onClick={() => handleEditMessage(0)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDeleteMessage(0)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {formatPayload(config.messages[0].payload)}
              </Typography>
            </Paper>
          )}
        </Box>
      ) : (
        <Box>
          <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2">
              Messages ({config.messages.length})
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddMessage}
              size="small"
              variant="outlined"
            >
              Add Message
            </Button>
          </Box>
          
          {config.messages.length === 0 ? (
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No messages in sequence
              </Typography>
            </Paper>
          ) : (
            <List dense>
              {config.messages.map((message, index) => (
                <ListItem key={message.id || index} component={Paper} sx={{ mb: 1 }}>
                  <ListItemText
                    primary={
                      <Box>
                        <Typography variant="subtitle2">
                          {index + 1}. {message.event}
                        </Typography>
                        {message.delay && (
                          <Typography variant="caption" color="primary">
                            Delay: {message.delay}ms
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {formatPayload(message.payload)}
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton size="small" onClick={() => handleEditMessage(index)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteMessage(index)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      )}

      {messageDialogOpen && (
        <WebSocketMessageEditor
          open={messageDialogOpen}
          message={editingMessage}
          onSave={handleSaveMessage}
          onClose={() => {
            setMessageDialogOpen(false);
            setEditingMessage(null);
            setEditingIndex(null);
          }}
          isSequence={config.eventType === 'sequence'}
        />
      )}
    </Box>
  );
}