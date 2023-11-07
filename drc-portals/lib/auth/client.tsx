'use client'

import React from 'react'
import { SessionProvider } from 'next-auth/react'

export default function NextAuthProvider({ children }: React.PropsWithChildren<{}>) {
  return <SessionProvider basePath="/auth">{children}</SessionProvider>
}
