'use client'

import React from 'react'
import { useSearchParams } from "next/navigation"
import Link from 'next/link'
import { Checkbox, FormControlLabel, Typography } from '@mui/material'

export default function SearchFilter({ id, label, count }: { id: string, label: string, count: number }) {
  const rawSearchParams = useSearchParams()
  const { searchParams, currentFilterSet } = React.useMemo(() => {
    const searchParams = new URLSearchParams(rawSearchParams)
    const currentRawFilters = searchParams.get('t')
    const currentFilters = currentRawFilters ? currentRawFilters.split(',') : []
    const currentFilterSet = currentFilters.includes(id)
    const newFilters = currentFilterSet ? currentFilters.filter(t => t !== id) : [...currentFilters, id]
    searchParams.set('t', newFilters.join(','))
    searchParams.set('p', '1')
    return { searchParams, currentFilterSet }
  }, [id, rawSearchParams])
  return (
    <Link href={`?${searchParams.toString()}`}>
      <FormControlLabel control={<Checkbox/>} label={<Typography variant='body2' color='secondary'>{label} ({count.toLocaleString()})</Typography>} checked={currentFilterSet} />
    </Link>
  )
}
