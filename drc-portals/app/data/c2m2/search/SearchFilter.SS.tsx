// 'use client'

// import React from 'react'
// import { useSearchParams } from "next/navigation"
// import Link from 'next/link'
// import { Checkbox, FormControlLabel, Typography } from '@mui/material'

// export default function SearchFilter({ id, label, count }: { id: string, label: string, count: number }) {
//   const rawSearchParams = useSearchParams()
//   const { searchParams, currentFilterSet } = React.useMemo(() => {
//     const searchParams = new URLSearchParams(rawSearchParams)
//     const currentRawFilters = searchParams.get('t')
//     const currentFilters = currentRawFilters ? currentRawFilters.split('|') : []
//     const currentFilterSet = currentFilters.includes(id)
//     const newFilters = currentFilterSet ? currentFilters.filter(t => t !== id) : [...currentFilters, id]
//     searchParams.set('t', newFilters.join('|'))
//     searchParams.set('p', '1')
//     return { searchParams, currentFilterSet }
//   }, [id, rawSearchParams])
//   return (
//     <Link href={`?${searchParams.toString()}`}>
//       <FormControlLabel control={<Checkbox />} label={<Typography variant='body2' color='secondary'>{label} ({count.toLocaleString()})</Typography>} checked={currentFilterSet} />
//     </Link>
//   )
// }

// commented out existing code


'use client'

import React from 'react'
import { useSearchParams } from "next/navigation"
import Link from 'next/link'
import { Checkbox, FormControlLabel, Typography, Accordion, AccordionSummary, AccordionDetails, TextField, Autocomplete } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function SearchFilter({ id, label, count }: { id: string, label: string, count: number }) {
  const rawSearchParams = useSearchParams()
  const { searchParams, currentFilters } = React.useMemo(() => {
    const searchParams = new URLSearchParams(rawSearchParams)
    const currentRawFilters = searchParams.get('t')
    const currentFilters: Record<string, string[]> = {}
    if (currentRawFilters) {
      currentRawFilters.split('|').forEach(filter => {
        const [type, value] = filter.split(':')
        if (!currentFilters[type]) {
          currentFilters[type] = []
        }
        currentFilters[type].push(decodeURIComponent(value))
      })
    }
    return { searchParams, currentFilters }
  }, [rawSearchParams])

  const toggleFilter = (type: string, value: string) => {
    const newFilters = { ...currentFilters }
    if (!newFilters[type]) {
      newFilters[type] = []
    }
    const index = newFilters[type].indexOf(value)
    if (index === -1) {
      newFilters[type].push(value)
    } else {
      newFilters[type].splice(index, 1)
    }
    const filtersArray = Object.entries(newFilters).map(([type, values]) => `${type}:${values.join('+')}`)
    searchParams.set('t', filtersArray.join('|'))
    searchParams.set('p', '1')
    return `?${searchParams.toString()}`
  }

  return (
    <Link href={toggleFilter(id, label)}>
      <FormControlLabel
        control={<Checkbox />}
        label={<Typography variant='body2' color='secondary'>{label} ({count.toLocaleString()})</Typography>}
        checked={currentFilters[id]?.includes(label)}
      />
    </Link>
  )
}

export function FilterAccordion({ id, label, count }: { id: string, label: string, count: number }) {
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography>Filters</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Autocomplete
          multiple
          id="checkbox-filters"
          options={filterOptions}
          getOptionLabel={(option) => option.label}
          renderInput={(params) => (
            <TextField {...params} label="Filter Options" />
          )}
          onChange={(event, newValue) => {
            console.log(newValue);
          }}
        />
      </AccordionDetails>
      <AccordionDetails>
        { }
        <SearchFilter id="filter1" label="Filter 1" count={10} />
        <SearchFilter id="filter2" label="Filter 2" count={20} />
        { }
      </AccordionDetails>
    </Accordion>
  );
}

