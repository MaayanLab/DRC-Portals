import Image from 'next/image'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment'
import Icon from '@mdi/react';
import { mdiMagnify } from '@mdi/js';
import UserComponent from '../misc/LoginComponents/UserComponent'

export default async function InfoHeader() {
  const session = (await getServerSession(authOptions))
  return (
    <Container maxWidth="lg">
      <AppBar position="static" sx={{color: "#000"}}>
        <Toolbar>
            <Grid container justifyContent={"space-between"} alignItems={"center"}>
              <Grid item>
                <Link href={`/info`} className='flex items-center'>
                  <IconButton
                    aria-label="menu"
                  >
                    <Image src={'/img/favicon.png'} alt="cfde-logo" height={37} width={50}/>
                  </IconButton>
                  <Typography variant='h3' color="primary">CFDE Workbench</Typography>
                </Link>
              </Grid>
              <Grid item>
                <Stack direction={"row"} alignItems={"center"} spacing={2}>
                  <Link href="">
                    <Typography variant="nav">PARTNERSHIPS</Typography>
                  </Link>
                  <Link href="/info/outreach">
                    <Typography variant="nav">TRAINING & OUTREACH</Typography>
                  </Link>
                  <Link href="/info">
                    <Typography variant="nav">PRODUCTS</Typography>
                  </Link>
                  <Link href="/info/publications">
                    <Typography variant="nav">PUBLICATIONS</Typography>
                  </Link>
                    <UserComponent session={session}/>
                </Stack>
              </Grid>
              <Grid item xs={12}></Grid>
              <Grid item>
                <Stack direction={"row"} alignItems={"center"} spacing={2}>
                  <Link href="https://cfde.cloud" target="_blank" rel="noopener noreferrer">
                    <Typography variant="nav">DATA-RESOURCE-PORTAL</Typography>
                  </Link>
                  <Link href="/info/about">
                    <Typography variant="nav">KNOWLEDGE-PORTAL</Typography>
                  </Link>
                  <Link href="/info/about">
                    <Typography variant="nav">DCCs</Typography>
                  </Link>
                  <Link href="/info/about">
                    <Typography variant="nav">STANDARDS & PROTOCOLS</Typography>
                  </Link>
                </Stack>
              </Grid>
              <Grid item>
                <TextField sx={{width: 400}} placeholder='Search' InputProps={{
                    sx: {borderRadius: 1, height: 50},
                    endAdornment: <InputAdornment position="end"><Icon path={mdiMagnify} size={1} /></InputAdornment>
                  }}
                />
              </Grid>
            </Grid>
        </Toolbar>
      </AppBar>
    </Container>
  )
}
