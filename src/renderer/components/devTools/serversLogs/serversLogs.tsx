import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Console } from 'console-feed'
import { EVENT_KEYS } from '../../../../types/events';
import {
  socket,
} from '../../../utils';
import { v4 as uuid } from 'uuid';


type Methods = 'log' | 'debug' | 'info' | 'warn' | 'error' | 'table' | 'clear' | 'time' | 'timeEnd' | 'count' | 'assert' | 'command' | 'result' | 'dir';


export interface Message {
    id: string
    method: Methods
    data: any[]
    timestamp?: string
    amount?: number
}


const getNumberStringWithWidth = (num: Number, width: number) => {
    const str = num.toString()
    if (width > str.length) return '0'.repeat(width - str.length) + str
    return str.substr(0, width)
  }


const getTimestamp = () => {
    const date = new Date()
    const h = getNumberStringWithWidth(date.getHours(), 2)
    const min = getNumberStringWithWidth(date.getMinutes(), 2)
    const sec = getNumberStringWithWidth(date.getSeconds(), 2)
    const ms = getNumberStringWithWidth(date.getMilliseconds(), 3)
    return `${h}:${min}:${sec}.${ms}`
}


export const ServersLogs = forwardRef(function ServersLogs(props: any, ref: React.Ref<unknown>) {
    const [logs, setLogs] = useState<Message[]>([])


    useEffect(() => {
        const onEvent = (arg: any) => {
            setLogs((prev: Message[])=>[
                ...prev,
                {
                    method: arg.method,
                    data: arg.data,
                    id: uuid(),
                    timestamp: getTimestamp(),
                }
            ])
        }

        socket.on(EVENT_KEYS.SERVERS_CONSOLE, onEvent);

        return () => {
            socket.off(EVENT_KEYS.SERVERS_CONSOLE, onEvent);
        };
    }, []);

    const clear = () => {
        setLogs([])
    }

    useImperativeHandle(ref, ()=>{
        return {
            clear,
        }
    }, [])

  return (
    <div
      style={{
        display: 'flex',
        overflow:'scroll',
        height: '100%',
        width: '100%',
        position: 'relative',
        backgroundColor: 'black'
      }}
    >
     <Console 
        styles={{
              // Log icons sizes
            LOG_ICON_WIDTH: 0,
            LOG_ICON_HEIGHT: 0,

            // Base styling
            LOG_COLOR: '#ffffff', // Default log text color
            LOG_BACKGROUND: 'black', // Dark background color for the logger
            LOG_BORDER: '1px solid #3c3c3c',

            // Info logs
            LOG_INFO_COLOR: '#9cdcfe', // Light blue color for info logs
            // LOG_INFO_ICON: '🛈', // Unicode icon or a custom image URL
            // LOG_INFO_BACKGROUND: '#1e1e1e',
            LOG_INFO_BORDER: '1px solid #2a2a2a',

            // Command logs
            LOG_COMMAND_COLOR: '#dcdcaa', // Yellow color for command logs
            // LOG_COMMAND_ICON: '⚙️', // Unicode icon or a custom image URL
            // LOG_COMMAND_BACKGROUND: '#1e1e1e',
            LOG_COMMAND_BORDER: '1px solid #2a2a2a',

            // Result logs
            LOG_RESULT_COLOR: '#ce9178', // Orange color for result logs
            LOG_RESULT_ICON: '✓', // Unicode icon or a custom image URL
            // LOG_RESULT_BACKGROUND: '#1e1e1e',
            LOG_RESULT_BORDER: '1px solid #2a2a2a',

            // Warn logs
            LOG_WARN_COLOR: '#d7ba7d', // Amber color for warnings
            // LOG_WARN_ICON: '⚠️', // Unicode icon or a custom image URL
            // LOG_WARN_BACKGROUND: '#1e1e1e',
            LOG_WARN_BORDER: '1px solid #3c3c3c',

            // Error logs
            LOG_ERROR_COLOR: '#f48771', // Red color for errors
            // LOG_ERROR_ICON: '❌', // Unicode icon or a custom image URL
            // LOG_ERROR_BACKGROUND: '#f48771',
            LOG_ERROR_BORDER: '1px solid #3c3c3c',

            // Fonts
            BASE_FONT_FAMILY: 'Consolas, "Courier New", monospace',
            BASE_FONT_SIZE: '14px',
            BASE_LINE_HEIGHT: '1.5',

            // Spacing
            PADDING: '1px',

            // React-inspector specific
            BASE_BACKGROUND_COLOR: 'black',
            BASE_COLOR: '#dcdcdc',

            OBJECT_NAME_COLOR: '#c586c0',
            OBJECT_VALUE_NULL_COLOR: '#569cd6',
            OBJECT_VALUE_UNDEFINED_COLOR: '#569cd6',
            OBJECT_VALUE_REGEXP_COLOR: '#d16969',
            OBJECT_VALUE_STRING_COLOR: '#ce9178',
            OBJECT_VALUE_SYMBOL_COLOR: '#4ec9b0',
            OBJECT_VALUE_NUMBER_COLOR: '#b5cea8',
            OBJECT_VALUE_BOOLEAN_COLOR: '#569cd6',
            OBJECT_VALUE_FUNCTION_KEYWORD_COLOR: '#dcdcaa',

            HTML_TAG_COLOR: '#569cd6',
            HTML_TAGNAME_COLOR: '#4ec9b0',
            HTML_TAGNAME_TEXT_TRANSFORM: 'lowercase',
            HTML_ATTRIBUTE_NAME_COLOR: '#9cdcfe',
            HTML_ATTRIBUTE_VALUE_COLOR: '#ce9178',
            HTML_COMMENT_COLOR: '#6a9955',
            HTML_DOCTYPE_COLOR: '#569cd6',

            ARROW_COLOR: '#d7ba7d',
            ARROW_MARGIN_RIGHT: '5px',
            ARROW_FONT_SIZE: '12px',

            TREENODE_FONT_FAMILY: 'Consolas, "Courier New", monospace',
            TREENODE_FONT_SIZE: '14px',
            TREENODE_LINE_HEIGHT: '1.5',
            TREENODE_PADDING_LEFT: '12px',

            TABLE_BORDER_COLOR: '#3c3c3c',
            TABLE_TH_BACKGROUND_COLOR: '#252526',
            TABLE_TH_HOVER_COLOR: '#313131',
            TABLE_SORT_ICON_COLOR: '#dcdcdc',
            TABLE_DATA_BACKGROUND_IMAGE: 'none',
            TABLE_DATA_BACKGROUND_SIZE: 'auto'
        }}
        logs={logs}
        variant="dark" />
    </div>
  );
})
