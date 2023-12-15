'use client'

import React from 'react'
import { useSearchParams } from "next/navigation"
import Link from 'next/link'
import { Checkbox, FormControlLabel, Typography } from '@mui/material'
import { pluralize, type_to_string } from '@/app/data/processed/utils'
import { NodeType } from '@prisma/client'

export default function SearchFilter({ type, entity_type, count }: { type: NodeType, entity_type: string | null, count: number }) {
  const jointType = React.useMemo(() => `${type}${entity_type ? `:${entity_type}` : ''}`, [type, entity_type])
  const rawSearchParams = useSearchParams()
  const { searchParams, currentTypeSet } = React.useMemo(() => {
    const searchParams = new URLSearchParams(rawSearchParams)
    const currentRawTypes = searchParams.get('t')
    const currentTypes = currentRawTypes ? currentRawTypes.split(',') : []
    const currentTypeSet = currentTypes.includes(jointType)
    const newTypes = currentTypeSet ? currentTypes.filter(t => t !== jointType) : [...currentTypes, jointType]
    searchParams.set('t', newTypes.join(','))
    searchParams.set('p', '1')
    return { searchParams, currentTypeSet }
  }, [jointType, rawSearchParams])
  return (
    <Link key={type} href={`?${searchParams.toString()}`}>
      <FormControlLabel control={<Checkbox />} label={<Typography sx={{ fontSize: '60%' }}>{pluralize(type_to_string(type, entity_type))} ({count.toLocaleString()})</Typography>} checked={currentTypeSet} />
    </Link>
  )
}
