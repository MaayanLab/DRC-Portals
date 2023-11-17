'use client'

import { Pagination } from '@mui/material'
import React from 'react'

export default function FormPagination({ p, ps }: { p: number, ps: number }) {
  const ref = React.useRef<HTMLInputElement>(null)
  return (
    <>
      <Pagination
        defaultPage={p}
        count={ps}
        onChange={(evt, value) => {
          if (!ref.current) return
          ref.current.value = `${value}`
          ref.current.click()
        }}
      />
      <input ref={ref} className="hidden" type="submit" name="p" defaultValue={p} />
    </>
  )
}
