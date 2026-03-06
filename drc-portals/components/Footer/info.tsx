import Image from '@/utils/image'
import Link from '@/utils/link'

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
    <Link href="/info/about" target="_blank" rel="noopener noreferrer"><Typography variant="footer">About the CFDE</Typography></Link>
    <Link href="/info/dcc"><Typography variant="footer">CF Programs</Typography></Link>
    <Link href="/info/centers"><Typography variant="footer">CFDE Centers</Typography></Link>
    <Link href="/info/partnerships"><Typography variant="footer">Partnerships</Typography></Link>
    <Link href="/info/r03"><Typography variant="footer">Pilot Projects</Typography></Link>
  </Stack>
)

const Community = () => (
  <Stack spacing={2}>
      <Typography variant="subtitle1"><b>Community</b></Typography>
      <Link href="https://www.youtube.com/watch?v=TAnKcNp2kdY"><Typography variant="footer">Workbench Tutorial</Typography></Link>
      <Link href="/info/training_and_outreach"><Typography variant="footer">Training & Outreach</Typography></Link>
      <Link href="/data/documentation"><Typography variant="footer">Documentation</Typography></Link>
      <Link href="/info/qr"><Typography variant="footer">Get QR Codes</Typography></Link>
      <Link href="https://commonfund.nih.gov/dataecosystem/FundingOpportunities"><Typography variant="footer">Funding Opportunities</Typography></Link>
    </Stack>
)

const Resources = () => (
  <Stack spacing={2}>
      <Typography variant="subtitle1"><b>Resources</b></Typography>
      <Link href="/data"><Typography variant="footer">Data & Metadata</Typography></Link>
      <Link href="/data/tools_and_workflows"><Typography variant="footer">Tools</Typography></Link>
      <Link href="/data/chat"><Typography variant="footer">Chatbot</Typography></Link>
      <Link href="/data/usecases"><Typography variant="footer">Use Cases</Typography></Link>
      <Link href="/info/publications"><Typography variant="footer">Publications</Typography></Link>

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
              <SocialMedia/>
            </Stack>
          </Grid>
          <Grid item>
            <Consortium />
          </Grid>
          <Grid item>
            <Community />
          </Grid>
          <Grid item>
              <Resources />
          </Grid>
        </Grid>
        <Grid item xs={12} sx={{ marginTop: 5, marginRight: 5, marginLeft: 6 }}>
          <Stack 
            direction="row" 
            justifyContent="space-between" 
            alignItems="flex-end"
          >
            <Typography variant="caption">@CFDE Workbench {new Date().getFullYear()}</Typography>
            <Stack direction="column" alignItems="flex-end" spacing={0.5}>
              <Typography variant="caption" sx={{  lineHeight: 1 }}>
              The CFDE Workbench is actively being developed and maintained by the CFDE Data Resource Center (DRC).
              </Typography>
              <Typography variant="caption" sx={{  lineHeight: 1 }}>
              The DRC is funded by <Link href="https://reporter.nih.gov/search/SdeFoZSP2U2zRTjMZKFHlQ/project-details/11080094" target="_blank" rel="noopener noreferrer">
              <Typography variant="caption" component="span" sx={{ fontWeight: 'bold' }}>OT2OD036435 </Typography></Link> 
              from the <Link href="https://commonfund.nih.gov/dataecosystem" target="_blank" rel="noopener noreferrer">
              <Typography variant="caption" component="span" sx={{ fontWeight: 'bold' }}>Common Fund at the National Institutes of Health</Typography></Link>.
              </Typography>
            </Stack>
          </Stack>
        </Grid>
      </Container>
      <Container maxWidth="sm" sx={{display: {lg: "none", md: "none", xl: "none", sm: "block"}}}>
        <Stack spacing={2}>
          <Consortium />
          <Divider sx={{borderColor: "#FFF"}}/>
          <Community />
          <Divider sx={{borderColor: "#FFF"}}/>
          <Resources />
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
            <Stack direction="column" alignItems="flex-end" spacing={0.5}>
              <Typography variant="caption" sx={{  lineHeight: 1 }}>
              The CFDE Workbench is actively being developed and maintained by the CFDE Data Resource Center (DRC).
              </Typography>
              <Typography variant="caption" sx={{  lineHeight: 1 }}>
              The DRC is funded by <Link href="https://reporter.nih.gov/search/SdeFoZSP2U2zRTjMZKFHlQ/project-details/11080094" target="_blank" rel="noopener noreferrer">
              <Typography variant="caption" component="span" sx={{ fontWeight: 'bold' }}>OT2OD036435 </Typography></Link> 
              from the <Link href="https://commonfund.nih.gov/dataecosystem" target="_blank" rel="noopener noreferrer">
              <Typography variant="caption" component="span" sx={{ fontWeight: 'bold' }}>Common Fund at the National Institutes of Health</Typography></Link>.
              </Typography>
            </Stack>
            <Typography variant="caption">@CFDE Workbench {new Date().getFullYear()}</Typography>
          </Stack>
        </Stack>
      </Container>
    </Paper>
  )
}
