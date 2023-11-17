'use client'

import prisma from "@/lib/prisma";
import { Button } from "@mui/material"
import { Prisma } from "@prisma/client";
import { useCallback, useEffect, useMemo, useState } from "react"
import { BsCheckCircle } from "react-icons/bs";


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
    annotation: Prisma.JsonValue;
}) {

    const [btnChange, setBtnChange] = useState(false);

    const approvalStateIcon = useMemo(
        () => {
            if (btnChange === true){
                return <Button onClick={handleClick(userFile)}> Approve Upload</Button>
            } else {
                <BsCheckCircle />
            }
        },
        [btnChange]
      );

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
            annotation: Prisma.JsonValue;
        }) => async () => {
            console.log(file)
            let data = {
                dcc_id: file.dcc_id,
                filetype: file.filetype,
                filename: file.filename,
                link: file.link,
                lastmodified: file.lastmodified.toISOString(),
                creator: file.creator,
                approved: file.approved
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
        },
        [],
    )

    return <Button onClick={handleClick(userFile)}> Approve Upload</Button>
}