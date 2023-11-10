import Image from 'next/image'
import Link from 'next/link'

import { mdiGithub, mdiBugOutline} from '@mdi/js';

import Icon from '@mdi/react'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import FacebookIcon from '@mui/icons-material/Facebook'
import YouTubeIcon from '@mui/icons-material/YouTube'
import LinkedInIcon from '@mui/icons-material/LinkedIn'


export default async function InfoFooter() {
  return (
    <Grid container direction={"column"} className='footer mt-10'>
        <Grid item>
            <Paper sx={{background: "#494949", color: "#FFF", padding: 2, borderRadius: 0}}>
              <Container maxWidth="lg">
                <Grid container justifyContent={"space-between"} alignItems={"center"}>
                  <Grid item>
                    <Typography variant="subtitle1" sx={{width: 300}}> Access our Open Source code and be part of the community</Typography>
                  </Grid>
                  <Grid item>
                    <Stack direction="row" spacing={3}>
                      <div className='flex items-center'>
                        <Icon path={mdiGithub} size={1} /> 
                        <Typography variant='subtitle2' className='flex'>
                          Github Repository
                        </Typography>
                        </div>
                      <Link href="https://github.com/MaayanLab/DRC-Portals/issues/new">
                        <div className='flex items-center'>
                          <Icon path={mdiBugOutline} size={1} /> 
                          <Typography variant='subtitle2' className='flex'>
                            Report a bug
                          </Typography>
                        </div>
                      </Link>
                    </Stack>
                  </Grid>
                </Grid>
              </Container>
            </Paper>
          </Grid>
          <Grid item>
            <Container maxWidth="lg" sx={{color: "#000", padding: 2}}>
              <Grid container justifyContent={"space-between"} direction={"column"} spacing={3}>
                <Grid item>
                    <Grid container justifyContent={"space-between"} alignItems={"flex-start"}>
                        <Grid item>
                            <Stack spacing={2} justifyContent={"space-between"}>
                                <Stack spacing={2}>
                                    <Link href={`/info`} className='flex items-center'>
                                    <IconButton
                                        aria-label="menu"
                                    >
                                        <Image src={'/img/favicon.png'} alt="cfde-logo" height={30} width={40}/>
                                    </IconButton>
                                    <Typography variant='h4' sx={{fontFamily: "sans-serif"}}>CFDE Workbench</Typography>
                                    </Link>
                                    <Link href="mailto:support@cfde.atlassian.net">
                                    <Button color="secondary">
                                        <Typography variant="subtitle2">support@cfde.atlassian.net</Typography>
                                    </Button>
                                    </Link>
                                    <div className='flex items-center space-x-5'>
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
                            </Stack>
                        </Grid>
                        <Grid item>
                            <Stack spacing={2}>
                                <Typography variant="footer" sx={{mr:2, fontWeight: 700}}>Navigation</Typography>
                                <Link href="/"><Typography variant="footer">DCCs & CF Program</Typography></Link>
                                <Link href="/"><Typography variant="footer">DRC & KC</Typography></Link>
                                <Link href="/"><Typography variant="footer">Partnerships</Typography></Link>
                                <Link href="/"><Typography variant="footer">Standards & Protocols</Typography></Link>
                                <Link href="/"><Typography variant="footer">Training & Outreach</Typography></Link>
                                <Link href="/"><Typography variant="footer">Data & Metadata</Typography></Link>
                                <Link href="/"><Typography variant="footer">Tools</Typography></Link>
                                <Link href="/"><Typography variant="footer">Chatbot</Typography></Link>
                                <Link href="/"><Typography variant="footer">Publications</Typography></Link>
                            </Stack>
                        </Grid>
                    </Grid>
                    </Grid>
                    <Grid item>
                        <Grid container justifyContent={"space-between"} alignItems={"center"}>
                                <Grid item>
                                    <Stack spacing={2} direction={"row"}>
                                        <Link href="/"><Typography variant="footer">Terms of Service</Typography></Link>
                                        <Link href="/"><Typography variant="footer">Privacy Policy</Typography></Link>
                                    </Stack>
                                </Grid>
                                <Grid item>
                                    <Typography variant="footer">©CFDE Workbench 2023</Typography>
                                </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Container>
          </Grid>
        </Grid>
  )
}
