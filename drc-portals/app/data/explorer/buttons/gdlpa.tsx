import Image from "@/utils/image"
import { Button, Grid, ListItemButton, ListItemIcon, ListItemText } from "@mui/material"

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

	return <ListItemButton sx={{ pl: 4 }}
				href={`https://cfde-gene-pages.cloud/${input.entity==='gene' ? "gene": "drug"}/${input.label}?CF=false&PS=true`}
				target="_blank" rel="noopener noreferrer"
			>
			<ListItemIcon>
				<Image alt={'gsfm'} src={'/img/gdlpa.png'} width={25} height={25}/>
			</ListItemIcon>
			<ListItemText primary={`View ${input.label} on GDLPA`}/>
		</ListItemButton>
}