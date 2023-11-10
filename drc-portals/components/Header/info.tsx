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


export default async function InfoHeader() {
  const session = await getServerSession(authOptions)
  return (
    <Container maxWidth="lg">
      <AppBar position="static" sx={{color: "#000"}}>
        <Toolbar>
            <Grid container justifyContent={"space-between"} alignItems={"center"}>
              <Grid item>
                <Link href={``} className='flex items-center'>
                  <IconButton
                    aria-label="menu"
                  >
                    <Image src={'/img/favicon.png'} alt="cfde-logo" height={37} width={50}/>
                  </IconButton>
                  <Typography variant='h3'>CFDE Workbench</Typography>
                </Link>
              </Grid>
              <Grid item>
                <Stack direction={"row"} alignItems={"center"} spacing={2}>
                  <Link href="">
                    <Typography variant="nav">PARTNERSHIPS</Typography>
                  </Link>
                  <Link href="/about">
                    <Typography variant="nav">TRAINING & OUTREACH</Typography>
                  </Link>
                  <Link href="">
                    <Typography variant="nav">PUBLICATIONS</Typography>
                  </Link>
                    {session === null ? 
                    <>
                      <Link href="/auth/signin">
                        <Button color="secondary">
                          SIGN UP
                        </Button>
                      </Link>
                      <Link href="/auth/signin">
                        <Button color="secondary" variant="outlined">
                          LOGIN
                        </Button>
                      </Link>
                    </>
                    : <>
                      Welcome {session.user?.name ?? 'user'}.
                      <Link href="/auth/signout"><Button variant='outlined' color="secondary">Logout</Button></Link>
                    </>}
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack direction={"row"} alignItems={"center"} spacing={2}>
                  <Link href="/about">
                    <Typography variant="nav">DATA & METADATA</Typography>
                  </Link>
                  <Link href="/about">
                    <Typography variant="nav">TOOLS</Typography>
                  </Link>
                  <Link href="/about">
                    <Typography variant="nav">CHATBOT</Typography>
                  </Link>
                  <Link href="/about">
                    <Typography variant="nav">DRC & KC</Typography>
                  </Link>
                  <Link href="/about">
                    <Typography variant="nav">STANDARDS & PROTOCOLS</Typography>
                  </Link>
                </Stack>
              </Grid>
            </Grid>
        </Toolbar>
      </AppBar>
    </Container>
  )
}
