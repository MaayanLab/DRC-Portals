import Image from "@/utils/image"
import { Avatar, Button, Card, CardHeader, Grid, IconButton, ListItemButton, ListItemIcon, ListItemText } from "@mui/material"
import trpc from '@/lib/trpc/client'
import { ArrowForward } from "@mui/icons-material"
import Icon from "@mdi/react"
import { blueGrey } from "@mui/material/colors"
import { mdiMagnify } from "@mdi/js"
import { ReactNode, useEffect, useState } from "react"

export const GSFM = ({label, values, entity, color=blueGrey[100], icon_color=blueGrey[900], icon=mdiMagnify}: {label: string, entity?:string, values?: {[key: string]: number}, color?: string, icon_color?: string, icon?:string}) => {
	const [clicked, setClicked] = useState('')
	const {data: gs, isLoading} = trpc.fetch_gene_set.useQuery([(values || {})[clicked]], {enabled: clicked !== ''})
	const dir = clicked.split("_")[0]
	const suffix = dir === "gene"? "": ` ${dir}`
	useEffect(()=>{
		const send_to_gsfm = async () => {
			if (gs && Array.isArray(gs) && gs.length > 0) {
				const gene_set = gs[0].genes
				if (gene_set.length > 5) {
					const res = await fetch(`https://gsfm.maayanlab.cloud/api/trpc/addList`, {
						method: 'POST',
						body: JSON.stringify({gene_set}),
						headers: {Accept: 'application/json', 'Content-Type': 'application/json'}
					})
					const result = await res.json()
					const id = result.result.data
					
					const url = `https://gsfm.maayanlab.cloud/enrich?model=gsfm-rummagene&description=${encodeURI(label+suffix)}&gene_set_id=${id}&gene_set_library_name=GO_Biological_Process_2025`
					window.open(url, '_blank');
				}
		
		}
		}
		if (!isLoading && gs) send_to_gsfm()
		
	}, [isLoading, gs])
	if (entity === "gene") {
		return (
			<Grid item xs={6} sm={4}>
				<Card sx={{height: '100%'}}>
					<CardHeader
						avatar={
							<Avatar sx={{backgroundColor: color}}><Icon style={{backgroundColor: "transparent", color: icon_color}} path={icon} size={1}/></Avatar>
						}
						action={
						<IconButton aria-label="goto"
							href={`https://gsfm.maayanlab.cloud/gene/${label}`}
							target="_blank" rel="noopener noreferrer"
						>
							<ArrowForward />
						</IconButton>
						}
						title={label}
						subheader={`View GSFM predictions for ${label}`}
					/>
				</Card>
			</Grid>
		)
	} else if (entity === 'gene_set') {
		
		const children:ReactNode[] = []
		for (const [k,v] of Object.entries(values || {})) {
			const dir = k.split("_")[0]
			const suffix = dir === "gene"? "": ` ${dir}`
			children.push((
				<Grid key={k} item xs={6} sm={4}>
					<Card sx={{height: '100%'}}>
						<CardHeader
							avatar={
								<Avatar sx={{backgroundColor: color}}><Icon style={{backgroundColor: "transparent", color: icon_color}} path={icon} size={1}/></Avatar>
							}
							action={
							<IconButton aria-label="goto"
								onClick={()=>setClicked(k)}
							>
								<ArrowForward />
							</IconButton>
							}
							title={label+suffix}
							subheader={`Perform enrichhment analysis for ${label}${dir !== "gene" ? " "+dir: ""} on GSFM`}
						/>
					</Card>
				</Grid>
			))
		}
		return children
	}
	
}