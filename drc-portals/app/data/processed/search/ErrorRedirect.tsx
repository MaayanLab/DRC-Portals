'use client'
import React from 'react'

export default function ErrorRedirect(props: { error?: string }) {
  React.useEffect(() => {
    if (props.error) window.location.assign(`/data?error=${encodeURIComponent(props.error)}`)
  }, [props.error])
  return null
}
