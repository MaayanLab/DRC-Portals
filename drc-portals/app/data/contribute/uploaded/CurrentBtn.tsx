'use client'

import { Button } from "@mui/material"
import { Prisma } from "@prisma/client";
import { useCallback, useEffect, useMemo, useState } from "react"
import { BsCheckCircleFill } from "react-icons/bs";
import { getDCCAsset, getDCCAssetCurrent, updateAssetApproval, updateAssetCurrent } from "./getDCCAsset";

export default function CurrentBtn(userFile: {
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
    const [status, setStatus] = useState(false);

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
                current: file.current,
                dccapproved: file.dccapproved,
                drcapproved: file.drcapproved,
                dcc_drc: file.dcc_drc
            }

            await updateAssetCurrent(data)

            let updatedFile = await getDCCAssetCurrent(data)
            if (!updatedFile) throw new Error('asset not found')
                let updatedFileComplete = { ...updatedFile, dcc_drc: 'dcc' }
                setCurrentFile(updatedFileComplete)
        },
        [],
    )


    useEffect(() => {
            if (currentfile.current) {
                setStatus(true)
            } else {
                setStatus(false)
            }

    }, [currentfile])

    return (
        <>
        {status &&  <Button variant="contained" color="tertiary" onClick={handleClick(currentfile)}> <BsCheckCircleFill size={20} /> </Button> }
        {!status &&  <Button variant="contained" color="tertiary" onClick={handleClick(currentfile)}> Set as Current</Button> }
        </>
       
    );
}