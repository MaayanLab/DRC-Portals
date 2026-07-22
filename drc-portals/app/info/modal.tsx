'use client'
import { mdiArrowRight } from '@mdi/js';
import Icon from '@mdi/react';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Button, Collapse, Paper, Typography } from '@mui/material';
import {Modal, Grid, Box} from '@mui/material';
import { Stack } from '@mui/system';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

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
export const Popup = () => {
	const searchParams = useSearchParams()
	const info = searchParams.get('info')
	const router = useRouter()
	const [selected, setSelected] = useState('');
	const handleClose = () => router.push("/");
	console.log(info)
	return (
    <div>
      <Modal
        open={info !== null}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{
			position: 'absolute',
			top: '50%',
			left: '50%',
			transform: 'translate(-50%, -50%)',
			background: 'linear-gradient(180deg, #FFFFFF 0%, #DBE0ED 100%);', 
			width: 900,
			padding: 1, 
			
		}}>
          <Grid container alignItems={"center"}>
			<Grid item xs={12}>
				<Paper elevation={0} sx={{background: "#a5b4db"}}>
				<Typography color="secondary" sx={{textAlign: "center"}} variant="h1"><b>The Five CFDE United Centers</b></Typography>
				</Paper>
			</Grid>
			{centers.map(center=>(
				<Grid  key={center.name} item xs={12}>
					<Grid container alignItems={"center"}>
						<Grid item xs={12} md={6}>
							<Button sx={{textAlign: "left"}} onClick={()=>selected === center.name ? setSelected("") : setSelected(center.name)} color="secondary" 
								startIcon={selected===center.name? <ExpandLess/> : <ExpandMore />}>
								<Stack>
								<Typography variant="h3"><b>{center.name}</b>:</Typography>
								<Typography variant="h5">{center.hero}</Typography>
								</Stack>
							</Button>
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
					</Grid>
					<Collapse in={selected===center.name} timeout="auto" unmountOnExit>
						<Box sx={{padding: 2}}>
							<Typography variant="body1">{center.blurb}</Typography>
							{center.name === "Data Resource Center" ? <Button color="secondary" href={center.link} startIcon={<Icon path={mdiArrowRight} size={1} />}>
								<Typography variant="body1">Go to {center.name} Portal</Typography>
							</Button>:
							<Button color="secondary" target="_blank" rel="noopener noreferrer" href={center.link} startIcon={<Icon path={mdiArrowRight} size={1} />}>
								<Typography variant="body1">Go to {center.name} Portal</Typography>
							</Button>
							}
						</Box>
					</Collapse>
				</Grid>
			))}
			
			
			{/* <Grid item xs={12} md={5}>
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
			</Grid> */}
		  </Grid>
        </Box>
      </Modal>
    </div>
  );
}