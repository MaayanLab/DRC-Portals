'use client'
import React, { useEffect, useState } from 'react'
import { Box, Stack, Typography, Select, MenuItem, Pagination, PaginationItem } from '@mui/material'
import { usePathname, useRouter, useSearchParams } from '@/utils/navigation'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const rowsPerPageOptions = [10, 20, 50, 100]

interface FormPaginationProps {
  p: number;
  r: number;
  count?: number;
  tablePrefix: string;
  onPageChange?: (page: number) => void; // Callback for page changes
}

export default function FormPagination({ p, r, count, tablePrefix, onPageChange }: FormPaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [currentPage, setCurrentPage] = useState(p)

  useEffect(() => {
    const pageParam = searchParams.get(`${tablePrefix}_p`)
    if (pageParam) {
      setCurrentPage(parseInt(pageParam))
    } else {
      setCurrentPage(p)
    }
  }, [searchParams, tablePrefix, p])

  const pageCount = Math.ceil((count ?? 0) / r)

  useEffect(() => {
    if (onPageChange) {
      onPageChange(currentPage)
    }
  }, [currentPage, onPageChange])

  const updatePageParam = (value: string) => {
    const newSearchParams = new URLSearchParams(window.location.search)
    newSearchParams.set(`${tablePrefix}_p`, value)
    router.push(pathname + '?' + newSearchParams.toString(), { scroll: false })
  }

  const updateRowsParam = (value: string) => {
    const newSearchParams = new URLSearchParams(window.location.search)
    newSearchParams.set('r', value)
    newSearchParams.set(`${tablePrefix}_p`, '1') // Reset to first page when rows per page change
    router.push(pathname + '?' + newSearchParams.toString(), { scroll: false })
  }

  return (
    <Stack direction={"row"} justifyContent={"space-between"} justifyItems={"center"} alignContent={"center"} alignItems="center" flexWrap={"wrap"} gap={2}>
      <Box justifySelf={"center"}>
        <Pagination
          siblingCount={1}
          boundaryCount={2}
          page={currentPage}
          count={pageCount}
          onChange={(evt, value) => updatePageParam(value.toString())}
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
          onChange={evt => updateRowsParam(evt.target.value.toString())}
        >
          {rowsPerPageOptions.map(rowsPerPage =>
            <MenuItem key={rowsPerPage} value={rowsPerPage}>{rowsPerPage}</MenuItem>
          )}
        </Select>
      </Stack>
    </Stack>
  )
}