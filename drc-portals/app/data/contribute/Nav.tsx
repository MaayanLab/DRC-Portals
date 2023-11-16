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

export default function Nav() {
  return (
    <Box>
    <Container maxWidth="lg">
      <AppBar position="static" sx={{color: "#000"}} >
        <Toolbar>
            <Grid container justifyContent={"space-between"} alignItems={"center"}>
              <Grid item>
                <Link href={``} className='flex items-center'>
                  <IconButton
                    aria-label="menu"
                  >
                    <Image src={'/img/favicon.png'} alt="cfde-logo" height={37} width={50}/>
                  </IconButton>
                  <Typography variant="h3">Data and Metadata Uploads</Typography>
                </Link>
              </Grid>
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
                </Stack>
              </Grid>
            </Grid>
        </Toolbar>
      </AppBar>
    </Container>
    </Box>
  )
}
