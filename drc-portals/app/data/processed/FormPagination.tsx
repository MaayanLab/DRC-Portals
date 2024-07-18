'use client'
import React from 'react'
import { Box, FormControl, Grid, InputLabel, MenuItem, Pagination, PaginationItem, Paper, Select, Stack, TableCell, TableRow, Typography } from '@mui/material'
import { usePathname, useRouter } from 'next/navigation'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const rowsPerPageOptions = [10, 20, 50]

export default function FormPagination({ p, r, count }: { p: number, r: number, count?: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const pageCount = (((count??0)/r)|0)+((((count??0)%r)===0)?0:1)
  return (
    <Stack direction={"row"} justifyContent={"space-between"} justifyItems={"center"} alignContent={"center"} alignItems="center" flexWrap={"wrap"} gap={2}>
      <Box justifySelf={"center"}>
        <Pagination
          siblingCount={0}
          boundaryCount={1}
          page={p}
          count={pageCount}
          onChange={(evt, value) => {
            const newSearchParams = new URLSearchParams(window.location.search)
            newSearchParams.set('p', value.toString())
            router.push(pathname + '?' + newSearchParams.toString(), { scroll: false })
          }}
          variant="text"
          shape="rounded"
          color="primary"
          renderItem={(item) => (
            <PaginationItem
              slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
              {...item}
            />
          )}
        />
      </Box>
      <Stack direction={"row"} alignItems={"center"} gap={2}>
        <Typography variant="nav" noWrap>DISPLAY PER PAGE</Typography>
        <Select
          value={r}
          onChange={evt => {
            const newSearchParams = new URLSearchParams(window.location.search)
            newSearchParams.set('p', '1')
            newSearchParams.set('r', evt.target.value.toString())
            router.push(pathname + '?' + newSearchParams.toString(), { scroll: false })
          }}
        >
          {rowsPerPageOptions.map(rowsPerPage =>
            <MenuItem key={rowsPerPage} value={rowsPerPage}>{rowsPerPage}</MenuItem>
          )}
        </Select>
      </Stack>
    </Stack>
  )
}
