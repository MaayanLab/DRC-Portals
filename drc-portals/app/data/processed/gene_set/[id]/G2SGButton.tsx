'use client'

import Button from "@mui/material/Button"
import Image from "next/image"
import G2SGIcon from '@/public/img/icons/g2sg-logo.png'
import CardButton from "@/app/data/processed/CardButton"

import * as React from 'react';
import Cookies from "js-cookie"

export default function G2SGButton(props: React.PropsWithChildren<{ title: React.ReactNode, description: React.ReactNode, body: any }>) {
    return <CardButton
        icon={<Image src={G2SGIcon} alt="Get-Gene-Set-Go" height={64} />}
        title={props.title}
        description={props.description}
    >
        <Button
            color="secondary"
            size="small"
            onClick={async () => {
                const currentG2SGSession = Cookies.get('session_id')
                if (currentG2SGSession === undefined) {
                    const req = await fetch('http://localhost:3001/api/addGeneset', {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(props.body),
                    })
                    const { session_id } = await req.json()
                    window.open(`http://localhost:3001/analyze/${session_id}`, '_blank')
                } else {
                    const bodyWithSession = { ...props.body, session_id: currentG2SGSession }
                    const req = await fetch('http://localhost:3001/api/addToSession', {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(bodyWithSession),
                    })
                    if (req.status === 400) {
                        const errorText = await req.json()
                    } else {
                        const { session_id } = await req.json()
                        window.open(`http://localhost:3001/analyze/${session_id}`, '_blank')
                    }
                }
            }}
        >Submit</Button>
    </CardButton>
}