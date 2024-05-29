'use client'

import React from 'react'
import Link from "next/link"
import { signIn, signOut } from 'next-auth/react'

export function SignInLink({ children }: React.PropsWithChildren<{}>) {
  if (process.env.NODE_ENV === 'development') {
    return <Link
      href="/auth/signin"
      onClick={evt => {
        evt.preventDefault()
        signIn()
      }}>{children}</Link>
  } else {
    return <Link
      href="/auth/signin/keycloak"
      onClick={evt => {
        evt.preventDefault()
        signIn('keycloak')
      }}>{children}</Link>
  }
}

export function SignOutLink({ children }: React.PropsWithChildren<{}>) {
  return <Link
    href="/auth/signout"
    onClick={evt => {
      evt.preventDefault()
      signOut()
    }}>{children}</Link>
}
