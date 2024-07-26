'use client'

import React from 'react'
import Button from '@mui/material/Button';
import { signIn, signOut } from 'next-auth/react'

export function SignInLink({ children }: React.PropsWithChildren<{}>) {
  return <Button
    sx={{padding: "5px 16px"}}
    size="small"
    color="secondary"
    variant="outlined"
    onClick={evt => {
        evt.preventDefault()
        if (process.env.NODE_ENV === 'development') signIn()
        else signIn('keycloak')
    }}>{children}</Button>
}

export function SignOutLink({ children }: React.PropsWithChildren<{}>) {
  return <button
    onClick={evt => {
      evt.preventDefault()
      signOut()
    }}>{children}</button>
}
