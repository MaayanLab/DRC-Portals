'use client'

import React from 'react'
import { Button } from "@mui/material";
import { Checkbox, Typography } from '@mui/material'
import { useRouter, useSearchParams } from '@/utils/navigation'
import { Box } from '@mui/system';

export function CollapseFilter(props: React.PropsWithChildren<{}>) {
  const [collapsed, setCollapsed] = React.useState(true)
  const children = React.useMemo(() => (Array.isArray(props.children) ? props.children : [props.children]).filter(child => !!child), [props.children])
  if (children.length <= 5) return children
  return <>
    {collapsed ? children.slice(0, 5) : children}
    <button
      onClick={evt => {setCollapsed(collapsed => !collapsed)}}
    >{collapsed ? <>+ {children.length-5} More</> : <>- Less</>}</button>
  </>
}

export function CollapseFilters(props: React.PropsWithChildren<{}>) {
  const [collapsed, setCollapsed] = React.useState(true)
  const children = React.useMemo(() => (Array.isArray(props.children) ? props.children : [props.children]).filter(child => !!child), [props.children])
  if (!collapsed) return children
  if (children.length <= 3) return children
  return <>
    {children.slice(0, 3)}
    <Button
      size='large'
      sx={{textTransform: "uppercase"}}
      color="primary"
      variant="contained"
      onClick={evt => {setCollapsed(false)}}
    >+ {children.length-3} More filters</Button>
  </>
}

export default function SearchFilter(props: React.PropsWithChildren<{ id: string, label: string, color?: string, filter_count?: number, count?: number }>) {
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
    <Box
      sx={{ display: props.filter_count === 0 ? 'none' : 'flex', alignItems: 'center', marginLeft: '-11px', cursor: 'pointer' }}
      onClick={evt => {router.push(`?${searchParams.toString()}`, { scroll: false })}}
    >
      <Checkbox checked={currentFilterSet} />
      <Typography
        title={props.label}
        sx={{
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          display: 'block',
          flexGrow: '1',
        }}
        variant='body2'
        color={props.color ?? 'secondary'}
      >{props.label}</Typography>
      <Typography
        title={props.label}
        variant='body2'
        color={props.color ?? 'secondary'}
      >&nbsp;({[props.filter_count, props.count].filter((c): c is number => !!c).map(c => c.toLocaleString()).join(' / ')})</Typography>
    </Box>
  )
}
