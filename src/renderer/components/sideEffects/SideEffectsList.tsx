import React from 'react';
import {
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Switch,
  Typography,
  Box,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { SideEffect } from '../../../types/sideEffects';

interface Props {
  sideEffects: SideEffect[];
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onTest: (sideEffect: SideEffect) => void;
}

export function SideEffectsList({
  sideEffects,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
  onTest
}: Props) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'websocket':
        return 'primary';
      case 'kafka':
        return 'secondary';
      case 'rest':
        return 'success';
      case 'graphql':
        return 'warning';
      case 'grpc':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<AddIcon />}
          onClick={onAdd}
          variant="outlined"
          size="small"
        >
          Add Side Effect
        </Button>
      </Box>
      
      {sideEffects.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No side effects configured
        </Typography>
      ) : (
        sideEffects.map((effect) => (
          <Card
            key={effect.id}
            variant="outlined"
            sx={{ mb: 1 }}
          >
            <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Switch
                    size="small"
                    checked={effect.enabled}
                    onChange={() => onToggle(effect.id)}
                  />
                  <Typography variant="subtitle2">
                    {effect.name}
                  </Typography>
                  <Chip
                    label={effect.type}
                    size="small"
                    color={getTypeColor(effect.type)}
                  />
                  {effect.delay && (
                    <Chip
                      label={`${effect.delay}ms delay`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
                
                <Box>
                  <Tooltip title="Test side effect">
                    <IconButton
                      size="small"
                      onClick={() => onTest(effect)}
                      disabled={!effect.enabled}
                    >
                      <PlayArrowIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => onEdit(effect.id)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => onDelete(effect.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              {effect.description && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5, display: 'block' }}
                >
                  {effect.description}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
}