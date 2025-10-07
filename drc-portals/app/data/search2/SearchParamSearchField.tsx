'use client'
import React from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { SearchForm, SearchField } from '@/app/data/search2/SearchField'

export default function SearchParamSearchField(props: Omit<React.ComponentProps<typeof SearchField>, 'q' | 'action'>) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  if (pathname === '/data' || pathname === '/' || pathname === "/data/enrichment" || pathname === "/data/cross") return null
  const q = React.useMemo(() => searchParams.get('q') ?? '', [searchParams])
  return (
    <SearchForm action={`/data/search2`}>
      <SearchField q={q} {...props} />
    </SearchForm>
  )
}
