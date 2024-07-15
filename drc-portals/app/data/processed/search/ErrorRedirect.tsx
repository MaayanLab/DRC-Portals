'use client'
import React from 'react'

export default function ErrorRedirect(props: { error?: string }) {
  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set('error', `${props.error}`)
    if (props.error) window.location.assign(`/data?${searchParams.toString()}`)
  }, [props.error])
  return null
}
