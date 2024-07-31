import React from 'react'
import Image from 'next/image'
import { Button } from '@mui/material'
import Link from '@/utils/link'

const ENDPOINT = 'https://playbook-workflow-builder.cloud'

export default function PlaybookButton({id}: {id:string}) {
    
    return (
        <>
        <Link href={ENDPOINT + '/report/' + id} target='_blank'>
            <Button variant='outlined'>
                <div className='flex-row'>
                Open in the Playbook Workflow Builder
                </div>
            </Button>
        </Link>
        </>
    )
}