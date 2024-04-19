'use client'

import React from 'react'
import Link from "next/link"

export function AccountLink({ children }: React.PropsWithChildren<{}>) {
    return <Link href="/data/submit/account">{children}</Link>
}

