import Image from 'next/image'
import Link from 'next/link'

import { mdiGithub, mdiBugOutline, mdiEmail} from '@mdi/js';

import Icon from '@mdi/react'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'

import FacebookIcon from '@mui/icons-material/Facebook'
import YouTubeIcon from '@mui/icons-material/YouTube'
import LinkedInIcon from '@mui/icons-material/LinkedIn'


export default async function InfoFooter() {
  return (
    <Paper sx={{background: "#494949", color: "#FFF", padding: 2, borderRadius: 0}}>
      <Container maxWidth="lg">
        <Grid container justifyContent={"space-between"}>
          <Grid item>
            <Stack direction={"column"} spacing={2}>
              <Link href={`/info`} className='flex items-center' style={{marginLeft: -15}}>
                <IconButton
                    aria-label="menu"
                >
                    <Image src={'/img/favicon.png'} alt="cfde-logo" height={30} width={40}/>
                </IconButton>
                <Typography variant='h4' sx={{fontFamily: "sans-serif"}}>CFDE Workbench</Typography>
              </Link>
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
              <Typography variant="subtitle1"><b>Consortium</b></Typography>
              <Link href="/info/about">
                <Typography variant="subtitle2">CF-DCCs</Typography>
              </Link>
              <Link href="/data" target="_blank" rel="noopener noreferrer">
                <Typography variant="subtitle2">Data Resource Portal</Typography>
              </Link>
              <Link href="/info/about">
                <Typography variant="subtitle2">Knowledge Portal</Typography>
              </Link>
              <Link href="/"><Typography variant="subtitle2">Partnerships</Typography></Link>
            </Stack>
          </Grid>
          <Grid item>
            <Stack spacing={2}>
              <Typography variant="subtitle1"><b>Ecosystem</b></Typography>
              <Link href="/info/outreach"><Typography variant="subtitle2">Training & Outreach</Typography></Link>
              <Link href="/info">
                <Typography variant="subtitle2">Products</Typography>
              </Link>
              <Link href="/"><Typography variant="subtitle2">Standards & Protocols</Typography></Link>
              <Link href="/info/publications"><Typography variant="subtitle2">Publications</Typography></Link>
            </Stack>
          </Grid>
          <Grid item>
              <Stack spacing={2}>
                  <Typography variant="subtitle1"><b>Assets</b></Typography>
                  <Link href="/"><Typography variant="subtitle2">Data & Metadata</Typography></Link>
                  <Link href="/"><Typography variant="subtitle2">Tools</Typography></Link>
                  <Link href="/"><Typography variant="subtitle2">Chatbot</Typography></Link>
                  <Link href="/"><Typography variant="subtitle2">Use Cases</Typography></Link>
              </Stack>
          </Grid>
        </Grid>
        <Grid item xs={12} sx={{marginTop: 5}}>
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
