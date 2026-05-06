import Image from "@/utils/image"
import { Avatar, Button, Card, CardHeader, Grid, IconButton, ListItemButton, ListItemIcon, ListItemText } from "@mui/material"
import trpc from '@/lib/trpc/client'
import { ArrowForward } from "@mui/icons-material"
import Icon from "@mdi/react"

export const GSFMButton = ({input}: {input: {entity: string, label: string, icon: string, icon_color: string, color: string}}) => {
	if (input.entity !== "gene") return null
	return <Grid item xs={6} sm={4} key={input.label}>
		<Card key={input.label} sx={{height: '100%'}}>
			<CardHeader
				avatar={
					<Avatar sx={{backgroundColor: input.color}}><Icon style={{backgroundColor: "transparent", color: input.icon_color}} path={input.icon} size={1}/></Avatar>
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
				subheader={`View functional predictions for ${input.label}`}
			/>
		</Card>
	</Grid>
}