import { useRef, useState } from 'react';
import { useLoggerStore } from '../../state/logger';
import { Console } from './console';
import { CommandsTerminal } from './terminal/terminal';
import { RightTopBar } from './rightTopBar/rightTopBar';
import styles from './devTools.module.css';
import { ConsoleDialog } from '../dialogs/consoleDialog';
import { reportButtonClick } from '../../utils';
import { BUTTONS } from '../../../consts/analytics';
import { ServersLogs } from './serversLogs';

type TabIds = 'console' | 'terminal' | 'serversLogs';

interface Tab {
  id: TabIds;
  title: string;
  counter: number;
}

type Props = {
  onMinimize: () => void;
  onMaximize: () => void;
  onCenter: () => void;
  devToolsHeight: string | number;
};

function DevTools({ onMinimize, onCenter, onMaximize, devToolsHeight }: Props) {
  const { resetLoggerState, serverLogs } = useLoggerStore();
  const [openConsoleDialog, setOpenConsoleDialog] = useState(false);
  const [search, setSearch] = useState('');
  const serversLogsRef = useRef<{ clear: () => void } | null>(null);

  const [selectedId, setSelectedId] = useState<TabIds>('console');
  const showClear = ['console', 'serversLogs'].includes(selectedId);
  const isConsole = selectedId === 'console';

  const handleClear = () => {
    reportButtonClick(BUTTONS.CONSOLE_CLEAR);
    if (selectedId === 'console') {
      resetLoggerState();
    } else if (selectedId === 'serversLogs' && serversLogsRef.current?.clear) {
      serversLogsRef.current.clear();
    }
  };

  const tabs: Tab[] = [
    {
      id: 'console',
      title: 'console',
      counter: serverLogs.length,
    },
    {
      id: 'terminal',
      title: 'terminal',
      counter: 0,
    },
    {
      id: 'serversLogs',
      title: 'servers logs',
      counter: 0,
    },
  ];

  return (
    <>
      <div className={styles.container}>
        <div className={styles.startContainer}>
          {tabs.map((item) => (
            <div
              key={item.id}
              className={
                item.id === selectedId
                  ? styles.nameWrapperActive
                  : styles.nameWrapper
              }
              onClick={() => setSelectedId(item.id)}
            >
              <div className={styles.name}>{item.title}</div>
              {item.counter > 0 && (
                <div className={styles.nameCounter}>{item.counter}</div>
              )}
            </div>
          ))}
        </div>
        <RightTopBar
          search={search}
          onSearchChange={(value: string) => setSearch(value)}
          onCenter={onCenter}
          onMinimize={onMinimize}
          onMaximize={onMaximize}
          onClear={handleClear}
          onFullScreen={() => setOpenConsoleDialog(true)}
          showMaximize={devToolsHeight !== '100%'}
          showMinimize={devToolsHeight !== 40}
          showCenter={devToolsHeight !== '50%'}
          showFullScreen={isConsole}
          showClear={showClear}
          showSearch={isConsole}
        />
      </div>

      <div style={{ position: 'relative', overflow: 'hidden', height: '100%' }}>
        <div
          style={
            selectedId === 'terminal' ? { height: '100%' } : { display: 'none' }
          }
        >
          <CommandsTerminal />
        </div>

        <div
          style={
            selectedId === 'serversLogs'
              ? { height: '100%' }
              : { display: 'none' }
          }
        >
          <ServersLogs ref={serversLogsRef} />
        </div>

        {selectedId === 'console' && <Console search={search} />}

        {/* {selectedId === 2 && <div>Logger Component</div>} */}
      </div>
      {openConsoleDialog && (
        <ConsoleDialog
          open={openConsoleDialog}
          onClose={() => setOpenConsoleDialog(false)}
        />
      )}
    </>
  );
}

export default DevTools;
