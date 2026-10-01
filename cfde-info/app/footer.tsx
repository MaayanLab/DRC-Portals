'use client'
import Link from 'next/link'

import { mdiBugOutline} from '@mdi/js';
import Image from 'next/image';
import Icon from '@mdi/react'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'

import IconButton from '@mui/material/IconButton';
import SocialMedia from './socials';
import { usePathname } from 'next/navigation';
import { styled } from '@mui/system';

export const ElevatedIconButton = styled(IconButton)({
    boxShadow: '0px 1px 3px 1px rgba(15, 31, 46, 0.15)',
    padding: 3,
    background: "#FFF"
  });

const Logo = ({title, color, size}: {title: string,  color: "primary"| "secondary" | "inherit", size?: "small" | "large"}) => (
    <Link href={'/'} style={{display: "flex", alignItems: "center", gap: 10, textDecoration: "none"}}>
        <div>
        <ElevatedIconButton
                aria-label="menu"
                sx={{width: 35, height: 35}}
            >
                <Image style={{marginLeft: -2,  objectFit: "contain"}} fill={true} alt="cfde-logo" src={'/img/icons/favicon.ico'} />
            </ElevatedIconButton>
        </div>
        <div>
            <Typography sx={{
              fontSize: 24,
              fontStyle: "normal",
              fontWeight: 400,
              textTransform: "uppercase",
              color: "#FFF",
              fontFamily: "'DM Sans','DM Sans Fallback'"
            }} color={"#FFF"}>CFDE Workbench</Typography>
        </div>
    </Link>
)

const Consortium = () => (
  <Stack spacing={2}>
    <Typography variant="subtitle1"><b>Consortium</b></Typography>
    <Link style={{ textDecoration: "none", color: "#FFF"}} href="https://cfde.cloud/info/about" target="_blank" rel="noopener noreferrer"><Typography variant="footer">About the CFDE</Typography></Link>
    <Link style={{ textDecoration: "none", color: "#FFF"}} href="https://cfde.cloud/info/dcc"><Typography variant="footer">CF Programs</Typography></Link>
    <Link style={{ textDecoration: "none", color: "#FFF"}} href="https://cfde.cloud/info/centers"><Typography variant="footer">CFDE Centers</Typography></Link>
    <Link style={{ textDecoration: "none", color: "#FFF"}} href="https://cfde.cloud/info/partnerships"><Typography variant="footer">Partnerships</Typography></Link>
    <Link style={{ textDecoration: "none", color: "#FFF"}} href="https://cfde.cloud/info/r03"><Typography variant="footer">Pilot Projects</Typography></Link>
  </Stack>
)

const Community = () => (
  <Stack spacing={2}>
      <Typography variant="subtitle1"><b>Community</b></Typography>
      <Link style={{ textDecoration: "none", color: "#FFF"}} href="https://www.youtube.com/watch?v=TAnKcNp2kdY"><Typography variant="footer">Workbench Tutorial</Typography></Link>
      <Link style={{ textDecoration: "none", color: "#FFF"}} href="https://cfde.cloud/info/training_and_outreach"><Typography variant="footer">Training & Outreach</Typography></Link>
      <Link style={{ textDecoration: "none", color: "#FFF"}} href="https://cfde.cloud/data/documentation"><Typography variant="footer">Documentation</Typography></Link>
      <Link style={{ textDecoration: "none", color: "#FFF"}} href="https://cfde.cloud/info/qr"><Typography variant="footer">Get QR Codes</Typography></Link>
      <Link style={{ textDecoration: "none", color: "#FFF"}} href="https://commonfund.nih.gov/dataecosystem/FundingOpportunities"><Typography variant="footer">Funding Opportunities</Typography></Link>
    </Stack>
)

const Resources = () => (
  <Stack spacing={2}>
      <Typography variant="subtitle1"><b>Resources</b></Typography>
      <Link style={{ textDecoration: "none", color: "#FFF"}} href="https://cfde.cloud/data"><Typography variant="footer">Data & Metadata</Typography></Link>
      <Link style={{ textDecoration: "none", color: "#FFF"}} href="https://cfde.cloud/data/tools_and_workflows"><Typography variant="footer">Tools</Typography></Link>
      <Link style={{ textDecoration: "none", color: "#FFF"}} href="https://cfde.cloud/data/chat"><Typography variant="footer">Chatbot</Typography></Link>
      <Link style={{ textDecoration: "none", color: "#FFF"}} href="https://cfde.cloud/data/usecases"><Typography variant="footer">Use Cases</Typography></Link>
      <Link style={{ textDecoration: "none", color: "#FFF"}} href="https://cfde.cloud/info/publications"><Typography variant="footer">Publications</Typography></Link>

  </Stack>
)

