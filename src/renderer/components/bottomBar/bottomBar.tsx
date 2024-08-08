import Typography from '@mui/material/Typography'
import styles from './bottomBar.module.css'
import pjson from './../../../../package.json'
import { useProjectStore } from '../../state/project'
import { ReactComponent as GitIcon } from './../../../../assets/svg/Git-Icon-White.svg'; 
import { useState } from 'react';
import { BranchDialog } from '../dialogs';
import { reportButtonClick } from '../../utils';
import { BUTTONS } from '../../../consts/analytics';


export const BottomBar = ()=>{
    const { currentBranch, activeProjectName, isGitInit } = useProjectStore();
    const [isBranchDialogOpen, setIsBranchDialogOpen] = useState(false);

    const handleBranchNameClicked = ()=>{
        reportButtonClick(BUTTONS.BRANCH_NAME)
        setIsBranchDialogOpen(true)
    }

    return (
        <div className={styles.container}>
            <div className={styles.left}>
                {isGitInit && activeProjectName && <div className={styles.gitBtn} onClick={handleBranchNameClicked}>
                    <GitIcon className={styles.gitIcon}/>
                    <Typography variant="subtitle2" className={styles.branchName}>{currentBranch}</Typography>
                </div>}
            </div>
            <div>
                <Typography className={styles.version} variant="subtitle2">v{pjson.version}</Typography>
            </div>
            {isBranchDialogOpen && <BranchDialog open={isBranchDialogOpen} onClose={()=>{
                setIsBranchDialogOpen(false)}}
            />}
        </div>
    )
}