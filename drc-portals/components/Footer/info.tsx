import Image from 'next/image'
import Link from 'next/link'

import { mdiGithub, mdiBugOutline, mdiEmail} from '@mdi/js';

import Icon from '@mdi/react'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'

import { Logo } from '../styled/Logo';
import IconButton from '@mui/material/IconButton';
import SocialMedia from '../misc/Socials';
export default async function InfoFooter() {
  return (
    <Paper sx={{background: "#336699", color: "#FFF", padding: 2, paddingTop: 5, borderRadius: 0}}>
      <Container maxWidth="lg">
        <Grid container justifyContent={"space-around"}>
          <Grid item>
            <Stack direction={"column"} spacing={2}>
              <Logo href={`/info`} title="CFDE Workbench" color="inherit"/>
              <Divider sx={{borderColor: "#FFF"}}/>
              <Link href="https://github.com/MaayanLab/DRC-Portals/">
                <div className='flex items-center space-x-1'>
                  <Icon path={mdiGithub} size={1} /> 
                  <Typography variant='footer' className='flex'>
                    Github Repository
                  </Typography>
                </div>
              </Link>
              <Link href="https://github.com/MaayanLab/DRC-Portals/issues/new">
                <div className='flex items-center space-x-1'>
                  <Icon path={mdiBugOutline} size={1} /> 
                  <Typography variant='footer' className='flex'>
                    Report a bug
                  </Typography>
                </div>
              </Link>
              <Divider sx={{borderColor: "#FFF"}}/>
              <Typography variant="subtitle1">Contact</Typography>  
              <SocialMedia/>
            </Stack>
          </Grid>
          <Grid item>
            <Stack spacing={2}>
              <Typography variant="subtitle1"><b>Consortium</b></Typography>
              <Link href="/info/dcc">
                <Typography variant="footer">CF-DCCs</Typography>
              </Link>
              <Link href="/data">
                <Typography variant="footer">Data Portal</Typography>
              </Link>
              <Link href="/info/coming_soon">
                <Typography variant="footer">Knowledge Portal</Typography>
              </Link>
              <Link href="/info/partnerships"><Typography variant="footer">Partnerships</Typography></Link>
            </Stack>
          </Grid>
          <Grid item>
            <Stack spacing={2}>
              <Typography variant="subtitle1"><b>Ecosystem</b></Typography>
              <Link href="/info/outreach"><Typography variant="footer">Training & Outreach</Typography></Link>
              <Link href="/info/coming_soon">
                <Typography variant="footer">Products</Typography>
              </Link>
              <Link href="/info/coming_soon"><Typography variant="footer">Standards & Protocols</Typography></Link>
              <Link href="/info/publications"><Typography variant="footer">Publications</Typography></Link>
            </Stack>
          </Grid>
          <Grid item>
              <Stack spacing={2}>
                  <Typography variant="subtitle1"><b>Assets</b></Typography>
                  <Link href="/data/coming_soon"><Typography variant="footer">Data & Metadata</Typography></Link>
                  <Link href="/data/coming_soon"><Typography variant="footer">Tools</Typography></Link>
                  <Link href="/data/chat"><Typography variant="footer">Chatbot</Typography></Link>
                  <Link href="/data/coming_soon"><Typography variant="footer">Use Cases</Typography></Link>
              </Stack>
          </Grid>
        </Grid>
        <Grid item xs={12} sx={{marginTop: 5, marginRight: 5, marginLeft: 6}}>
          <Stack spacing={2} direction={"row"} justifyContent="space-between">
              <div className='flex space-x-5'>
                <Link href="/info/coming_soon"><Typography variant="caption">Terms of Service</Typography></Link>
                <Link href="/info/coming_soon"><Typography variant="caption">Privacy Policy</Typography></Link>
              </div>
              <Typography variant="caption">©CFDE Workbench {new Date().getFullYear()}</Typography>
          </Stack>
        </Grid>
      </Container>
    </Paper>
  )
}
