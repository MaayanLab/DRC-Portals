'use client'
import React from 'react'
import Link from 'next/link'
import Typography from '@mui/material/Typography'
import Breadcrumbs from '@mui/material/Breadcrumbs'

import { usePathname } from 'next/navigation'
import { type_to_string } from '@/app/data/processed/utils'

export default function NavBreadcrumbs() {
    const path = usePathname()
    const { path_split, format_path_split } = React.useMemo(() => {
        const path_split = path.replace("/", "").split("/")
        const format_path_split = path_split.map(p => decodeURIComponent(p).replace('_', ' '))
        if (path_split[0] === 'data' && path_split[1] === 'processed') {
            if (path_split[2] === 'entity' && path_split[3]) format_path_split[3] = type_to_string('entity', decodeURIComponent(path_split[3]))
            if (path_split[2]) format_path_split[2] = type_to_string(decodeURIComponent(path_split[2]), null)
        }
        return { path_split, format_path_split }
    }, [path])
    if (path_split.length < 2) return null
    return (
        <Breadcrumbs aria-label="breadcrumb" separator="›">
            {format_path_split.map((p, i) => (
                i === path_split.length - 1 ? (
                    <Typography key={i} variant='caption' sx={{ textTransform: 'uppercase', cursor: 'pointer' }} color='secondary'>{p}</Typography> // leaf node breadcrumb not clickable
                ) : (
                    <Link
                        key={i}
                        href={`/${path_split.slice(0, i + 1).join("/")}`}
                    >
                        <Typography variant='caption' sx={{ textTransform: 'uppercase' }} color='inherit'>{p}</Typography>
                    </Link>
                )
            ))}
        </Breadcrumbs>
    )
}