'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'

export default function SearchFilter(props: React.PropsWithChildren<{ f: string }>) {
  const searchParams = useSearchParams()
  const outSearchParams = React.useMemo(() => {
    const outSearchParams = new URLSearchParams(searchParams)
    outSearchParams.set('f', `${outSearchParams.get('f') || ''} ${props.f}`)
    return outSearchParams.toString()
  }, [searchParams])
  return <a href={`?${outSearchParams}`}>{props.children}</a>
}
