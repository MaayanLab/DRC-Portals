'use client'

import { Button } from "@mui/material"
import { useCallback, useEffect, useState } from "react"
import { BsCheckCircleFill } from "react-icons/bs";
import { updateAssetCurrent } from "./getDCCAsset";
import type { DccAsset } from '@prisma/client'

export default function CurrentBtn(userFile: {
    dcc: {
        label: string;
    } | null;
} & DccAsset 
) {
    const [status, setStatus] = useState(false);

    const handleClick = useCallback(
        (file: {
            dcc: {
                label: string;
            } | null;
        } & DccAsset) => async () => {

            await updateAssetCurrent(file)
        },
        [],
    )
 
    useEffect(() => {
            if (userFile.current) {
                setStatus(true)
            } else {
                setStatus(false)
            }

    }, [userFile])

    if (userFile.deleted === true) return <Button variant="contained" color="error"> Deleted </Button>
    return (
        <>
        {status &&  <Button variant="contained" color="tertiary" onClick={handleClick(userFile)}> Current </Button> }
        {!status &&  <Button variant="contained" color="tertiary" onClick={handleClick(userFile)}> Archived </Button> }
        </>
       
    );
}