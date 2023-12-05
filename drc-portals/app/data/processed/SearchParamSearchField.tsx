'use client'
import { usePathname, useSearchParams } from 'next/navigation'
import SearchField from './SearchField'

export default function SearchParamSearchField(props: Omit<React.ComponentProps<typeof SearchField>, 'q'>) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const q = (pathname === '/data/processed/search' ? searchParams.get('q') : undefined) ?? ''
  if (pathname === '/data') return null
  return (
    <form className="self-end" action="/data/processed/search" method="GET"><SearchField q={q} {...props} /></form>
  )
}
