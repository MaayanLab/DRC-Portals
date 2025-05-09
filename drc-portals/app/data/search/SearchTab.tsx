'use client'

import React from 'react'
import { useSearchParams } from "next/navigation"
import { NodeType } from '@prisma/client'
import { pluralize, type_to_string } from '@/app/data/processed/utils'
import { useRouter } from '@/utils/navigation'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'

export default function SearchTabs(props: React.PropsWithChildren<{
  type_counts: {
    type: NodeType | 'processed' | 'c2m2';
    entity_type: string;
    count: number;
  }[],
  defaultSType: string,
  defaultSEntityType: string | null,
}>) {
  const router = useRouter()
  const rawSearchParams = useSearchParams()
  const value = React.useMemo(() =>
    (new URLSearchParams(rawSearchParams).get('s')) ??
      (props.defaultSEntityType ?
        `${props.defaultSType}:${props.defaultSEntityType}`
        : props.defaultSType),
  [rawSearchParams, props.defaultSType, props.defaultSEntityType])
  return (
    <Tabs
      variant='fullWidth'
      textColor='secondary'
      value={value}
      onChange={(evt, value) => {
        console.log(evt, value)
        const searchParams = new URLSearchParams(rawSearchParams)
        searchParams.delete('et')
        searchParams.set('p', '1')
        searchParams.set('s', value)
        router.push(`?${searchParams.toString()}`, { scroll: false })
      }}
    >
      {props.type_counts.map(({ type, entity_type, count }) =>
        <Tab
          key={`${type}-${entity_type || ''}`}
          sx={{ fontSize: '14pt' }}
          label={`${pluralize(type_to_string(type, entity_type))}${count ? ` (${BigInt(count).toLocaleString()})` : ''}`}
          value={entity_type ? `${type}:${entity_type}` : type}
        />
      )}
    </Tabs>
  )
}
