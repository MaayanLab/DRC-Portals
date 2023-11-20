'use client'

import { Button } from "@mui/material"
import { Prisma } from "@prisma/client";
import { useCallback, useEffect, useMemo, useState } from "react"
import { BsCheckCircleFill } from "react-icons/bs";


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
    creator: string;
    approved: boolean;
    drcapproved: boolean;
    annotation: Prisma.JsonValue;
    dcc_drc: string
}) {

    const [btnChange, setBtnChange] = useState(false);
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
            creator: string;
            approved: boolean;
            drcapproved: boolean;
            annotation: Prisma.JsonValue;
            dcc_drc: string
        }) => async () => {
            console.log(file)
            let data = {
                dcc_id: file.dcc_id,
                filetype: file.filetype,
                filename: file.filename,
                link: file.link,
                lastmodified: file.lastmodified.toISOString(),
                creator: file.creator,
                approved: file.approved,
                drcapproved: file.drcapproved,
                dcc_drc: file.dcc_drc
            }
            let uploadStatusChange = await fetch('/api/approvalupdate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(data),
            })
            if (!uploadStatusChange.ok) throw new Error(await uploadStatusChange.text())
            setBtnChange(true)
        },
        [],
    )

   
    const [statusEl, setStatusEl] = useState( <Button onClick={handleClick(userFile)}> Approve Upload</Button>)

    useEffect(()=> {
        if( btnChange === true ){ 
            setStatusEl(<BsCheckCircleFill size={20}/>)
        }
    }, [btnChange])

    return statusEl
}