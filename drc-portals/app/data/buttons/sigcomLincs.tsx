import { fetchSigComLincsId } from "@/components/Chat/GeneSet/sigComLincs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { router_push } from "../enrichment/utils";
import { Button, Chip, Grid, ListItemButton, ListItemIcon } from "@mui/material";
import Icon from "@mdi/react";
import Image from "@/utils/image";
import { L2S2 } from "./l2s2like";
import { ListItemText } from "@mui/material";

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const SigComButtons = ({input}: {input: {entity: string, label: string, icon: string, values?: {[key: string]: string[]}}}) => {
	const router = useRouter()
	const [sigcomUrl, setSigComUrl] = useState('')
	const sigcom_lincs = async (input: {[key:string]: string[]}) => {
		if (input.gene_set) {
			const url = await fetchSigComLincsId(input.gene_set, [], false)
			setSigComUrl(url)
		} else if (input.up) {
			const url = await fetchSigComLincsId(input.up, input.down, true)
			setSigComUrl(url)
		}

	}

	useEffect(()=>{
		if (input.entity === 'gene_set') {
			sigcom_lincs(input.values || {})
		}
	},[])	

	const sigcom_button = sigcomUrl ? <Grid item key={input.label + "-sigcom"}>
				<Button 
					key={input.label + "-sigcom"}
					sx={{padding: "3px 15px"}} 
					variant="outlined" 
					color="secondary" 
					startIcon={<Image alt="sigcom" src="/img/lincs.png" width={15} height={15}/>}
					href={sigcomUrl}
					target="_blank" rel="noopener noreferrer"
				>
				{`Query ${input.label} gene set using SigCom-LINCS`}
			</Button></Grid>: null
	return  <ListItemButton sx={{ pl: 4 }}
				href={sigcomUrl}
				target="_blank" rel="noopener noreferrer"
			>
			<ListItemIcon>
				<Image alt="sigcom" src="/img/lincs.png" width={25} height={25}/>
			</ListItemIcon>
			<ListItemText primary={`Find mimicking and reversing signatures for ${input.label} gene set using SigCom-LINCS`}/>
		</ListItemButton>
}
