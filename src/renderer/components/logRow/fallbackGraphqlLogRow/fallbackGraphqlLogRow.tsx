import { useEffect, useRef, useState } from "react";
import { GraphQlRouteType, Method, ServerLog, ServerLogType } from "../../../../types";
import styles from './fallbackGraphqlLogRow.module.css';
import JsonView from '@uiw/react-json-view';
import { vscodeTheme } from '@uiw/react-json-view/vscode';
import { formatDate, getGraphqlRouteBGColor, reportElementClick } from "../../../utils";
import { ELEMENTS } from "../../../../consts/analytics";
import { determineQueryType } from "../../../utils/graphql";


const getBGColor = (type: ServerLogType)=>{
    switch (type) {
        case 'error':
            return '#AC393B'

        case 'local':
            return '#19437D'

        case 'proxy':
            return '#511D66'
        
        default:
            return 'yellow'
    }
}

type props = {
    data: ServerLog[];
    index:number;
    setSize:(index:number, height: number)=>void;
    windowWidth: number;
    onRowClick: (id: string)=>void;
    openRows: {[key:string]: boolean};
}


export const FallbackGraphqlLogRow = ({ openRows, data, index, setSize, windowWidth, onRowClick }: props) => {
    const rowRef = useRef<any>(null);
    const logData = data[data.length - index -1]
    const [isOpen, setIsOpen] = useState(!!openRows[logData.metadata.id]);
    const time = new Date(logData.timestamp);
    const requestUrl = logData.request.url;
    const requestMethod= logData.request.method.toLowerCase() as Method;
    const serverName = logData.metadata.serverName
    const type = logData.metadata.type

    const queryType = determineQueryType(logData.request.body.query) as GraphQlRouteType

    
    useEffect(() => {
      setSize(index, rowRef?.current?.getBoundingClientRect().height);
    }, [setSize, index, windowWidth, isOpen]);

  
    return (
      <div
        ref={rowRef}
        style={{
            fontFamily: "system-ui",
            boxSizing: "border-box",
            border: "1px solid #222",
        }}
      >
        <div className={'collapse-header'} onClick={()=>{
            reportElementClick(ELEMENTS.CONSOLE_LOG_ROW, {isOpen: !isOpen})
            setIsOpen((prev)=>!prev)
            onRowClick(logData.metadata.id)
        }}>
            <div className="type-e-url">
                <div className="type" style={{backgroundColor: getBGColor(type)}}>
                    {type}
                    <div style={{position: 'absolute', fontSize: '10px', backgroundColor: 'gray', top: '-5px', right: '-6px', borderRadius:'6px', padding: '0 2px'}}>{logData.response.status}</div>
                </div>
                <div className={styles.queryType} style={{backgroundColor: getGraphqlRouteBGColor(queryType)}}>
                    {queryType}
                </div>
                <div>
                    <div style={{display:'flex', gap:'10px', fontSize: '10px', lineHeight: '10px', marginBottom: '-2px'}}>
                        <div>{requestMethod}</div>
                        <div>{serverName}</div>
                        <div>{requestUrl}</div>
                    </div>
                    <div style={{display: 'flex', color:'#ff3535'}}>
                       Invalid GraphQl Request
                    </div>
                </div>
            </div>
            <div className="time-e-add">
                <div className="time">{formatDate(time)}</div>
            </div>
        </div>
      
        {isOpen && <div className="log-body">
            <div className="code-container">
                <JsonView value={logData} style={vscodeTheme} displayDataTypes={false} />
            </div>
        </div>}
      </div>
    );
};
