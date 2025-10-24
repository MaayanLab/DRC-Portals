'use client'
import Grid  from '@mui/material/Grid'
import Link from '@/utils/link'
import { Badge, Fab } from '@mui/material'
import Icon from "@mdi/react"
import { mdiCart } from '@mdi/js'
import React from 'react'
import { useLocalStorage } from '@/utils/localstorage'

export default function CartFab() {
  const [rawCart, setRawCart] = useLocalStorage('drs-cart')
  const cart = React.useMemo(() => (rawCart||'').split('\n').filter(item => !!item), [rawCart])
  return (
    cart.length > 0 && <Grid item sx={{
      zIndex: 1050,
      position: 'fixed',
      bottom: 50,
      right: 50,
    }}>
      <Link href="/data/processed2/cart">
        <Badge badgeContent={cart.length} color="error" overlap='circular'>
          <Fab sx={{ zIndex: 0 }} aria-label={'cart'} color={'primary'}>
            <Icon style={{ color: "#336699" }} path={mdiCart} size={1} />
          </Fab>
        </Badge>
      </Link>
    </Grid>
  )
}
