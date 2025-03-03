'use client'
/**
 * Email links that hopefully bots won't be able to find.
 *  Trick 1: build emails incrementally (so the full email string doesn't show up in the source)
 *  Trick 2: show email in HTML, split up and interlaced with hidden random elements
 */

import React from 'react'
import { Link } from '@mui/material';

export function MailTo({ email, children }: React.PropsWithChildren<{ email: string }>) {
  const id = React.useId()
  const email_split = email.split('@')
  return <a
    id={id}
    href="#"
    onClick={evt => {
      const el = document.getElementById(id) as HTMLAnchorElement | null
      if (!el) return
      el.href = 'mailto:'
      el.href += email_split[0]
      el.href += '@'
      el.href += email_split[1]
    }}
  >{children}</a>
}

export function MailToLink({ email, color }: { email: string, color: string }) {
  const id = React.useId()
  const email_split = email.split('@')
  return <Link
    id={id}
    href="#"
    color={color}
    onClick={evt => {
      const el = document.getElementById(id) as HTMLAnchorElement | null
      if (!el) return
      el.href = 'mailto:'
      el.href += email_split[0]
      el.href += '@'
      el.href += email_split[1]
    }}
  >
    <span>{email_split[0]}</span>
    <span>&#x40;</span>
    <span>{email_split[1].slice(0, email_split[1].length/2)}</span>
    <span className="hidden">{id.slice(1,id.length/2)}</span>
    <span>{email_split[1].slice(email_split[1].length/2)}</span>
    <span className="hidden">{id.slice(id.length/2,-1)}</span>
  </Link>
}
