import Link from "@/utils/link"
import Image from "@/utils/image"

import Grid from '@mui/material/Grid'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'

import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'

import Carousel from '@/components/misc/Carousel/ServerCarousel'
import Twitter from '@/components/misc/Twitter'
import CFPrograms from "@/components/misc/CFPrograms"
import Icon from '@mdi/react';
import { mdiArrowRight, mdiYoutube, mdiBookOpenVariantOutline, mdiLink } from "@mdi/js"
import { BlurSmall } from "@/components/styled/Blur"
import prisma from "@/lib/prisma"
import SimplePublicationComponent from "@/components/misc/Publication/SimplePublicationComponent"
import { ResponsivePaper } from "./styled"
// import CFDEWheel from "cfde-wheel"
import { Collapse, Tooltip } from "@mui/material"
import { Popup } from "./modal"

const centers = [
	{
		name: "Data Resource Center",
		hero: "Explore Harmonized Common Fund Datasets",
		blurb: "The CFDE Data Resource Center (DRC) hosts the CFDE Workbench, a comprehensive platform that provides harmonized metadata, processed data, and tools for data analysis across NIH Common Fund programs.",
		image: "/centers/DRC.png",
		link: "/",
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
  const publications = await prisma.publication.findMany({
    orderBy: {
      year: "desc"
    },
    take: 9
  })

  return (
    <main>
      <Grid container spacing={2} alignItems={"flex-start"}>
        <Grid item xs={12}>
          <Stack spacing={1} sx={{mt: 2}}>
          {/* <Typography variant="h1" color="secondary" sx={{textAlign: "center"}}>
            The Common Fund Data Ecosystem
          </Typography> */}
          <Typography variant="body1">
            The Common Fund generates a diverse array of valuable data sets and knowledge resources intended for the research community. However, these resources are dispersed across multiple locations, making it challenging to navigate and utilize them efficiently. To address this, the Common Fund Data Ecosystem (CFDE) was established to facilitate the broad use of Common Fund data to drive discovery.
          </Typography>
          <Typography variant="body1">
            The CFDE is structured around five centers that work collaboratively to integrate metadata, data, tools, and knowledge from participating Common Fund programs. These collective efforts enable researchers to generate hypotheses, make discoveries, and validate findings, leading to new insights into health and disease.
          </Typography>
          </Stack>
        </Grid>
        {centers.map(center=>(
          <Grid  key={center.name} item xs={12}>
            <Grid container alignItems={"center"}>
              <Grid item xs={12} md={6}>
                <Stack>
                <Typography variant="h3"><b>{center.name}</b>:</Typography>
                <Typography variant="h5">{center.hero}</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                {center.name === "Data Resource Center" ? <Button color="secondary"  href={center.link}>
                  <Image src={center.image} alt="drc" width={center.width} height={200}/>
                </Button>:
                <Button color="secondary"  href={center.link} target="_blank" rel="noopener noreferrer" >
                  <Image src={center.image} alt="drc" width={center.width} height={200}/>
                </Button>
                }
              </Grid>
              <Grid item xs={12}>
                <Box>
                  <Typography variant="body1">{center.blurb}</Typography>
                  {center.name === "Data Resource Center" ? <Button color="secondary" href={center.link} startIcon={<Icon path={mdiArrowRight} size={1} />}>
                    <Typography variant="body1">Go to {center.name} Portal</Typography>
                  </Button>:
                  <Button color="secondary" target="_blank" rel="noopener noreferrer" href={center.link} startIcon={<Icon path={mdiArrowRight} size={1} />}>
                    <Typography variant="body1">Go to {center.name} Portal</Typography>
                  </Button>
                  }
                </Box>
              </Grid>
            </Grid>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Typography variant="h2" color="secondary" sx={{textAlign: "center", mb: 5, mt: 5}}>
            Engage with the CFDE Community
          </Typography>
        </Grid>
        <Grid item md={6} xs={12}>
          {/* <Typography sx={{color: "#FFF", backgroundColor: "tertiary.main", textAlign: "center", width: 300}}variant="subtitle1">ENGAGE WITH THE CFDE COMMUNITY</Typography> */}
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
      </Grid>
    </main>
  )
}
