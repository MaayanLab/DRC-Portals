import Image from "@/utils/image"
import { Button, Card, CardHeader, Grid, IconButton, ListItemButton, ListItemIcon, ListItemText } from "@mui/material"
import trpc from '@/lib/trpc/client'
import { ArrowForward } from "@mui/icons-material"
import Icon from "@mdi/react"

export const GSFMButton = ({input}: {input: {entity: string, label: string, icon: string, values?: {[key: string]: string[]}}}) => {
	if (input.entity !== "gene") return null
	return <Grid item xs={6} sm={4} key={input.label}>
		<Card key={input.label} sx={{height: '100%'}}>
			<CardHeader
				avatar={
					<Icon style={{backgroundColor: "transparent", color: "#2D5986"}} path={input.icon} size={1}/>
				}
				action={
				<IconButton aria-label="goto"
					href={`https://gsfm.maayanlab.cloud/gene/${input.label}`}
					target="_blank" rel="noopener noreferrer"
				>
					<ArrowForward />
				</IconButton>
				}
				title={input.label}
				// subheader={`Search CFDE Workbench ${i.entity.replaceAll("_", " ")} entities`}
			/>
		</Card>
	</Grid>
}