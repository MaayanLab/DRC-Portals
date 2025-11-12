'use client'
import React from 'react'
import { useLocalStorage } from '@/utils/localstorage'
import { Button, IconButton } from '@mui/material'
import DRSBundleButton from '@/app/data/processed/cart/DRSBundleButton'
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ClearIcon from '@mui/icons-material/Clear';
import Link from '@/utils/link'
import Icon from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import SearchablePagedTable, { SearchablePagedTableCell, SearchablePagedTableCellIcon } from "@/app/data/processed/SearchablePagedTable";
import { Grid, Box, MenuItem, Pagination, PaginationItem, Select, Stack, Typography } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { InputAdornment, TextField } from '@mui/material';
import { mdiMagnify } from "@mdi/js";
import FileIcon from '@/public/img/icons/fileIcon.png'

const rowsPerPageOptions = [10, 20, 50]

export default function DRSCart() {
  const [rawCart, setRawCart] = useLocalStorage('drs-cart')
  const [search, setSearch] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [displayPerPage, setDisplayPerPage] = React.useState(10)
  const cart = React.useMemo(() => (rawCart||'').split('\n').filter(item => !!item), [rawCart])
  const filteredCart = React.useMemo(() => cart.filter(item => item.toLowerCase().includes(search.toLowerCase())), [cart, search])
  const pageCount = React.useMemo(() => ((filteredCart.length/displayPerPage)|0)+(((filteredCart.length%displayPerPage)===0)?0:1), [filteredCart, displayPerPage])
  return (
    <>
      <SearchablePagedTable
        tableHeader={
          <Grid item xs={12} sx={{marginBottom: 5}}>
            <Stack direction={"row"} alignItems={"center"} justifyContent={'space-between'}>
              <Typography variant="h1" color="secondary" className="whitespace-nowrap">Data Resource Cart</Typography>
              <TextField
                value={search}
                onChange={evt => {setSearch(evt.currentTarget.value)}}
                placeholder={"Search Data Resource Cart"}
                color="secondary"
                InputProps={{
                  sx: {borderRadius: 1, height: 50, fieldset: { borderColor: "#2D5986" }},
                  endAdornment: <InputAdornment position="end"><Icon path={mdiMagnify} size={1} /></InputAdornment>,
                }}
              />
            </Stack>
          </Grid>
        }
        columns={[
          <>&nbsp;</>,
          <>Access URL</>,
          <>&nbsp;</>,
        ]}
        rows={filteredCart.slice((page-1)*displayPerPage, page*displayPerPage).map(item => [
          <SearchablePagedTableCellIcon src={FileIcon} alt="" />,
          <SearchablePagedTableCell sx={{maxWidth: 'unset'}}>{item}</SearchablePagedTableCell>,
          <SearchablePagedTableCell>
            <IconButton onClick={evt => {setRawCart(cart => (cart || '').split('\n').filter(cartItem => cartItem !== item).join('\n'))}}>
              <ClearIcon />
            </IconButton>
          </SearchablePagedTableCell>,
        ])}
        tableFooter={
          <div className="flex flex-row gap-4">
            <DRSBundleButton data={cart} />
            <Button
              variant="contained"
              color="primary"
              startIcon={<CloudUploadIcon />}
              disabled
            >
              Export to Cloud Workspace
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<ClearIcon />}
              onClick={evt => {setRawCart(() => null)}}
              disabled={!cart?.length}
            >
              Empty Cart
            </Button>
          </div>
        }
        tablePagination={
          <Stack direction={"row"} justifyContent={"space-between"} justifyItems={"center"} alignContent={"center"} alignItems="center" flexWrap={"wrap"} gap={2}>
            <Box justifySelf={"center"}>
              <Pagination
                siblingCount={1}
                boundaryCount={1}
                page={page}
                count={pageCount}
                onChange={(evt, value) => {setPage(value)}}
                variant="text"
                shape="rounded"
                color="primary"
                renderItem={(item) =>
                  <PaginationItem
                    slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
                    {...item}
                  />
                }
              />
            </Box>
            <Stack direction={"row"} alignItems={"center"} gap={2}>
              <Typography variant="nav" noWrap>DISPLAY PER PAGE</Typography>
              <Select
                value={displayPerPage}
                onChange={evt => {
                  setDisplayPerPage(Number(evt.target.value))
                  setPage(1)
                }}
              >
                {rowsPerPageOptions.map(rowsPerPage =>
                  <MenuItem key={rowsPerPage} value={rowsPerPage}>{rowsPerPage}</MenuItem>
                )}
              </Select>
            </Stack>
          </Stack>
        }
      />
      <Link href="/data">
        <Button
          sx={{textTransform: "uppercase"}}
          color="primary"
          variant="contained"
          startIcon={<Icon path={mdiArrowLeft} size={1} />}>
            BACK TO SEARCH
        </Button>
      </Link>
    </>
  )
}
