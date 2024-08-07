import LoadingButton from "@mui/lab/LoadingButton";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Typography } from "@mui/material"
import { useEffect, useState } from "react";
import { BUTTONS } from "../../../../consts/analytics";
import { EVENT_KEYS } from "../../../../types/events";
import { emitSocketEvent, reportButtonClick, socket } from "../../../utils";
import styles from './welcomeDialog.module.css'
import { ReactComponent as LogoSvg } from './../../../../../assets/icon.svg';


export const WelcomeDialog = ()=>{
  const [isLoading, setIsLoading] = useState(false);

    const handleActivate = ()=>{
      reportButtonClick(BUTTONS.START_MOCKING)

      setIsLoading(true)
      emitSocketEvent(EVENT_KEYS.APPROVE_ANALYTICS);
    }

    return (
      <Dialog
        open
      >
        <DialogContent className={styles.container}>
          <LogoSvg  className={styles.logo}></LogoSvg>
          <Typography variant="h4" className={styles.title}>
            welcome to Mockingbird
          </Typography>

          <Typography variant='caption' align="center" >
            By continuing, you agree to Mockingbird collecting and analyzing usage data and performance metrics.
          </Typography>
          <Typography variant='caption' align="center" marginBottom={'20px'}>
            Mockingbird does not collect your personal data.
          </Typography>
          <LoadingButton
                variant="contained"
                onClick={handleActivate}
                loading={isLoading}
                className={styles.button}
                color='secondary'
            >
                Start Mocking
            </LoadingButton>
        </DialogContent>
      </Dialog>
    )
}