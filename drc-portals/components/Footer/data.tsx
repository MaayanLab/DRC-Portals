import Link from '@/utils/link'
import Image from 'next/image';

import { mdiGithub, mdiBugOutline, mdiEmail} from '@mdi/js';

import Icon from '@mdi/react'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'

import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import { Logo } from '../styled/Logo';
import SocialMedia from '../misc/Socials';

const Portal = () => (
  <Stack spacing={2}>
      <Typography variant="footer"><b>CFDE Portal</b></Typography>
      <Link href="https://commonfund.nih.gov/dataecosystem" target="_blank" rel="noopener noreferrer">
        <Typography variant="footer">About the CFDE</Typography>
      </Link>
      <Link href="/info/dcc">
        <Typography variant="footer">CF-DCCs</Typography>
      </Link>
      <Link href="/info">
        <Typography variant="footer">Information Portal</Typography>
      </Link>
      <Link href="/info/partnerships"><Typography variant="footer">Partnerships</Typography></Link>
      <Link href="https://www.youtube.com/watch?v=TAnKcNp2kdY"><Typography variant="footer">Video Tutorial</Typography></Link>
      <Link href="https://commonfund.nih.gov/dataecosystem/FundingOpportunities"><Typography variant="footer">Funding Opportunities</Typography></Link>
  </Stack>
)

const Data = () => (
  <Stack spacing={2}>
    <Typography variant="subtitle1"><b>Data & Metadata</b></Typography>
    <Link href="/data"><Typography variant="footer">Metadata Search Engine</Typography></Link>
    <Link href="/data/matrix"><Typography variant="footer">Data Matrix</Typography></Link>
    <Link href="/data/submit"><Typography variant="footer">Submit</Typography></Link>             
  </Stack>
)

const Tools = () => (
  <Stack spacing={2}>
      <Typography variant="subtitle1"><b>Tools & Use Cases</b></Typography>
      <Link href="/data/tools_and_workflows"><Typography variant="footer">Tools and Workflows</Typography></Link>
      <Link href="/data/usecases">
        <Typography variant="footer">Use Cases</Typography>
      </Link>
      <Link href="/data/chat"><Typography variant="footer">Chatbot</Typography></Link>
      <Link href="/data/archiving"><Typography variant="footer">Archiving Service</Typography></Link>
      {/* <Link href="/data/coming_soon"><Typography variant="footer">Cross DCC Use Cases</Typography></Link> */}
    </Stack>
)
 
export default async function DataFooter() {
  return (
    <Paper sx={{background: "#2D5986", color: "#FFF", padding: 2, paddingTop: 5, borderRadius: 0}}>
      <Container maxWidth="lg" sx={{display: {sm: "none", xs: "none", md: "block"}}}>
        <Grid container justifyContent={"space-around"}>
          <Grid item>
            <Stack direction={"column"} spacing={2}>
              <Logo title="CFDE Workbench" href="/data" color="inherit" />
              <Divider sx={{borderColor: "#FFF"}}/>
        
              <Link href="https://github.com/MaayanLab/DRC-Portal-Issues/issues/new" target="_blank" rel="noopener noreferrer">
                <div className='flex items-center space-x-1'>
                  <Icon path={mdiBugOutline} size={1} /> 
                  <Typography variant='subtitle2' className='flex'>
                    Report a bug
                  </Typography>
                </div>
              </Link>
              <Divider sx={{borderColor: "#FFF"}}/>
              <SocialMedia/>
            </Stack>
          </Grid>
          <Grid item>
              <Portal />
          </Grid>
          <Grid item>
            <Data />
          </Grid>
          <Grid item>
            <Tools />
          </Grid>
        </Grid>
        <Grid item xs={12} sx={{marginTop: 5, marginRight: 5, marginLeft: 6}}>
          <Stack spacing={2} direction={"row"} justifyContent="space-between">
              {/* <div className='flex space-x-2'>
                <Link href="/"><Typography variant="caption">Terms of Service</Typography></Link>
                <Link href="/"><Typography variant="caption">Privacy Policy</Typography></Link>
              </div> */}
              <Typography variant="caption">©CFDE Workbench {new Date().getFullYear()}</Typography>
              <Link href="https://reporter.nih.gov/project-details/10851224"><Typography variant="caption">This work is support by the NIH Common Fund CFDE program (Grant # OT2OD036435)</Typography></Link>
          </Stack>
        </Grid>
      </Container>
      <Container maxWidth="sm" sx={{display: {lg: "none", md: "none", xl: "none", sm: "block"}}}>
        <Stack spacing={2}>
          <Portal />
          <Divider sx={{borderColor: "#FFF"}}/>
          <Data />
          <Divider sx={{borderColor: "#FFF"}}/>
          <Tools />
          <Divider sx={{borderColor: "#FFF"}}/>
          <Stack direction={"column"} spacing={2}>
            <Logo title="CFDE Workbench" href="/data" color="inherit"/>
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
