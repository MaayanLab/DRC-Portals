'use client'
import { Grid, Typography } from "@mui/material";
import {InteractiveNavComponent} from "cfde-wheel";
import { useEffect, useState } from "react";
export interface dccType {
	id: string
	label: string
	homepage: string
	icon: string
	description?: string 
}

const V2 = () => {
	const [dccs, setDccs] = useState<Array<dccType>>([])
	useEffect(()=>{
		const fetch_dccs = async () => {
			try {
				console.log("Fetching")
				const r = await fetch("https://raw.githubusercontent.com/MaayanLab/cfde-wheel/refs/heads/main/src/dccs.json")
				setDccs(await r.json())
			} catch (error) {
				setDccs([])
			}
			
		}
		fetch_dccs()
	}, [])
	return (
		<Grid container spacing={1} sx={{alignItems: "flex-start"}}>
			<Grid size={12}>
				<Typography variant="body1" sx={{ textAlign: "justify"}}>
					The Common Fund generates a diverse array of valuable data sets and knowledge resources intended for the research community. However, these resources are dispersed across multiple locations, making it challenging to navigate and utilize them efficiently. To address this, the Common Fund Data Ecosystem (CFDE) was established to facilitate the broad use of Common Fund data to drive discovery. The CFDE is structured around five centers that work collaboratively to integrate metadata, data, tools, and knowledge from participating Common Fund programs. These collective efforts enable researchers to generate hypotheses, make discoveries, and validate findings, leading to new insights into health and disease.
				</Typography>
			</Grid>
			<Grid size={12}>
				<InteractiveNavComponent dccs={dccs} center_tooltip={true}/>			
			</Grid>
		</Grid>
		
	)
	
}

export default V2