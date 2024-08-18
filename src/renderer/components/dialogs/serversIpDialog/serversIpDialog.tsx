import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useProjectStore } from '../../../state/project';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useGeneralStore } from '../../../state';
import Tooltip from '@mui/material/Tooltip';
import Link from '@mui/material/Link';
import { useEffect, useState } from 'react';
import { reportButtonClick } from '../../../utils';
import { BUTTONS } from '../../../../consts/analytics';

type Props = {
    onClose: Function;
    open: boolean;
}


  
export const ServersIpDialog = ({onClose, open }:Props)=>{
    const { serversHash, activeProjectName } = useProjectStore();
    const { host } = useGeneralStore()
    const [clipboardData, setClipBoardData] = useState('');

    useEffect(()=>{
        const copyInterval = setInterval(async ()=>{
            try {
                const text = await navigator.clipboard.readText()
                setClipBoardData(text)
            } catch (error) {
                console.log('Error getting copied text', error)
            }
        }, 1000);

        return ()=>{
            clearInterval(copyInterval)
        }
    },[])
    
    const rows = [{name: "base url", address: `http://${host}`}, ...Object.values(serversHash).map(({name, settings})=>{
        return {name, address: `http://${host}:${settings.port}`}
    })]


    const handleClose = ()=>{
        reportButtonClick(BUTTONS.SERVERS_IPS_DIALOG_CLOSE)
        onClose()
    }

    return (
      <Dialog
       open={open}
       onClose={handleClose}>
       <DialogTitle>Server Ip's</DialogTitle>
       <DialogContent>
        
       <TableContainer component={Paper}>
     <Table sx={{ minWidth: 350 }} aria-label="simple table">
       <TableHead>
         <TableRow>
           <TableCell>Server</TableCell>
           <TableCell align="right">address</TableCell>
         </TableRow>
       </TableHead>
       <TableBody>
         {rows.map((row) => (
           <TableRow
             key={row.name}
             sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
           >
               <TableCell component="th" scope="row">
                   {row.name}
               </TableCell>
               <TableCell align="right">
                   <Tooltip title={clipboardData === row.address ? 'copied' : 'copy' }>
                       <Link
                           component="button"
                           variant="body1"
                           onClick={async () => {
                               reportButtonClick(BUTTONS.SERVERS_IPS_DIALOG_LINK)
                               navigator.clipboard.writeText(row.address)
                               const text = await navigator.clipboard.readText();
                               setClipBoardData(text)
                           }}
                       >
                           {row.address}
                       </Link>
                   </Tooltip>
               </TableCell>
           </TableRow>
         ))}
       </TableBody>
     </Table>
   </TableContainer>
           
          
    
       </DialogContent>
       <DialogActions>
           <Button onClick={handleClose}>Close</Button>
       </DialogActions>
    </Dialog>
   )
 }
 