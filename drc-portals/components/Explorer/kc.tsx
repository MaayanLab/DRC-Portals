import Image from "@/utils/image"
import { Avatar, Button, Card, CardHeader, Grid, IconButton, ListItemButton, ListItemIcon, ListItemText } from "@mui/material"
import trpc from '@/lib/trpc/client'
import { ArrowForward } from "@mui/icons-material"
import Icon from "@mdi/react"
import { blue, blueGrey, green, red } from "@mui/material/colors"
import { mdiMagnify } from "@mdi/js"
import { ReactNode, useEffect, useState } from "react"

const gene_info = [
	{
		endpoint: (gene:string)=>`/kc_entity_gene?gene=${gene}`,
		description: (gene:string)=>`Explore ${gene} across CFDE programs`,
		color: green[100]
	},
	{
		endpoint: (gene:string)=>`/kc_gene_set_browser?model=cfde&gene=${gene}`,
		description: (gene:string)=>`Explore ${gene} phenotype associations`,
		color: blue[100]
	},
	{
		endpoint: (gene:string)=>`/kc_dge_gene?gene=${gene}`,
		description: (gene:string)=>`Explore ${gene} tissue associations`,
		color: red[100]
	}
]
export const KC = ({label, values, entity, color=blueGrey[100], icon_color=blueGrey[900], icon=mdiMagnify}: {label: string, entity?:string, values?: {[key: string]: number}, color?: string, icon_color?: string, icon?:string}) => {
	const children:ReactNode[] = []
		for (const {endpoint, color, description} of gene_info) {
			children.push((
				<Grid key={endpoint(label)} item xs={6} sm={4}>
					<Card sx={{height: '100%'}}>
						<CardHeader
							avatar={
								<Avatar sx={{backgroundColor: color}}><Icon style={{backgroundColor: "transparent", color: icon_color}} path={icon} size={1}/></Avatar>
							}
							action={
							<IconButton aria-label="goto"
								target="_blank" rel="noopener noreferrer"
								href={`https://cfdeknowledge.org/r${endpoint(label)}`}
							>
								<ArrowForward />
							</IconButton>
							}
							title={label}
							subheader={description(label)}
						/>
					</Card>
				</Grid>
			))
		}
		return children
	
}