'use client'

import { Button } from "@mui/material"
import { Prisma } from "@prisma/client";
import { useCallback, useEffect, useMemo, useState } from "react"
import { BsCheckCircleFill } from "react-icons/bs";
import { getDCCAsset, updateAssetApproval } from "./getDCCAsset";

export default function ApprovalBtn(userFile: {
    dcc: {
        label: string;
    } | null;
} & {
    dcc_id: string;
    filetype: string;
    filename: string;
    link: string;
    size: bigint | null;
    lastmodified: Date;
    current: boolean;
    creator: string | null;
    dccapproved: boolean;
    drcapproved: boolean;
    annotation: Prisma.JsonValue;
    dcc_drc: string
}) {

    const [currentfile, setCurrentFile] = useState(userFile);
    const [statusEl, setStatusEl] = useState( <Button></Button>)


    const handleClick = useCallback(
        (file: {
            dcc: {
                label: string;
            } | null;
        } & {
            dcc_id: string;
            filetype: string;
            filename: string;
            link: string;
            size: bigint | null;
            lastmodified: Date;
            current: boolean;
            creator: string | null;
            dccapproved: boolean;
            drcapproved: boolean;
            annotation: Prisma.JsonValue;
            dcc_drc: string
        }) => async () => {
            let data = {
                dcc_id: file.dcc_id,
                filetype: file.filetype,
                filename: file.filename,
                link: file.link,
                lastmodified: file.lastmodified.toISOString(),
                creator: file.creator,
                dccapproved: file.dccapproved,
                drcapproved: file.drcapproved,
                dcc_drc: file.dcc_drc
            }
            
           await updateAssetApproval(data)

            let updatedFile = await getDCCAsset(data)
            if (!updatedFile) throw new Error('asset not found')
            if( userFile.dcc_drc === 'drc') {
                let updatedFileComplete = {...updatedFile, dcc_drc:'drc' }
                setCurrentFile(updatedFileComplete)
            }
            if( userFile.dcc_drc === 'dcc') {
                let updatedFileComplete = {...updatedFile, dcc_drc:'dcc' }
                setCurrentFile(updatedFileComplete)
            }

        },
        [],
    )

    
    useEffect(()=> {
        if (currentfile.dcc_drc === 'drc') {
            if( currentfile.drcapproved){ 
                setStatusEl(<Button variant="contained" color="tertiary" onClick={handleClick(currentfile)}> <BsCheckCircleFill size={20}/> </Button>)
            } else {
                setStatusEl(<Button variant="contained" color="tertiary" onClick={handleClick(currentfile)}> Approve Upload</Button>)
            }
        }
        if (currentfile.dcc_drc === 'dcc') {
            if( currentfile.dccapproved){ 
                setStatusEl(<Button variant="contained" color="tertiary" onClick={handleClick(currentfile)}> <BsCheckCircleFill size={20}/> </Button>)
            } else {
                setStatusEl(<Button variant="contained" color="tertiary" onClick={handleClick(currentfile)}> Approve Upload</Button>)
            }
        }

    }, [currentfile])

    return statusEl
}