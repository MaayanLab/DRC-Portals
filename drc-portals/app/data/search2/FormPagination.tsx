'use client'
import React from 'react'
import { Box, MenuItem, Pagination, PaginationItem, Select, Stack, Typography } from '@mui/material'
import { usePathname, useRouter } from '@/utils/navigation'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const rowsPerPageOptions = [10, 20, 50]

export default function FormPagination(props: { cursor?: string, reverse: boolean, display_per_page: number, page: number, total: number, cursors: [string | undefined, string | undefined] }) {
  const router = useRouter()
  const pathname = usePathname()
  const pageCount = ((props.total/props.display_per_page)|0)+(((props.total%props.display_per_page)===0)?0:1)
  let currentPage = Number(props.page)
  return (
    <Stack direction={"row"} justifyContent={"space-between"} justifyItems={"center"} alignContent={"center"} alignItems="center" flexWrap={"wrap"} gap={2}>
      <Box justifySelf={"center"}>
        <Pagination
          siblingCount={1}
          boundaryCount={1}
          page={currentPage}
          count={pageCount}
          onChange={(evt, value) => {
            const newSearchParams = new URLSearchParams(window.location.search)
            if (value === 1) {
              newSearchParams.delete('cursor')
              newSearchParams.delete('reverse')
              newSearchParams.set('page', '1')
            } else if (value === currentPage - 1 && props.cursors[0]) {
              newSearchParams.set('cursor', props.cursors[0])
              newSearchParams.set('reverse', '')
              newSearchParams.set('page', (currentPage - 1).toString())
            } else if (value === currentPage + 1 && props.cursors[1]) {
              newSearchParams.set('cursor', props.cursors[1])
              newSearchParams.delete('reverse')
              newSearchParams.set('page', (currentPage + 1).toString())
            } else if (value === pageCount) {
              newSearchParams.delete('cursor')
              newSearchParams.set('reverse', '')
              newSearchParams.set('page', pageCount.toString())
            }
            router.push(pathname + '?' + newSearchParams.toString(), { scroll: false })
          }}
          variant="text"
          shape="rounded"
          color="primary"
          renderItem={(item) => (
            (item.page === currentPage
              || item.page === 1
              || item.page === currentPage - 1
              || item.page === currentPage + 1
              || item.page === pageCount
              || item.type === 'start-ellipsis'
              || item.type === 'end-ellipsis') ?
              <PaginationItem
                slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
                {...item}
              />
              : item.page === currentPage - 2 && currentPage < pageCount - 3 ? <PaginationItem type={"start-ellipsis"} />
              : item.page === currentPage + 2 && currentPage > 3 ? <PaginationItem type={"end-ellipsis"} />
              : null
          )}
        />
      </Box>
      <Stack direction={"row"} alignItems={"center"} gap={2}>
        <Typography variant="nav" noWrap>DISPLAY PER PAGE</Typography>
        <Select
          value={props.display_per_page}
          onChange={evt => {
            const newSearchParams = new URLSearchParams(window.location.search)
            newSearchParams.delete('cursor')
            newSearchParams.delete('reverse')
            newSearchParams.set('display_per_page', evt.target.value.toString())
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
