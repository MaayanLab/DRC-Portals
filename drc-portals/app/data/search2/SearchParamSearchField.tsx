'use client'
import React from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { SearchForm, SearchField } from '@/app/data/search2/SearchField'

export default function SearchParamSearchField(props: Omit<React.ComponentProps<typeof SearchField>, 'defaultValue' | 'action'>) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const q = React.useMemo(() => searchParams.get('q') ?? '', [searchParams])
  if (pathname === '/data' || pathname === '/' || pathname === "/data/enrichment" || pathname === "/data/cross") return null
  return (
    <SearchForm action={`/data/search2`}>
      <SearchField {...props} defaultValue={q} />
    </SearchForm>
  )
}
