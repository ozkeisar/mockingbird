/* eslint-disable jsx-a11y/no-static-element-interactions */
import { useState } from 'react';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { Details, SideBar, TopBar, ParentDialog } from '../../components';
import './main.css';
import { RouteParent } from '../../../types';
import { useProjectStore } from '../../state/project';
import { CloneProject } from '../../components/cloneProject';
import { BottomBar } from '../../components/bottomBar';
import { MainSideBar } from '../../components/mainSideBar';
import { useResizeElement } from '../../hooks';
import { WelcomeDialog } from '../../components/dialogs/welcomeDialog';
import { useGeneralStore } from '../../state';
import DevTools from '../../components/devTools/devTools';

export function Main() {
  const { appSettings, selectedTab, setSelectedTab } = useGeneralStore();
  const { activeProjectName, isLoadingData } = useProjectStore();

  const [isParentDialogOpen, setIsParentDialogOpen] = useState(false);
  const [editParentData, setEditParentData] = useState<RouteParent | null>(
    null,
  );
  const [defaultServerName, setDefaultServerName] = useState<string | null>(
    null,
  );

  const {
    startResizing: startSideBarResizing,
    elementRef: sidebarRef,
    size: sidebarWidth,
  } = useResizeElement({ baseline: 'left', initSize: 238 });

  const {
    startResizing: startConsoleResizing,
    elementRef: consoleRef,
    size: devToolsHeight,
    setSize: setDevToolsHeight,
  } = useResizeElement({ baseline: 'bottom', initSize: 168 });

  const handleAddEditParent = ({
    data,
    serverName,
  }: {
    data: RouteParent | null;
    serverName: string;
  }) => {
    setEditParentData(data);
    setDefaultServerName(serverName);
    setIsParentDialogOpen(true);
  };

  const handleClose = () => {
    setEditParentData(null);
    setDefaultServerName(null);
    setIsParentDialogOpen(false);
  };

  return (
    <>
      <div className="main-container">
        <TopBar />
        {!activeProjectName && !isLoadingData ? (
          <CloneProject />
        ) : (
          <div className="body">
            <MainSideBar
              selectedTab={selectedTab}
              onSelectedTab={(val) => {
                if (selectedTab === val) {
                  setSelectedTab(null);
                } else {
                  setSelectedTab(val);
                }
              }}
            />
            <div className="body-content-wrapper">
              <div className="body-content">
                <div
                  ref={sidebarRef}
                  className="app-sidebar"
                  style={{ width: selectedTab ? sidebarWidth : undefined }}
                >
                  <div className="side-bar-container">
                    {selectedTab && (
                      <SideBar
                        selectedTab={selectedTab}
                        onAddParent={handleAddEditParent}
                      />
                    )}
                  </div>
                  <div
                    className="app-sidebar-resizer"
                    onMouseDown={startSideBarResizing}
                  />
                </div>
                <div className="details-wrapper">
                  <Details />
                </div>
              </div>
              <div
                ref={consoleRef}
                className="console-wrapper"
                style={{ height: devToolsHeight }}
              >
                <div
                  className="console-resizer"
                  onMouseDown={startConsoleResizing}
                />
                <DevTools
                  onCenter={() => setDevToolsHeight('50%')}
                  onMinimize={() => setDevToolsHeight(40)}
                  onMaximize={() => setDevToolsHeight('100%')}
                  devToolsHeight={devToolsHeight}
                />
              </div>
            </div>
          </div>
        )}
        {isLoadingData && (
          <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={isLoadingData}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
        )}
        <BottomBar />
      </div>
      {isParentDialogOpen && (
        <ParentDialog
          open
          onClose={handleClose}
          data={editParentData}
          defaultServerName={defaultServerName || undefined}
        />
      )}
      {!appSettings?.userApproveAnalytics && <WelcomeDialog />}
    </>
  );
}
