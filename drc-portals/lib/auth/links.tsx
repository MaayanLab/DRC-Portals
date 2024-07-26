'use client'

import React from 'react'
import Button from '@mui/material/Button';
import { signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation';

export function SignInLink({ children }: React.PropsWithChildren<{}>) {
  const router = useRouter()
  return <Button
    sx={{padding: "5px 16px"}}
    size="small"
    color="secondary"
    variant="outlined"
    onClick={evt => {
      evt.preventDefault()
      if (process.env.NODE_ENV === 'development') signIn()
      else router.push(`${process.env.NEXTAUTH_URL}/keycloak?callbackUrl=${encodeURIComponent(window.location.href)}`)
    }}>{children}</Button>
}

export function SignOutLink({ children }: React.PropsWithChildren<{}>) {
  return <button
    onClick={evt => {
      evt.preventDefault()
      signOut({ redirect: false })
    }}>{children}</button>
}
