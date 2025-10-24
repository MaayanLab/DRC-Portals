'use client'
import React from 'react'
import { useLocalStorage } from '@/utils/localstorage'
import { Button, Container, Grid, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material'
import DRSBundleButton from '@/app/data/processed2/cart/DRSBundleButton'
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ClearIcon from '@mui/icons-material/Clear';

export default function DRSCart() {
  const [rawCart, setRawCart] = useLocalStorage('drs-cart')
  const cart = React.useMemo(() => (rawCart||'').split('\n').filter(item => !!item), [rawCart])
  return (
    <Container maxWidth="xl">
      <Typography variant="h2" color="secondary.dark" sx={{mt:2}} gutterBottom>DATA RESOURCE CART</Typography>
      {cart.length > 0 ? <>
        <Grid item>
          <TableContainer component={Paper} elevation={0} variant="rounded-top" sx={{ maxHeight: 1100, width: '100%', overflowX: 'auto', maxWidth: '1100px' }}>
            <Table stickyHeader aria-label="simple table" sx={{ tableLayout: 'auto', minWidth: '100%' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: '#CAD2E9' }}>Access URL</TableCell>
                  <TableCell sx={{ backgroundColor: '#CAD2E9' }}>&nbsp;</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>{item}</TableCell>
                    <TableCell>
                      <IconButton onClick={evt => {setRawCart(cart => (cart || '').split('\n').filter(cartItem => cartItem !== item).join('\n'))}}>
                        <ClearIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item>
          <div className="flex flex-row gap-4">
            <DRSBundleButton data={cart.map(access_url => ({ access_url }))} />
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
        </Grid>
      </> : <>
        <Typography variant="body2" color="secondary.dark">Your cart is currently empty</Typography>
      </>}
    </Container>
  )
}
