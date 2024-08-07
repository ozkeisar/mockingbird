import { Autocomplete, createFilterOptions, Dialog, DialogContent, TextField } from "@mui/material"
import { useEffect, useState } from "react";
import { ELEMENTS } from "../../../../consts/analytics";
import { EVENT_KEYS } from "../../../../types/events";
import { useProjectStore } from "../../../state/project";
import { emitSocketEvent, reportElementClick, socket } from "../../../utils";
import { CheckoutBranchDialog } from "../checkoutBranchDialog";
import styles from './branchDialog.module.css'

const filter = createFilterOptions<{label:string, id: string}>();


export const BranchDialog = ({open, onClose}: {open: boolean, onClose: ()=>void})=>{
    const {hasDiffs, setHasDiffs} = useProjectStore()
    const [branchName, setBranchName] = useState('');
    const [currentBranchName, setCurrentBranchName] = useState('');
    const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
    
    const { activeProjectName, branches } = useProjectStore();
    const [_branches, setBranches] = useState<{id: string, label: string}[]>(branches.map((label)=>({id: label, label})));

    useEffect(()=>{
        emitSocketEvent(EVENT_KEYS.BRANCH_LIST, { projectName: activeProjectName});
    },[])

    useEffect(()=>{
        const onEvent = (arg: any) => {
            const { success, branches, projectName, hasDiff, currentBranch } = arg;
            if(success && projectName === activeProjectName){
                setBranches(branches.map((name: string)=>({id: name, label: name})))
                setHasDiffs(hasDiff)
                setCurrentBranchName(currentBranch)
            }
        }
        socket.on(EVENT_KEYS.BRANCH_LIST, onEvent);

        return ()=>{
            socket.off(EVENT_KEYS.BRANCH_LIST, onEvent)
        }
    },[onClose]);

    useEffect(()=>{
        const onEvent = (arg: any) => {
            const { success } = arg;

            if(success){
                onClose();
            }
        }
        socket.on(EVENT_KEYS.CHECKOUT_TO_BRANCH, onEvent);

        return ()=>{
            socket.off(EVENT_KEYS.CHECKOUT_TO_BRANCH, onEvent)
        }
    },[onClose])

    const handleCheckout = (name: string, withCommit = false)=>{
        emitSocketEvent(EVENT_KEYS.CHECKOUT_TO_BRANCH, { 
            projectName: activeProjectName,
            branchName: name,
            withCommit,
            createNewBranch: !_branches.some((branch)=>branch.id === name)
        });
        onClose();
    }

    const handleBranchSelected = (value: string)=>{
        if(value !== currentBranchName){
            setBranchName(value)

            if(hasDiffs){
                setIsCheckoutDialogOpen(true)
            }else{
                handleCheckout(value, false)
            }
        }else{
            onClose()
        }
    }

    return (
        <>
      <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className={styles.container}
        fullScreen
        fullWidth
        PaperProps={{
            style: {
              backgroundColor: 'transparent',
              boxShadow: 'none',
              backgroundImage: 'none'
            },
          }}
      >
       <DialogContent className={styles.content}>
            <Autocomplete
                open
                onClick={(e)=>{
                    e.stopPropagation();
                }}
                disablePortal
                id="combo-box-demo"
                options={_branches}
                sx={{ width: 450 }}
                onChange={(e, value)=>{
                    reportElementClick(ELEMENTS.BRANCH_DIALOG_SELECT_BRANCH)
                    handleBranchSelected(value?.id || '')
                }}
                filterOptions={(options, params) => {
                    const filtered = filter(options, params);
                        if(branchName.length >0){
                            filtered.unshift({
                                id: branchName,
                                label: `+ create branch '${branchName}'`,
                            });
                        }
                     
            
                    return filtered;
                  }}
                renderInput={(params) => 
                    <TextField 
                        {...params}
                        autoFocus
                        onClick={(e)=>{
                            e.stopPropagation()
                        }}
                        style={{width:"100%"}}
                        value={branchName}
                        onChange={(e)=>{
                            setBranchName(e.target.value)
                        }}
                        className={styles.branchInput} 
                        label="select branch" 
                        variant='outlined' 
                    />
                }
            />
          <div style={{flex:1}} onClick={(e)=>{
            reportElementClick(ELEMENTS.BRANCH_DIALOG_BACKDROP)

            onClose()
          }}></div>
        </DialogContent>
      </Dialog>
      {isCheckoutDialogOpen && <CheckoutBranchDialog 
        open 
        onClose={()=>setIsCheckoutDialogOpen(false)} 
        onCommit={()=>{
            handleCheckout(branchName, true)
        }}
        onUndo={()=>{
            handleCheckout(branchName)
        }}
        />}
      </>
    )
}