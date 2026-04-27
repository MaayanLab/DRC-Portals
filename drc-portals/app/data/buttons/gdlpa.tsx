import Image from "@/utils/image"
import Icon from "@mdi/react"
import { ArrowForward } from "@mui/icons-material"
import { Button, Card, CardHeader, Grid, IconButton, ListItemButton, ListItemIcon, ListItemText } from "@mui/material"

export const GDLPAButton = ({input}: {input: {entity: string, label: string, icon: string, values?: {[key: string]: string[]}}}) => {
	if (input.entity !== "compound" && input.entity !== "gene") return null
	// const gdlpa= <Grid item key={input.label + "-gdlpa"}>
	// 			<Button 
	// 				key={input.label + "-gdlpa"}
	// 				sx={{padding: "3px 15px"}} 
	// 				variant="outlined" 
	// 				color="secondary" 
	// 				startIcon={<Image alt={'gdlpa'} src={'/img/gdlpa.png'} width={15} height={15}/>}
	// 				href={`https://cfde-gene-pages.cloud/${input.entity==='gene' ? "gene": "drug"}/${input.label}?CF=false&PS=true`}
	// 				target="_blank" rel="noopener noreferrer"
	// 			>
	// 			{`View ${input.label} on GDLPA`}
	// 		</Button></Grid>
	return <Grid item xs={6} sm={4} key={input.label}>
		<Card key={input.label} sx={{height: '100%'}}>
			<CardHeader
				avatar={
					<Icon style={{backgroundColor: "transparent", color: "#2D5986"}} path={input.icon} size={1}/>
				}
				action={
				<IconButton aria-label="goto"
					href={`https://cfde-gene-pages.cloud/${input.entity==='gene' ? "gene": "drug"}/${input.label}?CF=false&PS=true`}
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