'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'

export default function SearchFilter(props: React.PropsWithChildren<{ facet: string }>) {
  const searchParams = useSearchParams()
  const outSearchParams = React.useMemo(() => {
    const outSearchParams = new URLSearchParams(searchParams)
    outSearchParams.set('page', '1')
    outSearchParams.delete('cursor')
    outSearchParams.delete('reverse')
    outSearchParams.set('facet', `${outSearchParams.get('facet') || ''} ${props.facet}`)
    return outSearchParams.toString()
  }, [searchParams])
  return <a href={`?${outSearchParams}`}>{props.children}</a>
}
