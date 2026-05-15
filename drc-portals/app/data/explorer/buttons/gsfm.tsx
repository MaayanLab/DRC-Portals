import Image from "@/utils/image"
import { Button, Grid, ListItemButton, ListItemIcon, ListItemText } from "@mui/material"
import trpc from '@/lib/trpc/client'

export const GSFMButton = ({input}: {input: {entity: string, label: string, icon: string, values?: {[key: string]: string[]}}}) => {
	if (input.entity !== "gene") return null
	// const gsfm= <Grid item key={input.label + "-gsfm"}>
	// 			<Button 
	// 				key={input.label + "-gsfm"}
	// 				sx={{padding: "3px 15px"}} 
	// 				variant="outlined" 
	// 				color="secondary" 
	// 				startIcon={<Image alt={'gsfm'} src={'/img/gsfm.png'} width={15} height={15}/>}
	// 				href={`https://gsfm.maayanlab.cloud/gene/${input.label}`}
	// 				target="_blank" rel="noopener noreferrer"
	// 			>
	// 			{`Get GSFM predictions for ${input.label}`}
	// 		</Button></Grid>
		return <ListItemButton sx={{ pl: 4 }}
				href={`https://gsfm.maayanlab.cloud/gene/${input.label}`}
				target="_blank" rel="noopener noreferrer"
			>
			<ListItemIcon>
				<Image alt={'gsfm'} src={'/img/gsfm.png'} width={25} height={25}/>
			</ListItemIcon>
			<ListItemText primary={`Get GSFM predictions for ${input.label}`}/>
		</ListItemButton>
}