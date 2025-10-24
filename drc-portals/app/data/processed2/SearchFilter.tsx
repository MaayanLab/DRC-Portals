'use client'

import React from 'react'
import { Checkbox, FormControlLabel, Typography } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SearchFilter(props: React.PropsWithChildren<{ id: string, label: string, color?: string, count: number }>) {
  const router = useRouter()
  const rawSearchParams = useSearchParams()
  const { searchParams, currentFilterSet } = React.useMemo(() => {
    const currentFilters = rawSearchParams.getAll('facet')
    const currentFilterSet = currentFilters.includes(props.id)
    const searchParams = new URLSearchParams(rawSearchParams)
    searchParams.set('page', '1')
    searchParams.delete('cursor')
    searchParams.delete('reverse')
    if (currentFilterSet) {
      searchParams.delete('facet', props.id)
    } else {
      searchParams.append('facet', props.id)
    }
    return { searchParams, currentFilterSet }
  }, [props.id, rawSearchParams])
  return (
    <FormControlLabel
      onClick={evt => {router.push(`?${searchParams.toString()}`, { scroll: false })}}
      control={<Checkbox/>}
      label={
        <Typography variant='body2'
          color={props.color ?? 'secondary'}
        >{props.label} ({props.count.toLocaleString()})</Typography>
      }
      checked={currentFilterSet}
    />
  )
}
