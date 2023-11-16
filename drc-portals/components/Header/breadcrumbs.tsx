'use client'
import Link from 'next/link'
import Typography from '@mui/material/Typography'
import Breadcrumbs from '@mui/material/Breadcrumbs'

import {usePathname} from 'next/navigation'

export default function NavBreadcrumbs() {
    const path = usePathname().replace("/", "").split("/")
    if (path.length < 2) return null
    else {
        const breadcrumbs = path.map((p,i)=>(
            <Link 
                key={i}
                href={`/${path.slice(0, i+1).join("/")}`}
            >
                <Typography variant='caption' sx={{textTransform: 'capitalize'}} color={i===path.length-1 ? 'primary': 'inherit'}>{p}</Typography>
            </Link>
        ))
        console.log(breadcrumbs)
        return <Breadcrumbs aria-label="breadcrumb" separator="›" >
            {breadcrumbs}
        </Breadcrumbs>
    }
}