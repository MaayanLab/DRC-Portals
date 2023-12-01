import React from "react"
import Link from "next/link"
import Image from "next/image"

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Icon from '@mdi/react';
import Fab from '@mui/material/Fab';
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import { mdiArrowRight, mdiToolbox, mdiLaptop, mdiChatOutline } from '@mdi/js';

import CFPrograms from "@/components/misc/CFPrograms"
import prisma from "@/lib/prisma"
import SearchField from "./processed/SearchField"
import { BlurBig } from "@/components/styled/Blur"
import ReactJoin from "@/components/util/ReactJoin"

const search_cards = [
  {
    "title": "Metadata Search",
    "description": "Find relevant Common Fund data by entering your research topic",
    "button": "Search Metadata",
    "img": "/img/metadata.png",
    "link": "/data/coming_soon"
  },
  {
    "title": "Processed Data",
    "description": "Search hundreds of processed data (XMTs, assertions, attribute table).",
    "button": "Explore Processed Data",
    "img": "/img/processed_data.png",
    "link": "/data/matrix"
  }
]

const tool_cards = [
  {
    "title": "Tools & Workflows",
    "description": "Find the right tool for your analysis from the hundreds of CF Tools.",
    "icon": mdiToolbox,
    "link": "/data/coming_soon"
  },
  {
    "title": "Use Cases",
    "description": "Explore use cases specifically designed to use multiple Common Fund DCCs.",
    "icon": mdiLaptop,
    "link": "/data/coming_soon"
  }
]

