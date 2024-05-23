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

const Consortium = () => (
  <Stack spacing={2}>
    <Typography variant="subtitle1"><b>Consortium</b></Typography>
    <Link href="https://commonfund.nih.gov/dataecosystem" target="_blank" rel="noopener noreferrer">
      <Typography variant="footer">About the CFDE</Typography>
    </Link>
    <Link href="/info/dcc">
      <Typography variant="footer">CF-DCCs</Typography>
    </Link>
    <Link href="/data">
      <Typography variant="footer">Data Portal</Typography>
    </Link>
    {/* <Link href="/info/coming_soon">
      <Typography variant="footer">Knowledge Portal</Typography>
    </Link> */}
    <Link href="/info/partnerships"><Typography variant="footer">Partnerships</Typography></Link>
    <Link href="https://commonfund.nih.gov/dataecosystem/FundingOpportunities"><Typography variant="footer">Funding Opportunities</Typography></Link>
  </Stack>
)

const Ecosystem = () => (
  <Stack spacing={2}>
      <Typography variant="subtitle1"><b>Ecosystem</b></Typography>
      <Link href="/info/training_and_outreach"><Typography variant="footer">Training & Outreach</Typography></Link>
      {/* <Link href="/info/coming_soon">
        <Typography variant="footer">Products</Typography>
      </Link> */}
      <Link href="/info/documentation"><Typography variant="footer">Documentation</Typography></Link>
      <Link href="/info/publications"><Typography variant="footer">Publications</Typography></Link>
      <Link href="/info/qr"><Typography variant="footer">Get QR Codes</Typography></Link>
    </Stack>
)

const Assets = () => (
  <Stack spacing={2}>
      <Typography variant="subtitle1"><b>Assets</b></Typography>
      <Link href="/data"><Typography variant="footer">Data & Metadata</Typography></Link>
      <Link href="/data/tools_and_workflows"><Typography variant="footer">Tools</Typography></Link>
      <Link href="/data/chat"><Typography variant="footer">Chatbot</Typography></Link>
      <Link href="/data/usecases"><Typography variant="footer">Use Cases</Typography></Link>
  </Stack>
)

export default async function InfoFooter() {
  return (
    <Paper sx={{background: "#2D5986", color: "#FFF", padding: 2, paddingTop: 5, borderRadius: 0}}>
      <Container maxWidth="lg" sx={{display: {sm: "none", xs: "none", md: "block"}}}>
        <Grid container justifyContent={"space-around"}>
          <Grid item>
            <Stack direction={"column"} spacing={2}>
              <Logo title="CFDE Workbench" href="/info" color="inherit"/>
              <Divider sx={{borderColor: "#FFF"}}/>
              {/* <Link href="https://github.com/MaayanLab/DRC-Portals/" target="_blank" rel="noopener noreferrer">
                <div className='flex items-center space-x-1'>
                  <Icon path={mdiGithub} size={1} /> 
                  <Typography variant='footer' className='flex'>
                    GitHub Repository
                  </Typography>
                </div>
              </Link> */}
              <Link href="https://github.com/MaayanLab/DRC-Portal-Issues/issues/new" target="_blank" rel="noopener noreferrer">
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
            <Consortium />
          </Grid>
          <Grid item>
            <Ecosystem />
          </Grid>
          <Grid item>
              <Assets />
          </Grid>
        </Grid>
        <Grid item xs={12} sx={{marginTop: 5, marginRight: 5, marginLeft: 6}}>
          <Stack spacing={2} direction={"row"} justifyContent="space-between">
              <Typography variant="caption">©CFDE Workbench {new Date().getFullYear()}</Typography>
              <Link href="https://reporter.nih.gov/project-details/10851224"><Typography variant="caption">This work is support by the NIH Common Fund CFDE program (Grant # OT2OD036435)</Typography></Link>
          </Stack>
        </Grid>
      </Container>
      <Container maxWidth="sm" sx={{display: {lg: "none", md: "none", xl: "none", sm: "block"}}}>
        <Stack spacing={2}>
          <Consortium />
          <Divider sx={{borderColor: "#FFF"}}/>
          <Ecosystem />
          <Divider sx={{borderColor: "#FFF"}}/>
          <Assets />
          <Divider sx={{borderColor: "#FFF"}}/>
          <Stack direction={"column"} spacing={2}>
            <Logo title="CFDE Workbench" href="/info" color="inherit"/>
            <div className='flex items-center space-x-3'>
              <SocialMedia/>
              <Link href="https://github.com/MaayanLab/DRC-Portal-Issues/issues/new" target="_blank" rel="noopener noreferrer">
                <div className='flex items-center space-x-1'>
                  <Icon path={mdiBugOutline} size={1} /> 
                  <Typography variant='footer' className='flex'>
                    Report a bug
                  </Typography>
                </div>
              </Link>
            </div>
          </Stack>
          <Stack spacing={1} direction={"column"}>
            <Link href="https://reporter.nih.gov/project-details/10851224"><Typography variant="caption">This work is support by the NIH Common Fund CFDE program (Grant # OT2OD036435)</Typography></Link>
            <Typography variant="caption">©CFDE Workbench {new Date().getFullYear()}</Typography>
          </Stack>
        </Stack>
      </Container>
    </Paper>
  )
}
