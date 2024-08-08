import { Button, Card, CardActionArea, IconButton, Tooltip, Typography } from "@mui/material"
import { Preset, PresetsFolder } from "../../../../types";
import { useSelectedPreset } from "../../../hooks"
import { useGeneralStore } from "../../../state";
import styles from './presetFolderDetails.module.css'
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import TuneIcon from '@mui/icons-material/Tune';
import { useEffect, useState } from "react";
import { DeletePresetFolderDialog } from "../../dialogs/deletePresetFolderDialog";
import LoadingButton from "@mui/lab/LoadingButton";
import { useProjectStore } from "../../../state/project";
import { checkIsAllRoutesExists, emitSocketEvent, reportButtonClick, reportElementClick, socket } from "../../../utils";
import { PresetDialog, PresetFolderDialog } from "../../dialogs";
import { EVENT_KEYS } from "../../../../types/events";
import { BUTTONS, ELEMENTS } from "../../../../consts/analytics";

export const PresetFolderDetails = ()=>{
    const {presetFolder} = useSelectedPreset();
    const {setSelectedPreset} = useGeneralStore()
    const { activeProjectName, serversHash} = useProjectStore()

    const [isPresetDialogOpen, setIsPresetDialogOpen] = useState(false)
    const [applyLoadingId, setApplyLoadingId] = useState<string | null>(null)
    const [presetFolderId, setPresetFolderId] = useState<string | null>(null);
    const [isPresetFolderDialogOpen, setIsPresetFolderDialogOpen] = useState(false)
    const [isDeletePresetFolderDialogOpen, setIsDeletePresetFolderDialogOpen] = useState(false);

    useEffect(()=>{
        const onEvent = (arg: any) => {
            const {success, projectName } = arg;
            setApplyLoadingId(null)
            if(success && projectName === activeProjectName){
              //todo: handle success
            }
        }
        
        socket.on(EVENT_KEYS.APPLY_PRESET, onEvent);
        return ()=>{socket.off(EVENT_KEYS.APPLY_PRESET, onEvent)}
      },[activeProjectName]);

    const handleApplyPreset = (preset: Preset)=>{
        setApplyLoadingId(preset.id)
        emitSocketEvent(EVENT_KEYS.APPLY_PRESET, {
            preset,
            projectName: activeProjectName,
        }); 
    }
    
    const renderRow = (preset: Preset, presetFolder: PresetsFolder)=>{
        const isAllRoutesExists = checkIsAllRoutesExists(serversHash, preset)

        return (
        <Card
            className={styles.rowContainer}
            variant="outlined"
            onClick={()=>{
                reportElementClick(ELEMENTS.PRESET_FOLDER_DETAILS_PRESET_ROW)
                setSelectedPreset({presetId: preset.id, folderId: presetFolder.id})
            }}
        >
            <CardActionArea>
                <div className={styles.presetRow}>
                    <div className={styles.presetRowDetails}>
                        <TuneIcon />
                        <Typography variant='h6' className={styles.presetTitle}>
                            {preset.name}
                        </Typography>
                        <Typography variant='body2'>
                            {preset.description}
                        </Typography>
                    </div>
                    <div>
                        <Tooltip title='some routes not exists' disableHoverListener={isAllRoutesExists}>
                            <span>
                            <LoadingButton
                                loading={applyLoadingId === preset.id}
                                loadingPosition="center"
                                variant="text"
                                onClick={(e)=>{
                                    reportButtonClick(BUTTONS.PRESET_FOLDER_DETAILS_PRESET_ROW_APPLY)
                                    e.stopPropagation()
                                    handleApplyPreset(preset)
                                }}
                                autoFocus
                                disabled={!isAllRoutesExists}
                            >
                                    apply
                            </LoadingButton>
                            </span>
                        </Tooltip>
                    </div>
                </div>
            </CardActionArea>
        </Card>)
    }

    return (
        <>
        <div className={styles.container}>
            <div className={styles.folderDetails}>
                <Typography variant="h5">{presetFolder?.name}</Typography>
                <div>
                    <Tooltip title={'Edit'}>
                        <IconButton
                                edge="start"
                                color="inherit"
                                onClick={()=>{
                                    reportButtonClick(BUTTONS.PRESET_FOLDER_DETAILS_EDIT)
                                    setIsPresetFolderDialogOpen(true)
                                }}
                                aria-label="close"
                                className='delete-res-btn'
                            >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={'Delete'}>
                        <IconButton
                                edge="start"
                                color="inherit"
                                onClick={()=>{
                                    reportButtonClick(BUTTONS.PRESET_FOLDER_DETAILS_DELETE)
                                    setIsDeletePresetFolderDialogOpen(true)
                                }}
                                aria-label="close"
                                className='delete-res-btn'
                            >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </div>
            </div>
            {!!presetFolder && <div>
                    {Object.values(presetFolder?.presetsHash || {}).map((preset)=>{
                        return renderRow(preset, presetFolder)
                    })}
            </div>}
            <div className={styles.addBtnWrapper}>
                    <Button 
                        className={styles.addBtn}
                        onClick={()=>{
                            reportButtonClick(BUTTONS.PRESET_FOLDER_DETAILS_ADD_PRESET)
                            setPresetFolderId(presetFolder?.id || null)
                            setIsPresetDialogOpen(true)
                        }}
                        variant='text'
                    >
                        Add Preset
                    </Button>
            </div>
        </div>
        {
            isPresetDialogOpen && !!presetFolderId && <PresetDialog
              open
              data={null}
              presetFolderId={presetFolderId}
              onClose={()=>{
                setIsPresetDialogOpen(false)
              }}
            />
        }
        {isPresetFolderDialogOpen && <PresetFolderDialog 
          open
          data={presetFolder || null}
          onClose={()=>{
            setIsPresetFolderDialogOpen(false)
          }}
        />}
        {isDeletePresetFolderDialogOpen && presetFolder && <DeletePresetFolderDialog 
            open
            onClose={()=>{
                setIsDeletePresetFolderDialogOpen(false)
            }}
            presetFolder={presetFolder} 
            />}
        </>
    )
}