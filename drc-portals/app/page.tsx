import { Avatar, Box, Button, Card, CardContent, CardHeader, Container, Grid, Paper, Stack, Tooltip, Typography } from "@mui/material"
import Carousel from '@/components/misc/Carousel/ServerCarousel'
import Image from "@/utils/image"
import Link from "next/link"
import Icon from "@mdi/react"
import { mdiArrowRight, mdiBookOpenVariantOutline, mdiCompass, mdiDataMatrix, mdiDna, mdiEyedropper, mdiFile, mdiFileSearchOutline, mdiGraphOutline, mdiHammer, mdiLink, mdiListBox, mdiLungs, mdiMagnify, mdiMolecule, mdiPill, mdiRobotOutline, mdiSourceBranch, mdiToolbox, mdiVirus, mdiWater, mdiYoutube } from "@mdi/js"
import Twitter from "@/components/misc/Twitter"
import SimplePublicationComponent from "@/components/misc/Publication/SimplePublicationComponent"
import prisma from "@/lib/prisma"
import CFPrograms from "@/components/misc/CFPrograms"
import { ResponsivePaper } from "@/app/info/styled"
import { BlurSmall, BlurBig } from "@/components/styled/Blur"
import Wheel from "./wheel"
import { SummaryHorizontal, SummaryVertical } from "./data/processed/SummaryComponent"

const groups = [
  {
    title: "Search",
    icon: mdiMagnify,
    links: [
      {
        label: "Search Common Fund Data",
        href: "/data"
      },
      {
        label: "Interactively Query CFDE",
        href: "/data/graph"
      },
      {
        label: "Chat with our Virtual Assistant",
        href: "/data/chat"
      }
    ]
  },
  {
    title: "Analyze",
    icon: mdiToolbox,
    links: [
      {
        label: "Multiple Term Queries on CFDE Tools",
        href: "/explorer"
      },
      {
        label: "View Tools and Workflows",
        href: "/data/tools_and_workflows"
      }
    ]
  },
  {
    title: "Explore",
    icon: mdiToolbox,
    links: [
      {
        label: "About CFDE",
        href: "/info/about"
      },
      {
        label: "Explore and Download Datasets",
        href: "/data/matrix"
      },
      {
        label: "Read the Documentation",
        href: "/data/documentation"
      }
    ]
  },
]
export default async function Page() {
  const publications = await prisma.publication.findMany({
        orderBy: {
          year: "desc"
        },
        take: 9
    })
  // const dccs = await ( (await fetch("https://raw.githubusercontent.com/MaayanLab/cfde-wheel/refs/heads/main/src/dccs.json")).json())
    return (
      <Grid container spacing={2} alignItems={"flex-start"}>
        <Grid item xs={12}>
          <Paper sx={{
                        boxShadow: "none", 
                        // width: "100vw", 
                        minHeight: 650,
                        // marginLeft: "calc((-100vw + 100%) / 2)", 
                        // marginRight: "calc((-100vw + 100%) / 2)",
                        position: "relative",
                        overflow: "hidden",
                        background: "none",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                className="flex"
          >
            {/* <BlurBig sx={{position: "absolute", left: "-15%", zIndex: 100}} className="pointer-events-none" /> */}
            {/* <BlurSmall sx={{position: "absolute",  left: "5%", zIndex: 10}} className="pointer-events-none" /> */}
            <Grid container sx={{zIndex: 11}} alignItems={'center'}>
              <Grid item xs={12} md={8}>
                <Typography variant="h1" sx={{textTransform: "uppercase"}} color={'#2D5986'}><b>Discover, Analyze, and Integrate NIH Common Fund Data</b></Typography>
                <Typography variant="body1">The NIH Common Fund programs generate diverse datasets from a variety of projects ranging from genomics to phenotypes. The Common Fund Data Ecosystem (CFDE) aims to facilitate improved discovery, reuse, integration, and analyses of these datasets to form novel hypothesis for accelerating discoveries in biomedical research.</Typography>
                {/* <Button href="/data/matrix" variant="contained" color="secondary" sx={{width: 200, height: 50, mt: 5}}>
                  Get Started
                </Button> */}
                <Container maxWidth="lg" sx={{mt: 5}}>
                    <Grid container spacing={1}>
                      {groups.map(group=><Grid item xs={6} key={group.title} md={12/groups.length} sx={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                        <Paper elevation={0} sx={{ borderRadius: 0, padding: 1, background: "#607bc0", display: "flex", flexDirection: "column", alignItems: "center", height: "100%"}} >
                        <Icon style={{color: "white"}} path={group.icon} size={2} />
                        <Typography variant="h5" sx={{color: "white"}}><b>{group.title}</b></Typography>
                        {group.links.map(link=><Button component={Link} color="primary" href={link.href} key={link.label} sx={{padding: 0.5}}><Typography variant="body1" sx={{textAlign: "center"}}>{link.label}</Typography></Button>)}
                        </Paper>
                      </Grid>)}
                    </Grid>
                  </Container>
              </Grid>  
              <Grid item xs={4} sx={{display: {xs: "none", sm: "none", md: "block", lg: "block", xl: "block"}}}>
                <SummaryVertical include={[
                  // {key: "file", icon: mdiFile}, 
                  // {key: "biosample", icon: mdiEyedropper},
                  {key: "compound", icon: mdiPill},
                  {key: "metabolite", icon: mdiWater},
                  {key: "disease", icon: mdiVirus},
                  {key: "anatomy", icon: mdiLungs},
                  {key: "gene", icon: mdiDna},
                  {key: "gene_set", icon: mdiListBox},
                  {key: "glycoprotein", icon: mdiMolecule},
                ]}/>
              </Grid>
              <Grid item xs={12} sx={{display: {xs: "block", sm: "block", md: "none", lg: "none", xl: "none"}}}>
                <SummaryHorizontal include={[
                  {key: "file", icon: mdiFile}, 
                  {key: "biosample", icon: mdiEyedropper},
                  {key: "compound", icon: mdiPill},
                  {key: "metabolite", icon: mdiWater},
                  {key: "disease", icon: mdiVirus},
                  {key: "anatomy", icon: mdiLungs},
                  {key: "gene", icon: mdiDna},
                  {key: "gene_set", icon: mdiListBox},
                  {key: "glycoprotein", icon: mdiMolecule},
                ]}/>
              </Grid>
            </Grid>
        </Paper>
        </Grid>
        {/* <Grid item xs={12}>
          <Paper sx={{
                  borderRadius: 5, 
                  height: 250, 
                  width: "100%", 
                  color: "#FFF", 
                  background: "#607bc0",
                  border:3,
                  borderColor: "#C3E1E6", 
                  boxShadow: 0,
                  position: "relative",
                  overflow: "hidden",
                  mb: 10,
                }}>
                  <Container maxWidth="lg" sx={{mt: 5}}>
                    <Grid container>
                      {groups.map(group=><Grid item xs={6} key={group.title} md={12/groups.length} sx={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                        <Icon path={group.icon} size={2} />
                        <Typography variant="h5">{group.title}</Typography>
                        {group.links.map(link=><Button color="primary" href={link.href} key={link.label} sx={{padding: 0.5}}><Typography variant="body1" sx={{textAlign: "center"}}>{link.label}</Typography></Button>)}
                      </Grid>)}
                    </Grid>
                  </Container>
                </Paper>
        </Grid> */}
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
    )
}