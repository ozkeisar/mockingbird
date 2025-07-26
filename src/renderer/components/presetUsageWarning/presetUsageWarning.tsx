import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LaunchIcon from '@mui/icons-material/Launch';
import { useGeneralStore } from '../../state/general';
import { useProjectStore } from '../../state/project';

type PresetInfo =
  | { folderName: string; presetName: string }
  | { folder: string; preset: string };

interface PresetUsageWarningProps {
  isChecking?: boolean;
  usedInPresets: PresetInfo[];
  entityType: 'parent' | 'server' | 'route' | 'response';
}

export function PresetUsageWarning({
  isChecking = false,
  usedInPresets,
  entityType,
}: PresetUsageWarningProps) {
  const { setSelectedPreset, setSelectedTab } = useGeneralStore();
  const { presetFoldersHash } = useProjectStore();

  if (isChecking) {
    return (
      <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
        Checking preset usage...
      </Typography>
    );
  }

  if (usedInPresets.length === 0) {
    return null;
  }

  // Normalize the preset data to handle both formats
  const normalizedPresets = usedInPresets.map((preset) => {
    if ('folderName' in preset) {
      return { folderName: preset.folderName, presetName: preset.presetName };
    }
    return { folderName: preset.folder, presetName: preset.preset };
  });

  const handlePresetClick = (folderName: string, presetName: string) => {
    // Find the folder ID by name
    const folder = Object.values(presetFoldersHash || {}).find(
      (f) => f.name === folderName,
    );

    if (!folder) return;

    // Find the preset ID by name within the folder
    const preset = Object.values(folder.presetsHash || {}).find(
      (p) => p.name === presetName,
    );

    if (!preset) return;

    // Navigate to the preset
    setSelectedTab('presets');
    setSelectedPreset({
      folderId: folder.id,
      presetId: preset.id,
    });
  };

  const getWarningMessage = () => {
    switch (entityType) {
      case 'route':
        return 'This route is used in the following presets:';
      case 'response':
        return 'This response is used in the following presets:';
      case 'parent':
      case 'server':
        return `This ${entityType} contains routes that are used in the following presets:`;
      default:
        return 'This item is used in the following presets:';
    }
  };

  const getConsequenceMessage = () => {
    switch (entityType) {
      case 'route':
        return 'Deleting this route will make these presets unusable for this specific route.';
      case 'response':
        return 'Deleting this response will affect these presets that rely on this specific response.';
      case 'parent':
      case 'server':
        return `Deleting this ${entityType} will make these presets unusable for the affected routes.`;
      default:
        return 'Deleting this item will affect these presets.';
    }
  };

  return (
    <Alert severity="warning" sx={{ mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        ⚠️ Warning: {getWarningMessage()}
      </Typography>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="preset-usage-content"
          id="preset-usage-header"
        >
          <Typography variant="body2">
            View {normalizedPresets.length} affected preset
            {normalizedPresets.length > 1 ? 's' : ''}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            {normalizedPresets.map((preset) => (
              <ListItem
                key={preset.folderName + preset.presetName}
                disablePadding
              >
                <ListItemButton
                  onClick={() =>
                    handlePresetClick(preset.folderName, preset.presetName)
                  }
                  sx={{
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemText
                    primary={preset.presetName}
                    secondary={`Folder: ${preset.folderName} • Click to navigate`}
                  />
                  <ListItemIcon sx={{ minWidth: 'auto', ml: 1 }}>
                    <LaunchIcon fontSize="small" color="action" />
                  </ListItemIcon>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
      <Typography variant="body2" sx={{ mt: 1 }}>
        {getConsequenceMessage()}
      </Typography>
    </Alert>
  );
}
