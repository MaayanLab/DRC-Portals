'use client'

import React from 'react'
import { Pagination } from '@mui/material'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export default function FormPagination({ p, ps }: { p: number, ps: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  return (
    <>
      <Pagination
        defaultPage={p}
        count={ps}
        onChange={(evt, value) => {
          const newSearchParams = new URLSearchParams(searchParams)
          newSearchParams.set('p', value.toString())
          router.push(pathname + '?' + newSearchParams.toString())
        }}
      />
    </>
  )
}
