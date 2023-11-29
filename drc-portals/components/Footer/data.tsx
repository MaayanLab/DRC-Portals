import Link from 'next/link'

import { mdiGithub, mdiBugOutline, mdiEmail} from '@mdi/js';

import Icon from '@mdi/react'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'

import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'

import FacebookIcon from '@mui/icons-material/Facebook'
import YouTubeIcon from '@mui/icons-material/YouTube'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import { Logo } from '../styled/Buttons';

export default async function InfoFooter() {
  return (
    <Paper sx={{background: "#336699", color: "#FFF", padding: 2, paddingTop: 5, borderRadius: 0}}>
      <Container maxWidth="lg">
        <Grid container justifyContent={"space-around"}>
          <Grid item>
            <Stack direction={"column"} spacing={2}>
              <Logo href={`/data`} title="CFDE Workbench" color="inherit" />
              <Divider sx={{borderColor: "#FFF"}}/>
              <Link href="https://github.com/MaayanLab/DRC-Portals/">
                <div className='flex items-center space-x-1'>
                  <Icon path={mdiGithub} size={1} /> 
                  <Typography variant='subtitle2' className='flex'>
                    Github Repository
                  </Typography>
                </div>
              </Link>
              <Link href="https://github.com/MaayanLab/DRC-Portals/issues/new">
                <div className='flex items-center space-x-1'>
                  <Icon path={mdiBugOutline} size={1} /> 
                  <Typography variant='subtitle2' className='flex'>
                    Report a bug
                  </Typography>
                </div>
              </Link>
              <Divider sx={{borderColor: "#FFF"}}/>
              <Typography variant="subtitle1">Contact</Typography>  
              <div className='flex items-center space-x-5'>
                <Link href="mailto:contact@cfde.info">
                    <Icon path={mdiEmail} size={1} /> 
                </Link>
                <Link href="/">
                    <FacebookIcon/>
                </Link>
                <Link href="/">
                    <YouTubeIcon/>
                </Link>
                <Link href="/">
                    <LinkedInIcon/>
                </Link>
              </div>
            </Stack>
          </Grid>
          <Grid item>
              <Stack spacing={2}>
                  <Typography variant="footer"><b>CFDE Portal</b></Typography>
                  <Link href="/data"><Typography variant="footer">About</Typography></Link>
                  <Link href="/info" target="_blank" rel="noopener noreferrer">
                    <Typography variant="footer">Information Portal</Typography>
                  </Link>
              </Stack>
          </Grid>
          <Grid item>
            <Stack spacing={2}>
              <Typography variant="subtitle1"><b>Data & Metadata</b></Typography>
              <Link href="/data"><Typography variant="footer">Metadata Search Engine</Typography></Link>
              <Link href="/data/matrix"><Typography variant="footer">Processed Datasets</Typography></Link>
              <Link href="/data/contribute/form"><Typography variant="footer">Contribute</Typography></Link>
            </Stack>
          </Grid>
          <Grid item>
            <Stack spacing={2}>
              <Typography variant="subtitle1"><b>Tools & Usecases</b></Typography>
              <Link href="/data"><Typography variant="footer">Tools and Workflows</Typography></Link>
              <Link href="/data"><Typography variant="footer">Chatbot</Typography></Link>
              <Link href="/data"><Typography variant="footer">Cross DCC Use Cases</Typography></Link>
            </Stack>
          </Grid>
        </Grid>
        <Grid item xs={12} sx={{marginTop: 5, marginRight: 5, marginLeft: 6}}>
          <Stack spacing={2} direction={"row"} justifyContent="space-between">
              <div className='flex space-x-2'>
                <Link href="/"><Typography variant="caption">Terms of Service</Typography></Link>
                <Link href="/"><Typography variant="caption">Privacy Policy</Typography></Link>
              </div>
              <Typography variant="caption">©CFDE Workbench {new Date().getFullYear()}</Typography>
          </Stack>
        </Grid>
      </Container>
    </Paper>

  )
}
