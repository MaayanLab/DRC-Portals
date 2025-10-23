'use client'
import React from 'react'
import { usePathname } from 'next/navigation'
import { SearchForm, SearchField } from '@/app/data/processed2/SearchField'
import { parse_url } from './utils'

export default function SearchParamSearchField(props: Omit<React.ComponentProps<typeof SearchField>, 'defaultValue' | 'action'>) {
  const pathname = usePathname()
  const params = React.useMemo(() => parse_url({ pathname }), [pathname])
  if (pathname === '/data' || pathname === '/' || pathname === "/data/enrichment" || pathname === "/data/cross") return null
  return (
    <SearchForm>
      <SearchField {...props} defaultValue={params.search ?? ''} />
    </SearchForm>
  )
}
