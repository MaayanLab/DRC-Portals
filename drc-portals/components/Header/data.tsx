import Image from 'next/image'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import { Logo } from '../styled/Logo'
import UserComponent from '../misc/LoginComponents/UserComponent'
import NavBreadcrumbs from './breadcrumbs'
import SearchParamSearchField from '@/app/data/processed/SearchParamSearchField'

export default async function InfoHeader() {
  const session = await getServerSession(authOptions) 
  return (
    <Container maxWidth="lg">
      <AppBar position="static" sx={{color: "#000"}}>
        <Toolbar>
            <Grid container justifyContent={"space-between"} alignItems={"center"} spacing={2}>
              <Grid item>
                <Logo href={`/data`} title="CFDE Workbench"  color="secondary"/>
              </Grid>
              <Grid item>
                <Stack direction={"row"} alignItems={"center"} spacing={2}>
                  <Link href="/data/coming_soon" target="_blank" rel="noopener noreferrer">
                    <Typography variant="nav">KNOWLEDGE PORTAL</Typography>
                  </Link>
                  <Link href="/data/coming_soon">
                    <Typography variant="nav">PARTNERSHIPS</Typography>
                  </Link>
                  <Link href="/data/contribute/form">
                    <Typography variant="nav">CONTRIBUTE</Typography>
                  </Link>
                    <UserComponent session={session}/>
                </Stack>
              </Grid>
              <Grid item xs={12}></Grid>
              <Grid item>
                <Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"} spacing={2}>
                  <Stack direction={"row"} alignItems={"center"} spacing={2}>
                    <Link href="/info">
                      <Typography variant="nav">INFORMATION PORTAL</Typography>
                    </Link>
                    <Link href="/data/matrix">
                      <Typography variant="nav">DATA MATRIX</Typography>
                    </Link>
                    <Link href="/data/coming_soon">
                      <Typography variant="nav">TOOLS AND WORKFLOWS</Typography>
                    </Link>
                    <Link href="/data/coming_soon">
                      <Typography variant="nav">CROSSCUT DCC USE CASES</Typography>
                    </Link>
                  </Stack>
                  <SearchParamSearchField />
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <NavBreadcrumbs/>
              </Grid>
            </Grid>
        </Toolbar>
      </AppBar>
    </Container>
  )
}
