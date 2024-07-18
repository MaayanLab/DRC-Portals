import React, { ReactElement } from "react";
import Link from "next/link";
import Image from "next/image";

import { Grid,
  Card, 
  CardContent, 
  CardActions, 
  Container, 
  Stack, 
  Typography, 
  Fab, 
  Button, 
  Paper, 
  Box,
 } from '@mui/material'
import Icon from "@mdi/react"
import { mdiArrowRight, mdiToolbox, mdiLaptop, mdiChatOutline } from '@mdi/js';

import CFPrograms from "@/components/misc/CFPrograms"
import SearchField from "./processed/SearchField"
import { BlurBig } from "@/components/styled/Blur"
import Stats, { StatsFallback } from "./processed/Stats"
import { ResponsivePaper } from "../info/styled"
import Tooltip from '@mui/material/Tooltip';



// Define the CustomTooltipProps interface
interface CustomTooltipProps {
  title: string;
  imgSrc: string;
  imgAlt: string;
  text: string;
  children: ReactElement;
}

// CustomTooltip component using the CustomTooltipProps interface
const CustomTooltip: React.FC<CustomTooltipProps> = ({ imgSrc, imgAlt, text, children }) => {
  return (
    <Tooltip
      title={
        <Box display="flex" flexDirection="column" alignItems="center" width="100%">
          <img src={imgSrc} alt={imgAlt} style={{ width: '100%', display: 'block', marginBottom: '5px' }} />
          <Typography>{text}</Typography>
        </Box>
      }
      arrow
    >
      {children}
    </Tooltip>
  );
};

const search_cards = [
  {
    "title": "Metadata Search",
    "description": "Find relevant Common Fund data by entering your research topic",
    "button": "Search Metadata",
    "img": "/img/metadata.png",
    "link": "/data"
  },
  {
    "title": "Data Matrix",
    "description": "Search hundreds of processed data (XMTs, assertions, attribute table).",
    "button": "Explore Data Matrix",
    "img": "/img/processed_data.png",
    "link": "/data/matrix"
  }
];

const tool_cards = [
  {
    "title": "Tools & Workflows",
    "description": "Explore CFDE products such as bioinformatics tools, software libraries, and workflow engines",
    "icon": mdiToolbox,
    "link": "/data/tools_and_workflows"
  },
  {
    "title": "Use Cases",
    "description": "Explore crosscut DCC use cases encoded in Playbook Workflow Builder use cases",
    "icon": mdiLaptop,
    "link": "/data/usecases"
  }
];

