'use client'
import React from 'react'
import { usePathname } from 'next/navigation'
import { SearchForm, SearchField } from '@/app/data/processed/SearchField'

export default function SearchParamSearchField(props: Omit<React.ComponentProps<typeof SearchField>, 'q' | 'action'>) {
  const pathname = usePathname()
  if (pathname === '/data' || pathname === '/' || pathname === "/data/enrichment") return null
  const q = React.useMemo(() => {
    const m = /^(\/data)?\/search\/(.+?)\//.exec(pathname)
    if (m) return decodeURIComponent(m[2])
    return ''
  }, [pathname])
  return (
    <SearchForm action="/data/search">
      <SearchField q={q} {...props} />
    </SearchForm>
  )
}
