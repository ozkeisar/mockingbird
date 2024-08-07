import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import styles from './consoleDialog.module.css'
import { BUTTONS } from '../../../../consts/analytics';
import { reportButtonClick } from '../../../utils';
import { Console } from '../../devTools/console';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useState } from 'react';
import { useLoggerStore } from '../../../state/logger';


const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
      children: React.ReactElement;
    },
    ref: React.Ref<unknown>,
  ) {
    return <Slide direction="up" ref={ref} {...props} />;
  });
  
type Props = {
    open: boolean;
    onClose: ()=> void;
}

  
export const ConsoleDialog = ({ open, onClose }:Props)=>{
  const { resetLoggerState } = useLoggerStore();

  const [search, setSearch] = useState('');


  function handleClose() {
    reportButtonClick(BUTTONS.CONSOLE_CLOSE);
    onClose();
  }

  const handleClear = ()=>{
    reportButtonClick(BUTTONS.CONSOLE_CLEAR)
    resetLoggerState()
  }

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
    >
       <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Console
            </Typography>
            <div style={{
              display:'flex',
              justifyContent:'flex-start',
              width:"100%",
              marginLeft:'35px'
            }}>
              <TextField 
                style={{width:"250px"}}
                value={search}
                onChange={(e)=>{
                  setSearch(e.target.value)
                }}
                label="search" 
                variant='filled' 
              />
            </div>
            <Button variant='outlined' color="inherit" onClick={handleClear}>
              Clear
            </Button>
            <Button autoFocus color="inherit" onClick={handleClose}>
              exit
            </Button>
          </Toolbar>
        </AppBar>
      <Console search={search} />
    </Dialog>
  )
}
  