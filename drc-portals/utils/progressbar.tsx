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
      disableSameURL
      targetPreprocessor={url => {
        if (url.hostname === 'data.cfde.cloud' || url.hostname === 'info.cfde.cloud') {
          const m = /^\/(info|data)(\/.+)?$/.exec(url.pathname)
          if (m !== null) {
            url.hostname = `${m[1]}.cfde.cloud`
            url.pathname = m[2] || '/'
          }
        }
        return url
      }}
    >{props.children}</ProgressProvider>
  )
}
