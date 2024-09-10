'use client'
import { usePathname, useSearchParams } from 'next/navigation'
import { SearchForm, SearchField } from '@/app/data/processed/SearchField'

export default function SearchParamSearchField(props: Omit<React.ComponentProps<typeof SearchField>, 'q' | 'action'>) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const q = (pathname === '/data/search' ? searchParams.get('q') : undefined) ?? ''
  if (pathname === '/data' || pathname === '/') return null
  return (
    <SearchForm action="/data/search">
      <SearchField q={q} {...props} />
    </SearchForm>
  )
}
