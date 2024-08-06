import React from 'react'
import { Button } from '@mui/material'
import Link from 'next/link'

const ENDPOINT = 'https://playbook-workflow-builder.cloud'

export default function LinkButton({link, text}: {link:string, text?:string}) {
    
    return (
        <>
        <Link href={link} target='_blank'>
            <Button variant='outlined'>
                <div className='flex-row'>
                {text}
                </div>
            </Button>
        </Link>
        </>
    )
}