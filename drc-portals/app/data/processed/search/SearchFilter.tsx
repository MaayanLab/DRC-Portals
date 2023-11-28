'use client'

import React from 'react'
import { useSearchParams } from "next/navigation"
import Link from 'next/link'
import { Checkbox, FormControlLabel, Typography } from '@mui/material'
import { pluralize, type_to_string } from '@/app/data/processed/utils'

export default function SearchFilter({ type, count }: { type: string, count: number }) {
  const rawSearchParams = useSearchParams()
  const { searchParams, currentTypeSet } = React.useMemo(() => {
    const searchParams = new URLSearchParams(rawSearchParams)
    const currentRawTypes = searchParams.get('t')
    const currentTypes = currentRawTypes ? currentRawTypes.split(',') : []
    const currentTypeSet = currentTypes.includes(type)
    const newTypes = currentTypeSet ? currentTypes.filter(t => t !== type) : [...currentTypes, type]
    searchParams.set('t', newTypes.join(','))
    return { searchParams, currentTypeSet }
  }, [type, rawSearchParams])
  return (
    <Link key={type} href={`?${searchParams.toString()}`}>
      <FormControlLabel control={<Checkbox />} label={<Typography sx={{ fontSize: '60%' }}>{pluralize(type_to_string(type))} ({count.toLocaleString()})</Typography>} checked={currentTypeSet} />
    </Link>
  )
}
