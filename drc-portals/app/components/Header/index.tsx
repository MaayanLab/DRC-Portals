import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic';
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

const AppBar = dynamic(()=>import('@mui/material/AppBar'))
const Toolbar = dynamic(()=>import('@mui/material/Toolbar'))
const Grid = dynamic(()=>import('@mui/material/Grid'))
const Typography = dynamic(()=>import('@mui/material/Typography'))
const IconButton = dynamic(()=>import('@mui/material/IconButton'))
const Stack = dynamic(()=>import('@mui/material/Stack'))
const Button = dynamic(()=>import('@mui/material/Button'))


export default async function InfoNavBar({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  return (
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
                <Typography variant='h3'>CFDE Workbench</Typography>
              </Link>
            </Grid>
            <Grid item>
              <Stack direction={"row"} alignItems={"center"} spacing={2}>
                <Link href="/info">
                  <Typography variant="nav">PARTNERSHIPS</Typography>
                </Link>
                <Link href="/info">
                  <Typography variant="nav">NETWORKING</Typography>
                </Link>
                <Link href="/info">
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
                <Link href="/info/about">
                  <Typography variant="nav">ABOUT</Typography>
                </Link>
                <Link href="/info/about">
                  <Typography variant="nav">PROGRAMS</Typography>
                </Link>
                <Link href="/info/about">
                  <Typography variant="nav">DRC & KC</Typography>
                </Link>
                <Link href="/info/about">
                  <Typography variant="nav">STANDARDS & PROTOCOLS</Typography>
                </Link>
                <Link href="/info/about">
                  <Typography variant="nav">TRAINING & OUTREACH</Typography>
                </Link>
              </Stack>
            </Grid>
          </Grid>
      </Toolbar>
    </AppBar>
  )
}
