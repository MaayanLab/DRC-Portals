'use client'
import React from 'react'
import { usePathname } from 'next/navigation'
import { SearchForm, SearchField } from '@/app/data/processed/SearchField'
import { parse_url } from './utils'

export default function SearchParamSearchField(props: Omit<React.ComponentProps<typeof SearchField>, 'defaultValue' | 'action'>) {
  const id = React.useId()
  const pathname = usePathname()
  const params = React.useMemo(() => parse_url({ pathname }), [pathname])
  if (
    pathname === '/'
    || pathname === '/data'
    || /(\/data)?(\/graph|\/enrichment|\/cross|\/processed\/search\/[^\/]+\/[^\/]+)$/.exec(pathname) !== null
  ) return null
  return (
    <SearchForm name={id} param={props.name}>
      <SearchField
        {...props}
        name={id}
        defaultValue={params.search ?? ''}
        autocomplete={{}}
        InputProps={{
          sx: {width:{xs: '200px', sm: '200px', md: '270px', lg: '270px', xl: '270px'} }
        }}
      />
    </SearchForm>
  )
}
