'use client'
import { usePathname, useSearchParams } from 'next/navigation'
import SearchField from '@/app/data/processed/SearchField'

export default function SearchParamSearchField(props: Omit<React.ComponentProps<typeof SearchField>, 'q' | 'action'>) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const q = (pathname === '/data/processed/search' ? searchParams.get('q') : undefined) ?? ''
  if (pathname === '/data' || pathname === '/') return null
  return (
    <SearchField action="/data/processed/search" q={q} {...props} />
  )
}
