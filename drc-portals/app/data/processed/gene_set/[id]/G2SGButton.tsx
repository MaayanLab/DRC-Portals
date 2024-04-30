'use client'

import Button from "@mui/material/Button"
import Image from "next/image"
import G2SGIcon from '@/public/img/icons/g2sg-logo.png'
import CardButton from "@/app/data/processed/CardButton"

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
            }}
        >Submit</Button>
    </CardButton>
}