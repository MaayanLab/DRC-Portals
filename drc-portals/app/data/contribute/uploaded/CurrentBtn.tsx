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

    return (
        <>
        {status &&  <Button variant="contained" color="tertiary" onClick={handleClick(userFile)}> <BsCheckCircleFill size={20} /> </Button> }
        {!status &&  <Button variant="contained" color="tertiary" onClick={handleClick(userFile)}> Set as Current</Button> }
        </>
       
    );
}