export default async function Home({ searchParams }: { searchParams: { error?: string } }) {
  const counts = await prisma.$queryRaw<Array<{
    label: string,
    count: number,
  }>>`
    with labeled_count as (
      select 'Genes' as label, (select count(*) from gene_entity) as count
      union
      select 'Genes sets' as label, (select count(*) from gene_set_node) as count
      union
      select 'Drugs' as label, (select count(*) from entity_node where type = 'Drug') as count
      union
      select 'Files' as label, (select count(*) from c2m2_file_node) as count
      union
      select 'KG Assertions' as label, (select count(*) from kg_assertion) as count
    )
    select label, count
    from labeled_count
    order by count desc;
  `
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
                    <form action="/data/processed/search" method="GET">
                      <Stack spacing={2} justifyContent={"center"} alignItems={"center"}>
                        <Typography color="secondary" className="text-center" variant="h1">CFDE DATA PORTAL</Typography>
                        <Typography color="secondary" className="text-center" sx={{fontSize: 20}} variant="body1">Search Common Fund Programs' Metadata and Processed Datasets.</Typography>
                        <SearchField q="" error={searchParams.error} />
                        <Typography variant="stats_sub">Try <ReactJoin sep={<>,&nbsp;</>}>{['MCF7', 'STAT3', 'blood', 'dexamethasone'].map(example => (
                          <Link key={example} href={`/data/processed/search?q=${encodeURIComponent(example)}`} className="underline cursor-pointer">{example}</Link>
                        ))}</ReactJoin></Typography>
                        <div className="flex align-center space-x-10">
                          <Button sx={{textTransform: 'uppercase'}} color="secondary">Learn More</Button>
                          <Button sx={{textTransform: 'uppercase'}} variant="contained" color="primary" endIcon={<Icon path={mdiArrowRight} size={1}/>} type="submit">Search</Button>
                        </div>
                      </Stack>
                    </form>
                  </Grid>
                </Grid>
              </Container>
          </Paper>
        </Grid>
        <Grid item xs={12}>
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
              <Grid container spacing={2} justifyContent={"center"} alignItems={"flex-start"}>
                  {counts.map(({ label, count }) => (
                      <Grid item xs={6} sm={4} md={3} lg={2} key="kg">
                        <div  className="flex flex-col">
                          <Typography variant="h2" color="secondary">{count.toLocaleString()}</Typography>
                          <Typography variant="subtitle1" color="secondary">{label.toUpperCase()}</Typography>
                        </div>
                      </Grid>
                    ))}
                </Grid>
              </Container>
            </Paper>
        </Grid>
        <Grid item xs={12} md={5} >
          <Stack spacing={2} sx={{textAlign: "left"}}>
            <Typography variant="h2" color="secondary" sx={{textTransform: 'uppercase'}}>
              Common Fund programs partnered with the CFDE
            </Typography>
            <Typography variant="body1" color="secondary" sx={{width: "95%"}}>
              The NIH Common Fund is a funding entity within the NIH that supports bold scientific programs that catalyze discovery across all biomedical and behavioral research.
            </Typography>
            <Link href="/info/dccs">
              <Button color="secondary" sx={{marginLeft: -2}} endIcon={<Icon path={mdiArrowRight} size={1} />}>
                <Typography variant="subtitle1">
                  Explore CF Programs
                </Typography>
              </Button>
            </Link>
          </Stack>
        </Grid>
        <Grid item xs={12} md={1}></Grid>
        <Grid item xs={12} md={6}>
          <CFPrograms spacing={2}/>
        </Grid>
        <Grid item xs={12}  sx={{marginTop: 15}}>
          <Paper sx={{
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
                      <Card sx={{minHeight: 480, width: 400, paddingLeft: 2, paddingRight: 2}} className="flex flex-col space-y-5">
                        { e.img && 
                            <div className="flex flex-row justify-center relative" style={{minHeight: 300}}><Image src={e.img} alt={e.title} fill={true} style={{objectFit: "contain"}}/></div>
                        } 
                        {/* <Divider sx={{borderColor: "#7187C3"}}/> */}
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
            </Paper>
        </Grid>
       
        <Grid item xs={12}>
          <Paper sx={{
                      boxShadow: "none", 
                      background: '#A5B4DB',
                      padding: 5,
                      borderRadius: 0,
                      width: "100vw", 
                      marginLeft: "calc((-100vw + 100%) / 2)", 
                      marginRight: "calc((-100vw + 100%) / 2)"}}>
            <Container maxWidth={"lg"}  sx={{marginTop: 5, marginBottom: 5}}>
              <Grid container spacing={2} justifyContent={"center"} alignItems={"center"}>
                <Grid item>
                  <Card sx={{minHeight: 300, width: 544, paddingLeft: 2, paddingRight: 2, textAlign: "left"}}>
                    <CardContent className="flex flex-col" sx={{minHeight: 300}}>
                    <Icon path={mdiToolbox} size={1} className="ml-2 mb-2" />
                      <div className="flex flex-col grow">
                        <Typography variant="h2" sx={{fontWeight: 400, width: 150}} color="secondary">
                          TOOLS & WORKFLOWS
                        </Typography>
                        <Typography variant="body2" color="secondary" sx={{marginTop: 2}}>
                          Find the right tool for your analysis from the hundreds of CF Tools
                        </Typography>
                      </div>

                      <div><Link href="/data/coming_soon"><Button variant="contained" color="tertiary" endIcon={<Icon path={mdiArrowRight} size={1}/>}>CF TOOLS</Button></Link></div>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item>
                  <Card sx={{minHeight: 300, width: 544, paddingLeft: 2, paddingRight: 2, textAlign: "left"}}>
                    <CardContent className="flex flex-col" sx={{minHeight: 300}}>
                    <Icon path={mdiLaptop} size={1} className="ml-2 mb-2" />
                      <div className="flex flex-col grow">
                        <Typography variant="h2" sx={{fontWeight: 400, width: 150}} color="secondary">
                          USE CASES
                        </Typography>
                        <Typography variant="body2" color="secondary" sx={{marginTop: 2}}>
                          Find the right tool for your analysis from the hundreds of CF Tools
                        </Typography>
                      </div>

                      <div><Link href="/data/coming_soon"><Button variant="contained" color="tertiary" endIcon={<Icon path={mdiArrowRight} size={1}/>}>Use Cases</Button></Link></div>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Container>
          </Paper>
        </Grid>
        <Grid item>
          <Link href={"/data/chat"}>
          <Fab sx={{
            position: 'fixed',
            bottom: 50,
            right: 50,
          }} aria-label={'chat'} color={'primary'}>
            <Icon style={{color: "#336699"}} path={mdiChatOutline} size={1} />
          </Fab>
          </Link>
        </Grid>
      </Grid>
    </main>
  )
}
