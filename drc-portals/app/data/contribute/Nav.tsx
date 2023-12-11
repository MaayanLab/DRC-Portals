import Image from 'next/image'
import Link from 'next/link'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import Box from '@mui/system/Box'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

export default async function Nav() {
  const session = await getServerSession(authOptions)
  if (!session) return redirect("/auth/signin?callbackUrl=/data/contribute/form")
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id
    }
  })

  let userAdmin = false
  if (user?.role === 'ADMIN')
  {
    userAdmin = true;
  }

  return (
    <Box>
    <Container maxWidth="lg">
      <AppBar position="static">
        <Toolbar>
            <Grid container justifyContent={"space-between"} alignItems={"center"}>
              <Grid item>
                <Stack direction={"row"} alignItems={"center"} spacing={2}>
                  <Link href="/data/contribute/form">
                    <Typography variant="nav">UPLOAD FORM</Typography>
                  </Link>
                  <Link href="/data/contribute/uploaded">
                    <Typography variant="nav">UPLOADED FILES</Typography>
                  </Link>
                  <Link href="/data/contribute/documentation">
                    <Typography variant="nav">DOCUMENTATION</Typography>
                  </Link>
                  <Link href="/data/contribute/account">
                    <Typography variant="nav">MY ACCOUNT</Typography>
                  </Link>
                  { userAdmin && <Link href="/data/contribute/admin">
                    <Typography variant="nav">ADMIN</Typography>
                  </Link>}
                </Stack>
              </Grid>
            </Grid>
        </Toolbar>
      </AppBar>
    </Container>
    </Box>
  )
}
