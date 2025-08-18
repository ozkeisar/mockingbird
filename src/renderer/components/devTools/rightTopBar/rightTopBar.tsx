import { IconButton, InputBase, Tooltip, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import VerticalAlignCenterIcon from '@mui/icons-material/VerticalAlignCenter';
import AddIcon from '@mui/icons-material/Add';
import styles from './RightTopBar.module.css';

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onCenter: () => void;
  onClear: () => void;
  onFullScreen: () => void;
  onCreatePreset?: () => void;
  showMaximize: boolean;
  showMinimize: boolean;
  showFullScreen: boolean;
  showClear: boolean;
  showSearch: boolean;
  showCenter: boolean;
  showCreatePreset?: boolean;
};

export function RightTopBar({
  search,
  onSearchChange,
  onMinimize,
  onMaximize,
  onClear,
  onFullScreen,
  onCenter,
  onCreatePreset,
  showMaximize,
  showMinimize,
  showCenter,
  showFullScreen,
  showClear,
  showSearch,
  showCreatePreset,
}: Props) {
  return (
    <div className={styles.endContainer}>
      {showCreatePreset && (
        <Button
          variant="text"
          size="small"
          startIcon={<AddIcon />}
          onClick={onCreatePreset}
          sx={{ mr: 1 }}
        >
          Create Preset
        </Button>
      )}

      {showSearch && (
        <div className={styles.inputWrapper}>
          <InputBase
            className={styles.input}
            onChange={(e) => {
              onSearchChange(e.target.value);
            }}
            value={search}
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search"
            inputProps={{ 'aria-label': 'search google maps' }}
          />
        </div>
      )}

      {showClear && (
        <Tooltip title="clear all">
          <IconButton
            edge="start"
            color="inherit"
            onClick={onClear}
            aria-label="close"
            size="small"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {showMinimize && (
        <Tooltip title="minimize">
          <IconButton
            edge="start"
            color="inherit"
            onClick={onMinimize}
            aria-label="close"
            size="small"
          >
            <KeyboardDoubleArrowDownIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {showCenter && (
        <Tooltip title="center">
          <IconButton
            edge="start"
            color="inherit"
            onClick={onCenter}
            aria-label="close"
            size="small"
          >
            <VerticalAlignCenterIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {showMaximize && (
        <Tooltip title="maximize">
          <IconButton
            edge="start"
            color="inherit"
            onClick={onMaximize}
            aria-label="close"
            size="small"
          >
            <KeyboardDoubleArrowUpIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {showFullScreen && (
        <Tooltip title="full screen">
          <IconButton
            edge="start"
            color="inherit"
            onClick={onFullScreen}
            aria-label="close"
            size="small"
          >
            <FullscreenIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
}
