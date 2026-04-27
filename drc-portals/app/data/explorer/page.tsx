import { Box, Button, Card, CardContent, Container, Grid, Paper, Stack, Tooltip, Typography } from "@mui/material"
import Explorer from "./explorer"
import Carousel from '@/components/misc/Carousel/ServerCarousel'
import Image from "@/utils/image"
import Link from "next/link"
import Icon from "@mdi/react"
import { mdiArrowRight, mdiBookOpenVariantOutline, mdiDna, mdiEye, mdiEyedropper, mdiFlask, mdiHumanMaleHeightVariant, mdiLink, mdiListBox, mdiPill, mdiVirus, mdiYoutube } from "@mdi/js"
import trpc from "@/lib/trpc/server"
import { Search } from "./search"
import Summary from "../processed/SummaryComponentVertical"
import Twitter from "@/components/misc/Twitter"
import SimplePublicationComponent from "@/components/misc/Publication/SimplePublicationComponent"
import prisma from "@/lib/prisma"
import { blue, green, lime, orange, purple, red } from "@mui/material/colors"
import CFPrograms from "@/components/misc/CFPrograms"
import { ResponsivePaper } from "@/app/info/styled"
import { BlurSmall } from "@/components/styled/Blur"

const ui_elements: {[key: string]: {color: string, icon: string}} = {
  gene: {
    color: green[100],
    icon: mdiDna
  },
  variant: {
    color: green[200],
    icon: mdiDna
  },
  protein: {
    color: green[100],
    icon: mdiDna
  },
  gene_set: {
    color: purple[100],
    icon: mdiListBox,
  },
  phenotype: {
    color: orange[100],
    icon: mdiHumanMaleHeightVariant,
  },
  anatomy: {
    color: red[100],
    icon: mdiEye,
  },
  assay_type: {
    color: blue[100],
    icon: mdiFlask
  },
  drug: {
    color: lime[100],
    icon: mdiPill
  },
  compound: {
    color: lime[100],
    icon: mdiPill
  },
  metabolite: {
    color: lime[100],
    icon: mdiEyedropper
  },
  "disease or phenotype": {
    color: orange[100],
    icon: mdiVirus,
  },
  disease: {
    color: orange[100],
    icon: mdiVirus,
  }
}

export default async function Page({searchParams}: {
  searchParams: {q: string}
}) {
  if (searchParams.q === undefined) {
    const publications = await prisma.publication.findMany({
        orderBy: {
          year: "desc"
        },
        take: 9
      })
    return (
      <Grid container spacing={2} alignItems={"center"}>
        <Grid item xs={12}>
            <Explorer />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h2" color="secondary" sx={{textAlign: "center", mt: 2}}>
            Learn More About the Common Fund Data Ecosystem
          </Typography>
        </Grid>
        <Grid item xs={12} md={9}>
          <Carousel/>
        </Grid>
        <Grid item xs={12} md={3}>
          <Stack spacing={1}>
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
  } else {
    const query: {[key:string]: string[] | {[key:string]: {
      up_gene_set_id?: number,
      down_gene_set_id?: number,
      gene_set_id?: number
    }}} = JSON.parse(searchParams.q || '{}')
    const inputList:{entity: string, label: string, color: string, icon: string, values?: {[key: string]: string[]}, links?: {resource: string, description: string, link: string}[]}[] = []
    for (const [entity, v] of Object.entries(query)) {
      const {color, icon} = ui_elements[entity]
      if (entity === 'gene_set' && !Array.isArray(v)) {
        for (const [description, input] of Object.entries(v)) {
          const linksearch = await trpc.send_gene_set({input})
          inputList.push({
            entity,
            label: description,
            color,
            icon,
            links: linksearch
          })
        }

      } else if (Array.isArray(v)) {
        for (const label of v) {
          inputList.push({
            entity,
            label,
            color,
            icon,
          })
        }
      }
    }
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
            <Search inputList={inputList} />
        </Grid>
      </Grid>
    )
  }
}