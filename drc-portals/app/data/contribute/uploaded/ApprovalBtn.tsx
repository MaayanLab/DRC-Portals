'use client'

import { Button } from "@mui/material"
import { useCallback, useEffect, useState } from "react"
import { BsCheckCircleFill } from "react-icons/bs";
import { updateAssetApproval } from "./getDCCAsset";
import type { DccAsset } from '@prisma/client'

export default function ApprovalBtn(userFile: {
    dcc: {
        label: string;
    } | null;
} & DccAsset & {
    dcc_drc: string
}) {

    const [status, setStatus] = useState(false)
    const handleClick = useCallback(
        (file: {
            dcc: {
                label: string;
            } | null;
        } & DccAsset & {
            dcc_drc: string
        }) => async () => {
            await updateAssetApproval(file)
        },
        [],
    )

    useEffect(() => {
        if (userFile.dcc_drc === 'drc') {
            if (userFile.drcapproved) {
                setStatus(true)
            } else {
                setStatus(false)
            }
        }
        if (userFile.dcc_drc === 'dcc') {
            if (userFile.dccapproved) {
                setStatus(true)
            } else {
                setStatus(false)
            }
        }

    }, [userFile])

    return (
        <>
            {status && <Button variant="contained" color="tertiary" onClick={handleClick(userFile)}> <BsCheckCircleFill size={20} /> </Button>}
            {!status && <Button variant="contained" color="tertiary" onClick={handleClick(userFile)}> Approve Upload</Button>}
        </>
    )
}