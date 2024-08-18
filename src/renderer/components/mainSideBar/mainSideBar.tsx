import IconButton from '@mui/material/IconButton';
import DataObjectIcon from '@mui/icons-material/DataObject';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import TuneIcon from '@mui/icons-material/Tune';
import Tooltip from '@mui/material/Tooltip';
import { BUTTONS } from '../../../consts/analytics';
import { reportButtonClick } from '../../utils';
import { useGeneralStore } from '../../state';
import { MainSideBarTabs } from '../../../types/general';

export function MainSideBar({
  selectedTab,
  onSelectedTab,
}: {
  selectedTab: MainSideBarTabs | null;
  onSelectedTab: (val: MainSideBarTabs | null) => void;
}) {
  const { setOpenSettingsDialog } = useGeneralStore();

  const renderMainSideBar = () => {
    return (
      <>
        <div className="top-icons">
          <Tooltip title="Routes" placement="right">
            <IconButton
              edge="start"
              onClick={() => {
                reportButtonClick(BUTTONS.SIDE_BAR_ROUTES);
                onSelectedTab('routes');
              }}
              aria-label="data"
              sx={{ marginLeft: '0' }}
              color={selectedTab === 'routes' ? 'primary' : 'inherit'}
            >
              <DataObjectIcon fontSize="large" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Search" placement="right">
            <IconButton
              edge="start"
              onClick={() => {
                reportButtonClick(BUTTONS.SIDE_BAR_SEARCH);

                onSelectedTab('search');
              }}
              aria-label="search"
              sx={{ marginLeft: '0' }}
              color={selectedTab === 'search' ? 'primary' : 'inherit'}
            >
              <SearchIcon fontSize="large" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Presets" placement="right">
            <IconButton
              edge="start"
              onClick={() => {
                reportButtonClick(BUTTONS.SIDE_BAR_PRESETS);

                onSelectedTab('presets');
              }}
              aria-label="presets"
              sx={{ marginLeft: '0' }}
              color={selectedTab === 'presets' ? 'primary' : 'inherit'}
            >
              <TuneIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        </div>
        <div className="bottom-icons">
          <IconButton
            color="default"
            onClick={() => {
              setOpenSettingsDialog(true);
            }}
          >
            <SettingsIcon fontSize="large" />
          </IconButton>
        </div>
      </>
    );
  };

  return <div className="main-side-bar">{renderMainSideBar()}</div>;
}
