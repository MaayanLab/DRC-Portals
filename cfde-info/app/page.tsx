import Image from "next/image"

import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'

import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'

import Icon from '@mdi/react';
import { mdiArrowRight, mdiYoutube, mdiBookOpenVariantOutline, mdiLink, mdiArrowUpRight, mdiArrowTopRight } from "@mdi/js"
import { Card, CardActionArea, CardContent, CardHeader } from "@mui/material"
import { Center } from "./center"

const centers = [
	{
		name: "Data Resource Center",
		hero: "Explore Harmonized Common Fund Datasets",
		blurb: "The CFDE Data Resource Center (DRC) hosts the CFDE Workbench, a comprehensive platform that provides harmonized metadata, processed data, and tools for data analysis across NIH Common Fund programs.",
		image: "/centers/DRC.png",
		link: "https://cfde.cloud",
		width: 400
	},
	{
		name: "Knowledge Center",
		hero: "Discover Knowledge Extracted from CFDE Datasets",
		blurb: "The CFDE Knowledge Center (KC) translates complex Common Fund data into highly curated biological insights using tailored visualizations to help researchers easily analyze genes, phenotypes, and pathways from across NIH Common Fund programs.",
		image: "/centers/KC.svg",
		link: "https://cfdeknowledge.org/r/kc_landing",
		width: 230
	},
	{
		name: "Cloud Workspace Implementation Center",
		hero: "Sign Up for Your Own CFDE Cloud Workspace",
		blurb: "The CFDE Cloud Workspace provides researchers with a free cloud computing platform that serves Galaxy to analyze and integrate large NIH Common Fund datasets using a variety of workflows.",
		image: "/centers/CWIC.png",
		link: "https://cfdeworkspace.org/",
		width: 400
	},
	{
		name: "Training Center",
		hero: "Acquire Skills in Using CFDE Datasets and Tools",
		blurb: "The CFDE Training Center is dedicated to expanding the user base of NIH Common Fund and CFDE resources by delivering educational and outreach activities such as workshops, competitions, hackathons, webinars, and podcasts.",
		image: "/centers/TC.svg",
		link: "https://orau.org/cfde-trainingcenter/",
		width: 300
	},
	{
		name: "Integration and Coordination Center",
		hero: "Learn How to Engage with the CFDE Consortium",
		blurb: "CFDE CONNECT is the Integration and Coordination Center (ICC) of the CFDE. The center is dedicated to organizing the CFDE consortium and for developing evaluation and sustainability methods for Common Fund programs and the CFDE.",
		image: "/centers/IC.png",
		link: "https://cfdeconnect.org/",
		width: 400
	}
]

export default async function Home() { 
  return (
    <main>
      <Grid container spacing={5} sx={{alignItems: "flex-start"}}>
        {/* <Grid size={12}>
          <Typography variant="body1" sx={{color: "white"}}>
            The Common Fund generates a diverse array of valuable data sets and knowledge resources intended for the research community. However, these resources are dispersed across multiple locations, making it challenging to navigate and utilize them efficiently. To address this, the Common Fund Data Ecosystem (CFDE) was established to facilitate the broad use of Common Fund data to drive discovery. The CFDE is structured around five centers that work collaboratively to integrate metadata, data, tools, and knowledge from participating Common Fund programs. These collective efforts enable researchers to generate hypotheses, make discoveries, and validate findings, leading to new insights into health and disease.
          </Typography>
        </Grid> */}
        <Grid size={12}>
          <Typography variant="h2" sx={{textAlign: "center"}}>
            The CFDE Centers
          </Typography>
        </Grid>
        <Grid size={12}>
          <Grid container spacing={1}>
            {centers.map(center=>(
              <Grid  key={center.name} size={{xs: 12, md: 6}} >
                <Card sx={{borderColor: "oklch(100% 0 0 / .12)", height: {xs: 600, md: 480}, display: "flex", flexDirection: "column"}}>
                  <CardHeader 
                    title={<Typography variant="h3">{center.name}</Typography>}
                    subheader={<Typography variant="body1">{center.hero}</Typography>}
                  />
                  <CardContent sx={{minHeight: 200, mt: 2, flexGrow: 1}}>
                    <Stack spacing={3} sx={{height: "100%", justifyContent: "space-around"}}>
                      <Button target="_blank" rel="noopener noreferrer" href={center.link}>
                        <Center {...center}/>
                      </Button>
                      <Typography variant="body2">{center.blurb}</Typography>
                      {/* <Button sx={{color: "oklch(85% .16 195)", mb: 2}} target="_blank" rel="noopener noreferrer" href={center.link} endIcon={<Icon path={mdiArrowTopRight} size={1} />}>
                        <Typography sx={{color: "oklch(85% .16 195)"}} variant="body2">Go to {center.name} Portal</Typography>
                      </Button> */}
                    </Stack>
                  </CardContent>
                  <CardActionArea>
                    <Button sx={{mb: 2}} target="_blank" rel="noopener noreferrer" href={center.link} endIcon={<Icon path={mdiArrowTopRight} size={1} />}>
                      <Typography variant="nav">Go to {center.name} Portal</Typography>
                    </Button>
                  </CardActionArea>
                </Card>
                {/* <Grid container sx={{alignItems: "center"}}>
                  <Grid>
                    
                    <Stack>
                    <Typography variant="h3" color="primary"><b>{center.name}</b></Typography>
                    <Typography variant="h5">{center.hero}</Typography>
                    </Stack>
                  </Grid>
                  <Grid size={{xs: 12, md: 6}}>
                    <Button color="secondary"  href={center.link} target="_blank" rel="noopener noreferrer" >
                      <Image src={center.image} alt="drc" width={center.width} height={200}/>
                    </Button>
                    
                  </Grid>
                  <Grid size={12}>
                    <Box>
                      <Typography variant="body1">{center.blurb}</Typography>
                      <Button color="secondary" target="_blank" rel="noopener noreferrer" href={center.link} startIcon={<Icon path={mdiArrowRight} size={1} />}>
                        <Typography variant="body1">Go to {center.name} Portal</Typography>
                      </Button>
                    </Box> 
                  </Grid>
                </Grid>*/}
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </main>
  )
}
