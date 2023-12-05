'use client'
import React from 'react'
import { Grid, MenuItem, Pagination, PaginationItem, Select, Stack, TableCell, TableRow, Typography } from '@mui/material'
import { usePathname, useRouter } from 'next/navigation'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const rowsPerPageOptions = [10, 20, 50]

export default function FormPagination({ p, r, count }: { p: number, r: number, count?: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const pageCount = (((count??0)/r)|0)+((((count??0)%r)===0)?0:1)
  return (
    <TableRow>
      <TableCell colSpan={100}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
          <Pagination
            page={p}
            count={pageCount}
            onChange={(evt, value) => {
              const newSearchParams = new URLSearchParams(window.location.search)
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
          </Grid>
          <Grid item>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography>DISPLAY PER PAGE</Typography>
              <Select
                value={r}
                onChange={evt => {
                  const newSearchParams = new URLSearchParams(window.location.search)
                  newSearchParams.set('p', '1')
                  newSearchParams.set('r', evt.target.value.toString())
                  router.push(pathname + '?' + newSearchParams.toString())
                }}
              >
                {rowsPerPageOptions.map(rowsPerPage =>
                  <MenuItem key={rowsPerPage} value={rowsPerPage}>{rowsPerPage}</MenuItem>
                )}
              </Select>
            </Stack>
          </Grid>
        </Grid>
      </TableCell>
    </TableRow>
  )
}