export default async function Home({ searchParams }: { searchParams: { q?: string, error?: string } }) {
  return (
    <main className="text-center">
      <Grid container alignItems={"flex-start"} justifyContent={"center"}>
        <Grid item xs={12}>
          <Paper sx={{
                          boxShadow: "none", 
                          width: "100vw", 
                          minHeight: 560,
                          marginLeft: "calc((-100vw + 100%) / 2)", 
                          marginRight: "calc((-100vw + 100%) / 2)",
                          position: "relative",
                          overflow: "hidden"
                        }}
                  className="flex"
            >
              <BlurBig sx={{position: "absolute", left: "-20%"}} className="pointer-events-none" />
              <BlurBig sx={{position: "absolute", right: "-15%"}} className="pointer-events-none" />
              <Container maxWidth="lg" className="m-auto">
                <Grid container spacing={2} alignItems={"center"}>
                  <Grid item xs={12}>
                    <Stack spacing={2} justifyContent={"center"} alignItems={"center"}>
                      <Typography color="secondary" className="text-center" variant="h1">CFDE DATA PORTAL</Typography>
                      <Typography color="secondary" className="text-center" sx={{ fontSize: 20 }} variant="body1">
                        Search Common Fund Programs'&nbsp;
                        <CustomTooltip
                          title="C2M2 model information"
                          imgSrc="/img/C2M2_NEO4J_level0.jpg"
                          imgAlt="Crosscut Metadata (C2M2)"
                          text="The Crosscut Metadata Model (C2M2) is a flexible metadata standard for describing experimental resources in biomedicine and related fields. Click to find more about C2M2.">
                          <Link href="/info/documentation/C2M2" key="Metadata" color="secondary" className="underline cursor-pointer secondary" target="_blank" rel="noopener noreferrer">
                            Metadata
                          </Link>
                        </CustomTooltip>
                        &nbsp;and&nbsp; 
                        <CustomTooltip
                          title="Processed data information"
                          imgSrc="/img/Processed_Data_Matrix_Tooltip.JPG"
                          imgAlt="Processed Datasets"
                          text="Processed data includes C2M2 metadata data packages, gene and other entity set libraries (XMTs), knowledge graph (KG) assertions, and attribute tables. Click to find more about processed datasets.">
                          <Link href="/data/matrix" key="Processed" color="secondary" className="underline cursor-pointer secondary" target="_blank" rel="noopener noreferrer">
                            Processed Datasets
                          </Link>
                        </CustomTooltip>.
                      </Typography>
                      <Box>
                        <SearchField
                          action="/data/processed/search"
                          q={searchParams.q ?? ''}
                          error={searchParams.error}
                          InputProps={{
                            sx: {width:{xs: '270px', sm: '270px', md: '544px', lg: '544px', xl: '544px'} }
                          }}
                        />
                      </Box>
                      <Typography variant="stats_sub" sx={{display: {xs: "none", sm: "none", md: "block", lg: "block", xl: "block"}}}>
                        Try <Stack display="inline-flex" flexDirection="row" divider={<span>,&nbsp;</span>}>
                          {['STAT3', 'blood', 'dexamethasone'].map(example => (
                            <Link key={example} href={`/data/processed/search/${encodeURIComponent(example)}`} className="underline cursor-pointer">{example}</Link>
                          ))}
                        </Stack>
                      </Typography>
                      <Typography variant="stats_sub_small" sx={{display: {xs: "block", sm: "block", md: "none", lg: "none", xl: "none"}}}>
                        Try <Stack display="inline-flex" flexDirection="row" divider={<span>,&nbsp;</span>}>
                          {['STAT3', 'blood', 'dexamethasone'].map(example => (
                            <Link key={example} href={`/data/processed/search/${encodeURIComponent(example)}`} className="underline cursor-pointer">{example}</Link>
                          ))}
                        </Stack>
                      </Typography>
                      <div className="flex align-center space-x-10">
                        <Link href="/data/processed/help"><Button sx={{textTransform: 'uppercase'}} color="secondary">Learn More</Button></Link>
                        <Button sx={{textTransform: 'uppercase'}} variant="contained" color="primary" endIcon={<Icon path={mdiArrowRight} size={1}/>} type="submit">Search</Button>
                      </div>
                    </Stack>
                  </Grid>
                </Grid>
            </Container>
          </Paper>
        </Grid>
        <Grid item xs={12} sx={{ my: 8 }}>
          <Paper sx={{
                          boxShadow: "none", 
                          padding: 5, 
                          background: "#E7F3F5",
                          width: "100vw", 
                          marginLeft: "calc((-100vw + 100%) / 2)", 
                          marginRight: "calc((-100vw + 100%) / 2)",
                          marginBottom: 10,
                          position: "relative",
                          overflow: "hide"
                        }}
                  className="flex"
            >
              <Container maxWidth="lg" className="m-auto">
                <Grid container spacing={6} justifyContent={"center"} alignItems={"flex-start"}>
                  <React.Suspense fallback={<StatsFallback />}><Stats /></React.Suspense>
                </Grid>
              </Container>
            </Paper>
        </Grid>
        <Grid item xs={12} md={5} >
          <Stack spacing={2} sx={{ textAlign: "left" }}>
            <Typography variant="h2" color="secondary" sx={{ textTransform: 'uppercase' }}>
              Common Fund programs partnered with the CFDE
            </Typography>
            <Typography variant="body1" color="secondary" sx={{ width: "95%" }}>
              The NIH Common Fund is a funding entity within the NIH that supports bold scientific programs that catalyze discovery across all biomedical and behavioral research.
            </Typography>
            <Link href="/info/dcc">
              <Button color="secondary" sx={{ marginLeft: -2 }} endIcon={<Icon path={mdiArrowRight} size={1} />}>
                <Typography variant="subtitle1">
                  Explore CF Programs
                </Typography>
              </Button>
            </Link>
          </Stack>
        </Grid>
        <Grid item xs={12} md={1}></Grid>
        <Grid item xs={12} md={6}>
          <CFPrograms baseEndpoint="/data/matrix" spacing={2} />
        </Grid>
        <Grid item xs={12}  sx={{marginTop: 15}}>
          <ResponsivePaper sx={{
                          boxShadow: "none", 
                          background: '#EDF0F8',
                          padding: 5, 
                          width: "100vw", 
                          marginLeft: "calc((-100vw + 100%) / 2)", 
                          marginRight: "calc((-100vw + 100%) / 2)",
                        }}
                  className="flex"
            >
              <Container maxWidth="lg" className="m-auto">
                <Grid container spacing={5} alignItems={"center"} justifyContent={"center"}>
                  <Grid item xs={12}>
                    <Container maxWidth="md">
                      <Typography variant="h2" color="secondary" sx={{textTransform: "uppercase"}}>Metadata and Processed Data</Typography>
                      <Typography variant="body1" color="secondary">Efficiently locate datasets based on specific attributes and conduct in-depth analyses, driving forward groundbreaking research endeavors.</Typography>
                    </Container>
                  </Grid>
                  {search_cards.map((e, i)=>(
                    <Grid item key={i}>
                      <Card sx={{
                        minHeight: {xl: 480, lg: 480, md: 480, sm: 200, xs: 200}, 
                        width: {xl: 400, lg: 400, md: 400, sm: 300, xs: 300}, 
                        paddingLeft: 2, paddingRight: 2}} className="flex flex-col space-y-5">
                        { e.img && 
                            <Box className="flex flex-row justify-center relative" sx={{minHeight:  {xl: 300, lg: 300, md: 300, sm: 200, xs: 200}}}><Image src={e.img} alt={e.title} fill={true} style={{objectFit: "contain"}}/></Box>
                        } 
                        <CardContent className="flex flex-col grow space-y-5 text-left" sx={{paddingLeft: 3, paddingRight: 3}}>
                          <Typography variant="h4">{e.title}</Typography>
                          <Typography variant="caption">
                            {e.description}
                          </Typography>
                        </CardContent>
                        <CardActions sx={{paddingLeft: 1, paddingRight: 3}}>
                          <Link href={e.link}><Button color="secondary" sx={{textTransform: "uppercase"}} endIcon={<Icon path={mdiArrowRight} size={1}/>}>{e.button}</Button></Link>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Container>
            </ResponsivePaper>
        </Grid>

        <Grid item xs={12}>
          <ResponsivePaper sx={{
                        boxShadow: "none", 
                        background: '#A5B4DB',
                      }}>
            <Container maxWidth={"lg"}  sx={{marginTop: 5, marginBottom: 5}}>
              <Grid container spacing={2} justifyContent={"center"} alignItems={"center"}>
                <Grid item>
                  <Card sx={{
                    minHeight: {xl: 300, lg: 300, md: 300, sm: 200, xs: 200}, 
                    width: {xl: 544, lg: 544, md: 544, sm: 300, xs: 300}, 
                    paddingLeft: 2, 
                    paddingRight: 2, 
                    textAlign: "left"}}>
                    <CardContent className="flex flex-col" sx={{minHeight: 300}}>
                    <Icon path={mdiToolbox} size={1} className="ml-2 mb-2" />
                      <div className="flex flex-col grow">
                        <Typography variant="h2" sx={{ fontWeight: 400, width: 150 }} color="secondary">
                          TOOLS & WORKFLOWS
                        </Typography>
                        <Typography variant="body2" color="secondary" sx={{ marginTop: 2 }}>
                          Explore CFDE products such as bioinformatics tools, software libraries, and workflow engines
                        </Typography>
                      </div>

                      <div><Link href="/data/tools_and_workflows"><Button variant="contained" color="tertiary" endIcon={<Icon path={mdiArrowRight} size={1} />}>CF TOOLS</Button></Link></div>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item>
                  <Card sx={{
                    minHeight: {xl: 300, lg: 300, md: 300, sm: 200, xs: 200}, 
                    width: {xl: 544, lg: 544, md: 544, sm: 300, xs: 300}, 
                    paddingLeft: 2,
                    paddingRight: 2,
                    textAlign: "left"}}>
                    <CardContent className="flex flex-col" sx={{minHeight: 300}}>
                    <Icon path={mdiLaptop} size={1} className="ml-2 mb-2" />
                      <div className="flex flex-col grow">
                        <Typography variant="h2" sx={{ fontWeight: 400, width: 150 }} color="secondary">
                          USE CASES
                        </Typography>
                        <Typography variant="body2" color="secondary" sx={{ marginTop: 2 }}>
                          Explore crosscut DCC use cases encoded in Playbook Workflow Builder use cases
                        </Typography>
                      </div>

                      <div><Link href="/data/usecases"><Button variant="contained" color="tertiary" endIcon={<Icon path={mdiArrowRight} size={1}/>}>Use Cases</Button></Link></div>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Container>
          </ResponsivePaper>
        </Grid>
        <Grid item>
          <Link href={"/data/chat"}>
            <Fab sx={{
              position: 'fixed',
              bottom: 50,
              right: 50,
            }} aria-label={'chat'} color={'primary'}>
              <Icon style={{ color: "#336699" }} path={mdiChatOutline} size={1} />
            </Fab>
          </Link>
        </Grid>
      </Grid>
    </main>
  );
}
