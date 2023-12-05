'use client'

import React from 'react'
import { Pagination, PaginationItem } from '@mui/material'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function FormPagination({ p, ps }: { p: number, ps: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  return (
    <>
      <Pagination
        page={p}
        count={ps}
        onChange={(evt, value) => {
          const newSearchParams = new URLSearchParams(searchParams)
          newSearchParams.set('p', value.toString())
          router.push(pathname + '?' + newSearchParams.toString())
        }}
        renderItem={(item) => (
          <PaginationItem
            slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
            {...item}
          />
        )}
      />
    </>
  )
}
