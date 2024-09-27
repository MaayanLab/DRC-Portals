'use client'

import Button from "@mui/material/Button"
import Image from "next/image"
import G2SGIcon from '@/public/img/icons/g2sg-logo.png'
import CardButton from "@/app/data/processed/CardButton"
import * as React from 'react';

export default function G2SGButton(props: React.PropsWithChildren<{ title: React.ReactNode, description: React.ReactNode, body: any }>) {
    return <CardButton
        icon={<Image src={G2SGIcon} alt="GeneSetCart" height={64} />}
        title={props.title}
        description={props.description}
    >
        <Button
            color="secondary"
            size="small"
            onClick={async () => {
                    const req = await fetch('https://genesetcart.cfde.cloud/api/addUserGeneset', {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(props.body),
                    })
                    const { geneset_url } = await req.json()
                    window.open(geneset_url, '_blank')
            }}
        >Submit</Button>
    </CardButton>
}