export default function InfoFooter() {
  const pathname = usePathname()
  if (pathname === "/info") return null
  return (
    <Paper sx={{background: "#2D5986", color: "#FFF", padding: 2, paddingTop: 5, borderRadius: 0}}>
      <Container maxWidth="lg" sx={{display: {sm: "none", xs: "none", md: "block"}}}>
        <Grid container sx={{justifyContent: 'space-around'}}>
          <Grid>
            <Stack direction={"column"} spacing={2}>
              <Logo title="CFDE Workbench" color="inherit"/>
              <Divider sx={{borderColor: "#FFF"}}/>
              {/* <Link style={{ textDecoration: "none", color: "#FFF"}} href="https://github.com/MaayanLab/DRC-Portals/" target="_blank" rel="noopener noreferrer">
                <div style={{display: "flex", alignItems: "center", gap: 10, textDecoration: "none"}}>
                  <Icon path={mdiGithub} size={1} /> 
                  <Typography variant='footer' className='flex'>
                    GitHub Repository
                  </Typography>
                </div>
              </Link> */}
              <Link style={{ textDecoration: "none", color: "#FFF"}} href="https://github.com/MaayanLab/DRC-Portal-Issues/issues/new" target="_blank" rel="noopener noreferrer">
                <div style={{display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#FFF"}}>
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
          <Grid>
            <Consortium />
          </Grid>
          <Grid>
            <Community />
          </Grid>
          <Grid>
              <Resources />
          </Grid>
        </Grid>
        <Grid size={{xs: 12}} sx={{ marginTop: 5, marginRight: 5, marginLeft: 6 }}>
          <Stack 
            direction="row" 
            sx={{
              justifyContent: "space-between",
              alignItems: "flex-end"
            }}
          >
            <Typography variant="caption">@CFDE Workbench {new Date().getFullYear()}</Typography>
            <Stack direction="column" sx={{alignItems: "flex-end"}} spacing={0.5}>
              <Typography variant="caption" sx={{  lineHeight: 1 }}>
              The CFDE Workbench is actively being developed and maintained by the CFDE Data Resource Center (DRC).
              </Typography>
              <Typography variant="caption" sx={{  lineHeight: 1 }}>
              The DRC is funded by <Link style={{ textDecoration: "none", color: "#FFF"}} href="https://reporter.nih.gov/search/SdeFoZSP2U2zRTjMZKFHlQ/project-details/11080094" target="_blank" rel="noopener noreferrer">
              <Typography variant="caption" component="span" sx={{ fontWeight: 'bold' }}>OT2OD036435 </Typography></Link> 
              from the <Link style={{ textDecoration: "none", color: "#FFF"}} href="https://commonfund.nih.gov/dataecosystem" target="_blank" rel="noopener noreferrer">
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
            <Logo title="CFDE Workbench" color="inherit"/>
            <div className='flex items-center space-x-3'>
              <SocialMedia/>
              <Link style={{ textDecoration: "none", color: "#FFF"}} href="https://github.com/MaayanLab/DRC-Portal-Issues/issues/new" target="_blank" rel="noopener noreferrer">
                <div style={{display: "flex", alignItems: "center", gap: 10, textDecoration: "none"}}>
                  <Icon path={mdiBugOutline} size={1} /> 
                  <Typography variant='footer' className='flex'>
                    Report a bug
                  </Typography>
                </div>
              </Link>
            </div>
          </Stack>
          <Stack spacing={1} direction={"column"}>
            <Stack direction="column" sx={{alignItems: "flex-end"}} spacing={0.5}>
              <Typography variant="caption" sx={{  lineHeight: 1 }}>
              The CFDE Workbench is actively being developed and maintained by the CFDE Data Resource Center (DRC).
              </Typography>
              <Typography variant="caption" sx={{  lineHeight: 1 }}>
              The DRC is funded by <Link style={{ textDecoration: "none", color: "#FFF"}} href="https://reporter.nih.gov/search/SdeFoZSP2U2zRTjMZKFHlQ/project-details/11080094" target="_blank" rel="noopener noreferrer">
              <Typography variant="caption" component="span" sx={{ fontWeight: 'bold' }}>OT2OD036435 </Typography></Link> 
              from the <Link style={{ textDecoration: "none", color: "#FFF"}} href="https://commonfund.nih.gov/dataecosystem" target="_blank" rel="noopener noreferrer">
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
