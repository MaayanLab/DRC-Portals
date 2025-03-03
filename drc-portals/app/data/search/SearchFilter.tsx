'use client'

import React from 'react'
import { Checkbox, FormControlLabel, Typography } from '@mui/material'
import { useSearchParams, useRouter } from '@/utils/navigation'

export default function SearchFilter({ id, label, color, count }: { id: string, label: string, color?: string, count: number }) {
  const router = useRouter()
  const rawSearchParams = useSearchParams()
  const { searchParams, currentFilterSet } = React.useMemo(() => {
    const searchParams = new URLSearchParams(rawSearchParams)
    const currentRawFilters = searchParams.get('et')
    const currentFilters = currentRawFilters ? currentRawFilters.split('|') : []
    const currentFilterSet = currentFilters.includes(id)
    const newFilters = currentFilterSet ? currentFilters.filter(t => t !== id) : [...currentFilters, id]
    searchParams.set('et', newFilters.join('|'))
    searchParams.set('p', '1')
    return { searchParams, currentFilterSet }
  }, [id, rawSearchParams])
  return (
    <FormControlLabel
      onClick={evt => {router.push(`?${searchParams.toString()}`, { scroll: false })}}
      control={<Checkbox/>}
      label={
        <Typography variant='body2'
          color={color ?? 'secondary'}
        >{label} ({count.toLocaleString()})</Typography>
      }
      checked={currentFilterSet}
    />
  )
}
