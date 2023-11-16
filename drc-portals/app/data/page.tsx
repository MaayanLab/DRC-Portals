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
    <main className="mt-24 text-center">
      <Grid container spacing={2} alignItems={"flex-start"} justifyContent={"center"}>
        <Grid item xs={12} className="flex align-center justify-center">
          <Typography variant="h2" sx={{fontSize: 30}}>Search Common Fund Programs' Metadata and Processed Datasets</Typography>
        </Grid>
        <Grid item xs={12} className="flex align-center justify-center">
          <TextField sx={{width: 704}} 
            placeholder='Try MCF7, STAT3, blood, enrichment analysis' 
            InputProps={{
              sx: {borderRadius: 1, height: 50},
              endAdornment: <InputAdornment position="end"><Icon path={mdiMagnify} size={1} /></InputAdornment>
            }}
          />
        </Grid>
        <Grid item xs={12} className="flex align-center justify-center space-x-5">
          <Button variant="outlined" color="secondary">Learn More</Button>
          <Button variant="contained" color="secondary">Search <Icon path={mdiArrowRight} size={1} className="ml-2" /></Button>
        </Grid>
        <Grid item xs={12} className="flex justify-center space-x-24">
          <div className="flex flex-col">
            <Typography variant="stats_h3">1,494,556</Typography>
            <Typography variant="stats_sub">Data Points</Typography>
          </div>
          <div className="flex flex-col">
            <Typography variant="stats_h3">1459</Typography>
            <Typography variant="stats_sub">Processed Data</Typography>
          </div>
          <div className="flex flex-col">
            <Typography variant="stats_h3">755</Typography>
            <Typography variant="stats_sub">Tools</Typography>
          </div>
        </Grid>
        <Grid item xs={12} sx={{marginTop: 15}}>
          <Typography variant="h2" color="primary">
            Query Harmonized Common Fund Data
          </Typography>
          <CFPrograms spacing={3}/>
        </Grid>
        {search_cards.map((e, i)=>(
          <Grid item key={i} sx={{marginTop: 15}}>
            <Card sx={{minHeight: 480, width: 400}} className="flex flex-col space-y-5">
              { e.img && 
                  <div className="flex flex-row justify-center mt-5"><Image className="grayscale" src={e.img} alt={e.title} width={350} height={300}/></div>
              } 
              <CardContent className="flex flex-col grow space-y-5 text-left">
                <Typography variant="h4">{e.title}</Typography>
                <Typography variant="caption">
                  {e.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Link href={e.link}><Button color="secondary">{e.button} <Icon path={mdiArrowRight} size={1} className="ml-2" /></Button></Link>
              </CardActions>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12} sx={{marginTop: 10}}>
          <Paper sx={{
                      boxShadow: "none", 
                      background: '#FAFAFA',
                      padding: 5, 
                      borderRadius: 0, 
                      width: "100vw", 
                      marginLeft: "calc((-100vw + 100%) / 2)", 
                      marginRight: "calc((-100vw + 100%) / 2)"}}>
            <Container maxWidth={"lg"}>
              <Grid container spacing={2} justifyContent={"space-between"} alignItems={"center"}>
                {tool_cards.map((e,i)=>(
                  <Grid item key={i}>
                    <Stack sx={{height: 200}} justifyContent={"space-around"} alignItems={"flex-start"}>
                      <Icon path={e.icon} size={1} className="ml-2" />
                      <div style={{textAlign: "left"}}>
                        <Typography variant="h4">{e.title}</Typography>
                        <Typography variant="caption">
                          {e.description}
                        </Typography>
                      </div>
                      <Button variant="contained" color="secondary">Search</Button>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Paper>
        </Grid>
        <Grid item>
          <Fab sx={{
            position: 'fixed',
            bottom: 50,
            right: 50,
          }} aria-label={'chat'} color={'secondary'}>
            <Icon path={mdiChatOutline} size={1} />
          </Fab>
        </Grid>
      </Grid>
    </main>
  )
}
