import styles from './graphqlResponseDetails.module.css'
import Typography from "@mui/material/Typography";
import { GraphQlRouteResponse, RouteResponse } from '../../../../../types';
import { CopyBlock, dracula } from 'react-code-blocks';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';
import JsonView from '@uiw/react-json-view';
import { vscodeTheme } from '@uiw/react-json-view/vscode';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { reportButtonClick } from '../../../../utils';
import { BUTTONS } from '../../../../../consts/analytics';



type Props = {
    response: GraphQlRouteResponse;
    isActive: boolean;
    onEdit?: ()=>void;
    onSetActive?: ()=>void;
    onDelete: ()=>void;
}

export const GraphqlResponseDetails = ({ response, isActive, onDelete, onEdit, onSetActive}:Props)=>{

    const [data, setData] = useState(response.res);
    const isFunc = response?.type === 'func' ;
    const isProxy = response?.type === 'proxy' ;
    const isObj = response.type === 'obj';
    const func = response.exec?.toString() || "";

    useEffect(()=>{
        setData(response.res)
    }, [response.res?.data])
    
    const renderViewMode = ()=>{
        return <div className='code-block-wrapper'>
            {isFunc
                ? <CopyBlock
                    text={isFunc ? func : response.url ?? '' }
                    language={'javascript'}
                    showLineNumbers={true}
                    codeBlock
                    theme={dracula}
                /> 
                : <JsonView 
                    value={isProxy ? {"proxy-url": response.url ?? ''} : data || {}}
                    style={vscodeTheme}
                    displayDataTypes={false}
                    collapsed={2}
                />
            }
         
        </div>
    }

    const handleDelete = ()=>{
        reportButtonClick(BUTTONS.RESPONSE_DETAILS_DELETE)
        onDelete()
    }

    const handleEdit = ()=>{
        reportButtonClick(BUTTONS.RESPONSE_DETAILS_EDIT)
        onEdit?.()
    }

    const handleSetActive = ()=>{
        reportButtonClick(BUTTONS.RESPONSE_DETAILS_SET_ACTIVE)
        onSetActive?.();
    }

    return (
        <div className='response-details-container'>
             <Card variant="outlined" className={ isActive ? 'response-details-card-active' : 'response-details-card'}>
                <Typography variant="h6" gutterBottom className="text">
                    {response.name}
                </Typography>
                <Typography variant="body2" gutterBottom className="text">
                    {response.description}
                </Typography>
                
                {renderViewMode()}
                <div className='btn-container'>
                    {!isActive && <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleDelete}
                        aria-label="close"
                        className='delete-res-btn'
                    >
                        <DeleteIcon />
                    </IconButton>}
                    {!!onEdit && <Button onClick={handleEdit} variant="text">Edit</Button>}
                    {!isActive && !!onSetActive && <Button onClick={handleSetActive} variant="text">set Active</Button>}
                </div>
            </Card>
        </div>
    )

}
