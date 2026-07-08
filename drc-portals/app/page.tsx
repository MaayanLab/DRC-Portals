import { Box, Button, Card, CardContent, Container, Grid, Paper, Stack, Tooltip, Typography } from "@mui/material"
import Carousel from '@/components/misc/Carousel/ServerCarousel'
import Image from "@/utils/image"
import Link from "next/link"
import Icon from "@mdi/react"
import { mdiArrowRight, mdiBookOpenVariantOutline, mdiLink, mdiYoutube } from "@mdi/js"
import Twitter from "@/components/misc/Twitter"
import SimplePublicationComponent from "@/components/misc/Publication/SimplePublicationComponent"
import prisma from "@/lib/prisma"
import CFPrograms from "@/components/misc/CFPrograms"
import { ResponsivePaper } from "@/app/info/styled"
import { BlurSmall } from "@/components/styled/Blur"
import Summary from "@/app/data/processed/SummaryComponent"
import Wheel from "./wheel"
export default async function Page() {
  const publications = await prisma.publication.findMany({
        orderBy: {
          year: "desc"
        },
        take: 9
    })
  const dccs = await ( (await fetch("https://raw.githubusercontent.com/MaayanLab/cfde-wheel/refs/heads/main/src/dccs.json")).json())
    
    return (
      <Grid container spacing={2} alignItems={"flex-start"}>
        <Grid item xs={12} md={4}>
          <Stack spacing={2} >
            <Typography variant="h1" color={'#2D5986'}><b>Discover, Analyze, and Integrate NIH Common Fund Data</b></Typography>
            <Stack sx={{display: {xs: "none", sm: "none", md: "block", lg: "block", xl: "block"}}}>
            <Button color="secondary" href="/explorer" startIcon={<Icon path={mdiArrowRight} size={1} />}>
              <Typography variant="h5"><b>Explore Harmonized Common Fund Datasets</b></Typography>
            </Button>
            <Button color="secondary" target="_blank" rel="noopener noreferrer" href="https://cfdeknowledge.org/r/kc_landing" startIcon={<Icon path={mdiArrowRight} size={1} />}>
              <Typography variant="h5"><b>Discover Knowledge Extracted from CFDE Datasets</b></Typography>
            </Button>
            <Button color="secondary" target="_blank" rel="noopener noreferrer" href="https://cfdeworkspace.org/" startIcon={<Icon path={mdiArrowRight} size={1} />}>
              <Typography variant="h5"><b>Sign Up for Your Own CFDE Cloud Workspace</b></Typography>
            </Button>
            <Button color="secondary" target="_blank" rel="noopener noreferrer" href="https://orau.org/cfde-trainingcenter/" startIcon={<Icon path={mdiArrowRight} size={1} />}>
              <Typography variant="h5"><b>Acquire Skills in Using CFDE Datasets and Tools</b></Typography>
            </Button>
            <Button color="secondary" target="_blank" rel="noopener noreferrer" href="https://cfdeconnect.org/" startIcon={<Icon path={mdiArrowRight} size={1} />}>
              <Typography variant="h5"><b>Learn How to Engage with the CFDE Consortium</b></Typography>
            </Button>
          </Stack>
            
          </Stack>
        </Grid>
        <Grid item xs={12} md={8}>
            <Wheel dccs={dccs}/>
        </Grid>
        <Grid item xs={12} sx={{width: "100%", display: {xs: "block", sm: "block", md: "none", lg: "none", xl: "none"}}}>
          <Stack justifyContent={"center"} alignItems={"center"} sx={{display: "flex"}}>
            <Button color="secondary" href="/explorer" startIcon={<Icon path={mdiArrowRight} size={1} />}>
              <Typography sx={{textAlign: "center"}} variant="h5"><b>Explore Harmonized Common Fund Datasets</b></Typography>
            </Button>
            <Button color="secondary" target="_blank" rel="noopener noreferrer" href="https://cfdeknowledge.org/r/kc_landing" startIcon={<Icon path={mdiArrowRight} size={1} />}>
              <Typography sx={{textAlign: "center"}} variant="h5"><b>Discover Knowledge Extracted from CFDE Datasets</b></Typography>
            </Button>
            <Button color="secondary" target="_blank" rel="noopener noreferrer" href="https://cfdeworkspace.org/" startIcon={<Icon path={mdiArrowRight} size={1} />}>
              <Typography sx={{textAlign: "center"}} variant="h5"><b>Sign Up for Your Own CFDE Cloud Workspace</b></Typography>
            </Button>
            <Button color="secondary" target="_blank" rel="noopener noreferrer" href="https://orau.org/cfde-trainingcenter/" startIcon={<Icon path={mdiArrowRight} size={1} />}>
              <Typography sx={{textAlign: "center"}} variant="h5"><b>Acquire Skills in Using CFDE Datasets and Tools</b></Typography>
            </Button>
            <Button color="secondary" target="_blank" rel="noopener noreferrer" href="https://cfdeconnect.org/" startIcon={<Icon path={mdiArrowRight} size={1} />}>
              <Typography sx={{textAlign: "center"}} variant="h5"><b>Learn How to Engage with the CFDE Consortium</b></Typography>
            </Button>
          </Stack>
        </Grid>
        {/* <Grid item xs={12}>
          <Paper sx={{
                  boxShadow: "none", 
                  padding: 5, 
                  background: "#E7F3F5",
                  width: "100vw", 
                  marginLeft: "calc((-100vw + 100%) / 2)", 
                  marginRight: "calc((-100vw + 100%) / 2)",
                  marginBottom: 10,
                  position: "relative",
                  overflow: "hide",
                  marginTop: 5
                }}
              className="flex"
          >
            <Summary include={['file', 'kg_assertion', 'gene', 'gene_set', 'compound']} />
          </Paper>
        </Grid> */}
        <Grid item xs={12}>
          <Typography variant="h2" color="secondary" sx={{textAlign: "center", mt: 2}}>
            Learn More About the Common Fund Data Ecosystem
          </Typography>
        </Grid>
        <Grid item xs={12} md={9}>
          <Carousel/>
        </Grid>
        <Grid item xs={12} md={3}>
          <Stack sx={{display: {xs: "none", sm: "none", md: "flex", lg: "flex", xl: "flex"}}} spacing={1}>
            <Card sx={{width: 270}}>
              <CardContent>
                <Typography sx={{color: "#FFF", backgroundColor: "tertiary.main", textAlign: "center", width: 233}}variant="subtitle1">ABOUT THE WORKBENCH</Typography>
                <Box sx={{width: 233}}>
                  <Image src="/img/workbench.png" alt="workbench" width={233} height={233}/>
                </Box>
                <div className="flex justify-start">
                  <div>
                    <Button color="tertiary" sx={{backgroundColor: "#eaedf6", color: "#2D5986"}} endIcon={<Icon path={mdiArrowRight} size={1} />}>
                      <Link target="_blank" rel="noopener noreferrer" href={"https://www.sciencedirect.com/science/article/pii/S0022283626000045"}>
                        <Typography variant="caption"><b>READ PAPER</b></Typography>
                      </Link>
                    </Button>
                    
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card sx={{width: 270}}>
              <CardContent>
                <Typography sx={{color: "#FFF", backgroundColor: "tertiary.main", textAlign: "center"}}variant="subtitle1">FEATURED TOOL</Typography>
                  <Box>
                    <Image src="https://cfde-drc.s3.us-east-2.amazonaws.com/assets/img/pwb-w-062025.png" alt="gsc" width={233} height={233}/>
                  </Box>
                  <Stack direction={"row"} spacing={1}>
                      <Tooltip title="Read publication">
                        <Button color="secondary">
                          <Link target="_blank" rel="noopener noreferrer" href={"https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1012901"}>
                            <Icon path={mdiBookOpenVariantOutline} size={1} />
                          </Link>
                        </Button>
                      </Tooltip>
                      <Tooltip title="Go to site">
                        <Button color="secondary">
                          <Link target="_blank" rel="noopener noreferrer" href={"https://playbook-workflow-builder.cloud"}>
                            <Icon path={mdiLink} size={1} />
                          </Link>
                        </Button>
                      </Tooltip>
                      <Tooltip title="Watch tutorial">
                        <Button  color="secondary">
                          <Link target="_blank" rel="noopener noreferrer" href={"https://www.youtube.com/watch?v=mHXCdX0kfHE"}>
                            <Icon path={mdiYoutube} size={1} />
                          </Link>
                        </Button>
                      </Tooltip>
                    </Stack>
              </CardContent>
            </Card>
          </Stack>
          <Stack direction={"row"} justifyContent={"center"} sx={{display: {xs: "flex", sm: "flex", md: "none", lg: "none", xl: "none"}}} spacing={1}>
            <Card sx={{width: 270}}>
              <CardContent>
                <Typography sx={{color: "#FFF", backgroundColor: "tertiary.main", textAlign: "center", width: 233}}variant="subtitle1">ABOUT THE WORKBENCH</Typography>
                <Box sx={{width: 233}}>
                  <Image src="/img/workbench.png" alt="workbench" width={233} height={233}/>
                </Box>
                <div className="flex justify-start">
                  <div>
                    <Button color="tertiary" sx={{backgroundColor: "#eaedf6", color: "#2D5986"}} endIcon={<Icon path={mdiArrowRight} size={1} />}>
                      <Link target="_blank" rel="noopener noreferrer" href={"https://www.sciencedirect.com/science/article/pii/S0022283626000045"}>
                        <Typography variant="caption"><b>READ PAPER</b></Typography>
                      </Link>
                    </Button>
                    
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card sx={{width: 270}}>
              <CardContent>
                <Typography sx={{color: "#FFF", backgroundColor: "tertiary.main", textAlign: "center"}}variant="subtitle1">FEATURED TOOL</Typography>
                  <Box>
                    <Image src="https://cfde-drc.s3.us-east-2.amazonaws.com/assets/img/pwb-w-062025.png" alt="gsc" width={233} height={233}/>
                  </Box>
                  <Stack direction={"row"} spacing={1}>
                      <Tooltip title="Read publication">
                        <Button color="secondary">
                          <Link target="_blank" rel="noopener noreferrer" href={"https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1012901"}>
                            <Icon path={mdiBookOpenVariantOutline} size={1} />
                          </Link>
                        </Button>
                      </Tooltip>
                      <Tooltip title="Go to site">
                        <Button color="secondary">
                          <Link target="_blank" rel="noopener noreferrer" href={"https://playbook-workflow-builder.cloud"}>
                            <Icon path={mdiLink} size={1} />
                          </Link>
                        </Button>
                      </Tooltip>
                      <Tooltip title="Watch tutorial">
                        <Button  color="secondary">
                          <Link target="_blank" rel="noopener noreferrer" href={"https://www.youtube.com/watch?v=mHXCdX0kfHE"}>
                            <Icon path={mdiYoutube} size={1} />
                          </Link>
                        </Button>
                      </Tooltip>
                    </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
        <Grid item xs={12} md={5}>
          <Stack spacing={2}>
            <Typography variant="h2" color="secondary" sx={{textTransform: 'uppercase'}}>
              Common Fund programs partnered with the CFDE
            </Typography>
            <Typography variant="body1" color="secondary" sx={{width: "95%"}}>
              The NIH Common Fund is a funding entity within the NIH that supports bold scientific programs that catalyze discovery across all biomedical and behavioral research.
            </Typography>
            <Link href="/info/dcc">
              <Button color="secondary" sx={{marginLeft: -2}} endIcon={<Icon path={mdiArrowRight} size={1} />}>
                <Typography variant="subtitle1">
                  Explore CF Programs
                </Typography>
              </Button>
            </Link>
          </Stack>
        </Grid>
        <Grid item xs={12} md={1} sx={{display: {md: "block", sm: "none", xs: "none"}}}></Grid>
        <Grid item xs={12} md={6}>
          <CFPrograms baseEndpoint="/info/dcc" spacing={2}/>
        </Grid>
        <Grid item xs={12} sx={{
          marginTop: 10, 
        }}>
        <Grid container spacing={2} justifyContent="center" alignItems={"center"}>
          <Grid item>
            <Paper sx={{
              borderRadius: 5, 
              height: 300, 
              width: "928px", 
              color: "#FFF", 
              background: "#2D5986",
              border:3,
              borderColor: "#C3E1E6", 
              boxShadow: 0,
              position: "relative",
              overflow: "hidden",
              display: {xs: 'none', sm: 'none', md: 'block', lg: 'block', xl: 'block'}
            }}>
              <Grid container spacing={2} sx={{height: 300}} justifyContent={"space-around"} alignItems={"center"}>
                <Grid item sx={{width: 400}}>
                  <Typography variant={"h1"} sx={{textTransform: "uppercase"}} color="inherit">
                    Documentation
                  </Typography>
                  <Typography variant={"subtitle1"} color="inherit">
                    Learn more about the standards and protocols for accessing and submitting data to the portal
                  </Typography>
                </Grid>
                <Grid item>
                  <Link href="/data/documentation">
                    <Button variant="contained" sx={{borderRadius: 2}} color="primary">Find Out More</Button>
                  </Link>
                </Grid>
              </Grid>
              <BlurSmall sx={{
                backgroundColor: "#C3E1E6",
                position: 'absolute', 
                bottom: -180, 
                right: "30%"
              }}/>
            </Paper>
            <Paper sx={{
              borderRadius: 5, 
              minHeight: 200, 
              color: "#FFF", 
              background: "#2D5986",
              border:3,
              borderColor: "#C3E1E6", 
              boxShadow: 0,
              position: "relative",
              overflow: "hidden",
              padding: 3,
              display: {xs: 'block', sm: 'block', md: 'none', lg: 'none', xl: 'none'}
            }}>
              <Grid container spacing={2} justifyContent={"space-around"} alignItems={"center"}>
                <Grid item xs={12}>
                  <Typography variant={"h2"} sx={{textTransform: "uppercase"}} color="inherit">
                    Documentation
                  </Typography>
                  <Typography variant={"subtitle1"} color="inherit">
                    Learn more about the standards and protocols for accessing and submitting data to the portal
                  </Typography>
                </Grid>
                <Grid item>
                  <Link href="/data/documentation">
                    <Button variant="contained" sx={{borderRadius: 2}} color="primary">Find Out More</Button>
                  </Link>
                </Grid>
              </Grid>
              <BlurSmall sx={{
                backgroundColor: "#C3E1E6",
                position: 'absolute', 
                bottom: -180, 
                right: "30%"
              }}/>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} sx={{marginTop: 5}}>
        <ResponsivePaper sx={{
                      boxShadow: "none", 
                      background: '#EDF0F8',
                      // padding: 10, 
                      borderRadius: 5, 
                      color: "#000",
                    }}>
          <Container maxWidth="lg">
              <Grid container spacing={2} justifyContent="center" alignItems={"center"}>
                <Grid item xs={12} sx={{marginBottom: 10}}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6} className="flex items-center justify-center">
                        <Link href="https://fairshake.cloud/" target="_blank" rel="noopener noreferrer">
                          <Image  src="/img/FAIR.png" alt="fair" width={400} height={400}/>
                        </Link>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant={"h2"} color="secondary">
                          Make CF data more FAIR
                        </Typography>
                        <Typography variant={"subtitle1"}>
                          The Data Resource and Knowledge Centers are dedicated to enhancing the accessibility and utility of Common Fund-generated data and resources, striving to uphold the FAIR principles. This commitment serves as a catalyst for groundbreaking biomedical discoveries, fostering synergies across the diverse datasets within the Common Fund ecosystem, thereby unlocking novel avenues of research and innovation.
                        </Typography>
                        <div  className="mt-5">
                          <Link href="https://www.nature.com/articles/sdata201618" target="_blank" rel="noopener noreferrer">
                            <Button color="secondary">
                              <Typography variant={"subtitle1"}>
                                What is FAIR?
                              </Typography>
                            </Button>
                          </Link>
                        </div>
                        <div  className="ml-8">
                          <ul>
                            <li style={{listStyleType: "disc"}}><Typography variant={"subtitle1"}>Findable</Typography></li>
                            <li style={{listStyleType: "disc"}}><Typography variant={"subtitle1"}>Accessible</Typography></li>
                            <li style={{listStyleType: "disc"}}><Typography variant={"subtitle1"}>Interoperable</Typography></li>
                            <li style={{listStyleType: "disc"}}><Typography variant={"subtitle1"}>Reusable</Typography></li>
                          </ul>
                        </div>
                      </Grid>
                    </Grid>
                </Grid>
                <Grid item md={6} xs={12} sx={{display: {sm: "none", xs: "none", md: "block"}}}>
                  <Twitter/>
                </Grid>
                <Grid item md={6} xs={12}>
                  <Typography sx={{color: "#FFF", backgroundColor: "tertiary.main", textAlign: "center", width: 120}}variant="subtitle1">PUBLICATIONS</Typography>
                  <SimplePublicationComponent publications={publications}/>
                  <Link href={"/info/publications"}>
                    <Button color="secondary" variant="outlined">
                      Show More
                    </Button>
                  </Link>
                </Grid>

                <Grid item md={6} xs={12} sx={{display: {lg: "none", xl: "none", md: "none"}}}>
                  <Twitter/>
                </Grid>
            </Grid>
          </Container>
        </ResponsivePaper>
      </Grid>
      </Grid>
    )
}