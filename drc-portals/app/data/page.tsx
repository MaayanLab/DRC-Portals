import Link from "next/link"
import Image from "next/image"
import { PrismaClient } from "@prisma/client"

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Divider from '@mui/material/Divider'
import InputAdornment from '@mui/material/InputAdornment'
import Icon from '@mdi/react';
import Fab from '@mui/material/Fab';
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import { mdiMagnify, mdiArrowRight, mdiToolbox, mdiLaptop, mdiChatOutline } from '@mdi/js';

import CFPrograms from "@/components/misc/CFPrograms"

const search_cards = [
  {
    "title": "Metadata Search",
    "description": "Find relevant common fund data by entering your research topic",
    "button": "Search Metadata",
    "img": "/img/metadata.png",
    "link": "/data/metadata"
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
    "icon": mdiToolbox
  },
  {
    "title": "Use Cases",
    "description": "Explore use cases specifically designed to use multiple Common Fund DCCs.",
    "icon": mdiLaptop
  }
]

export default async function Home() {
  return (
    <main className="text-center">
      <Grid container alignItems={"flex-start"} justifyContent={"center"}>
        <Grid item xs={12}>
          <Paper sx={{
                          boxShadow: "none", 
                          background: 'linear-gradient(to right top, #A5B4DB, #FFF, #A5B4DB)',
                          padding: 5, 
                          width: "100vw", 
                          height: "30vw",
                          marginLeft: "calc((-100vw + 100%) / 2)", 
                          marginRight: "calc((-100vw + 100%) / 2)"}}
                  className="flex"
            >
              <Container maxWidth="lg" className="m-auto">
                <Grid container spacing={2} alignItems={"center"}>
                  <Grid item xs={12} md={5}>
                    <Stack spacing={2} justifyContent={"flex-start"}>
                      <Typography color="secondary" className="text-left" variant="h2">COMMON FUND DATA RESOURCE PORTAL</Typography>
                      <Typography color="secondary" className="text-left" variant="body1">Search Common Fund Programs' Metadata and Processed Datasets.</Typography>
                      <TextField sx={{width: 477}} 
                        placeholder='Try MCF7, STAT3, blood, enrichment analysis' 
                        InputProps={{
                          sx: {borderRadius: 25, height: 50, fontSize: 16},
                          endAdornment: <InputAdornment position="end"><Icon path={mdiMagnify} size={1} /></InputAdornment>
                        }}
                      />
                      <div className="flex align-center space-x-10">
                        <Button variant="outlined" color="secondary">Learn More</Button>
                        <Button variant="contained" color="primary" endIcon={<Icon path={mdiArrowRight} size={1}/>}>Search</Button>
                      </div>
                    </Stack>    
                  </Grid>
                  <Grid item xs={12} md={7} className="align-center">
                    <Stack spacing={2} justifyContent={"flex-start"}>
                      <div className="flex flex-col">
                        <Typography variant="h2" color="secondary">1,494,556</Typography>
                        <Typography variant="subtitle1" color="secondary">FILES</Typography>
                      </div>
                      <div className="flex flex-col">
                        <Typography variant="h2" color="secondary">1459</Typography>
                        <Typography variant="subtitle1" color="secondary">GENE SETS</Typography>
                      </div>
                      <div className="flex flex-col">
                        <Typography variant="h2" color="secondary">755</Typography>
                        <Typography variant="subtitle1" color="secondary">ASSERTIONS</Typography>
                      </div>
                    </Stack>
                  </Grid>
                </Grid>
              </Container>
          </Paper>
        </Grid>
        <Grid item xs={12} sx={{marginTop: 10, textAlign: "center"}}>
          <Container maxWidth="md">
            <Typography variant="h2" color="secondary">
              Query Common Fund programs partnered with the CFDE
            </Typography>
            <Typography variant="subtitle1" color="secondary">
              The NIH Common Fund is a funding entity within the NIH that supports bold scientific programs that catalyze discovery across all biomedical and behavioral research.
            </Typography>
          </Container>
        </Grid>
        <Grid item xs={12} sx={{marginTop: 5}}><CFPrograms spacing={2}/></Grid>
        <Grid item xs={12}  sx={{marginTop: 15}}>
          <Paper sx={{
                          boxShadow: "none", 
                          background: '#7187c3',
                          padding: 5, 
                          width: "100vw", 
                          height: "50vw",
                          marginLeft: "calc((-100vw + 100%) / 2)", 
                          marginRight: "calc((-100vw + 100%) / 2)",
                          color: "#fff",
                        }}
                  className="flex"
            >
              <Container maxWidth="lg" className="m-auto">
                <Grid container spacing={5} alignItems={"center"} justifyContent={"center"}>
                  <Grid item xs={12}>
                    <Container maxWidth="sm">
                      <Typography variant="h2">Metadata and Processed Data</Typography>
                      <Typography variant="body1">Efficiently locate datasets based on specific attributes and conduct in-depth analyses, driving forward groundbreaking research endeavors.</Typography>
                    </Container>
                  </Grid>
                  {search_cards.map((e, i)=>(
                    <Grid item key={i}>
                      <Card sx={{minHeight: 480, width: 400, paddingLeft: 2, paddingRight: 2}} className="flex flex-col space-y-5">
                        { e.img && 
                            <div className="flex flex-row justify-center relative" style={{minHeight: 300}}><Image className="grayscale" src={e.img} alt={e.title} fill={true} style={{objectFit: "contain"}}/></div>
                        } 
                        <Divider sx={{borderColor: "#7187C3"}}/>
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
                      background: 'linear-gradient(to left top, #A5B4DB, #FFF, #A5B4DB)',
                      padding: 5,
                      paddingBottom: 15, 
                      borderRadius: 0, 
                      width: "100vw", 
                      marginLeft: "calc((-100vw + 100%) / 2)", 
                      marginRight: "calc((-100vw + 100%) / 2)"}}>
            <Container maxWidth={"lg"}  sx={{marginTop: 10}}>
              <Grid container spacing={2} justifyContent={"space-between"} alignItems={"center"}>
                <Grid item xs={12}>
                  <Card sx={{minHeight: 300, width: 400, paddingLeft: 2, paddingRight: 2, textAlign: "left"}}>
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

                      <div><Button variant="contained" color="tertiary" endIcon={<Icon path={mdiArrowRight} size={1}/>}>CF TOOLS</Button></div>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} className="flex justify-end" sx={{textAlign: "right"}}>
                    <div className="flex flex-col" style={{height: 200, width: 400}}>
                      <div className="flex flex-col grow">
                        <div className="flex justify-end"><Icon path={mdiLaptop} size={1} className="ml-2 mb-2" /></div>
                        <Typography variant="h2" sx={{fontWeight: 400}} color="secondary">
                          USE CASES
                        </Typography>
                        <Typography variant="body2" color="secondary" sx={{marginTop: 2}}>
                          Find the right tool for your analysis from the hundreds of CF Tools
                        </Typography>
                      </div>
                      <div><Button variant="contained" color="primary" endIcon={<Icon path={mdiArrowRight} size={1}/>}>Use Cases</Button></div>
                    </div>
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
