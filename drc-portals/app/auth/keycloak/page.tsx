'use client'
import React from 'react'
import { signIn, useSession } from "next-auth/react";
import { useRouter } from '@/utils/navigation';

export default function SignInPage() {
  const router = useRouter()
  const session = useSession()
  React.useEffect(() => {
    if (session.status === 'loading') return
    else if (session.status === 'unauthenticated') {
      const searchParams = new URLSearchParams(window.location.search)
      signIn('keycloak', { callbackUrl: searchParams.get('callbackUrl') ?? process.env.PUBLIC_URL });
    }
    else if (session.status === 'authenticated') {
      const searchParams = new URLSearchParams(window.location.search)
      router.push(searchParams.get('callbackUrl') ?? '/')
    }
  }, [session, router])
  return null
}
