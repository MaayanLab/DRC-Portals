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
                console.log(currentG2SGSession)
                if (currentG2SGSession === undefined) {
                    const req = await fetch('https://g2sg.cfde.cloud/api/addGeneset', {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(props.body),
                    })
                    const { session_id } = await req.json()
                    window.open(`https://g2sg.cfde.cloud/analyze/${session_id}`, '_blank')
                } else {
                    const bodyWithSession = { ...props.body, session_id: currentG2SGSession }
                    const req = await fetch('https://g2sg.cfde.cloud/api/addToSession', {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(bodyWithSession),
                    })
                    if (!req.ok) {
                        const errorText = await req.json()
                        console.log(errorText)
                        // TO DO: add error handling here 
                    } else {
                        const { session_id } = await req.json()
                        window.open(`https://g2sg.cfde.cloud/analyze/${session_id}`, '_blank')
                    }
                }
            }}
        >Submit</Button>
    </CardButton>
}