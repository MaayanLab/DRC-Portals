'use client'
import {usePathname} from 'next/navigation'
import Link from 'next/link'
import Typography from '@mui/material/Typography'

export default function DataPortalButton() {
    const path = usePathname()
    if (path.split("/").length < 3) return null
    else return (
        <Link href="/data">
            <Typography variant="nav">DATA PORTAL</Typography>
        </Link>
    )
}