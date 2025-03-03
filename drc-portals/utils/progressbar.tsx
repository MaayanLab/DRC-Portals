'use client'

import { AppProgressProvider as ProgressProvider } from '@bprogress/next'
import React from 'react'

export default function AppProgressProvider(props: React.PropsWithChildren<{}>) {
  return (
    <ProgressProvider
      height="2px"
      color="#2D5986"
      options={{ showSpinner: false }}
      shallowRouting
    >{props.children}</ProgressProvider>
  )
}
