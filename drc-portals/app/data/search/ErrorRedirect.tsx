'use client'
import React from 'react'
import { useRouter } from '@/utils/navigation'

export default function ErrorRedirect(props: { error?: string }) {
  const router = useRouter()
  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set('error', `${props.error}`)
    if (props.error) router.push(`/data?${searchParams.toString()}`)
  }, [props.error])
  return null
}
