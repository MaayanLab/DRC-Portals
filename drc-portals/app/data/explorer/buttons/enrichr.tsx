import { fetchSigComLincsId } from "@/components/Chat/GeneSet/sigComLincs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { router_push } from "../../enrichment/utils";
import { Button, Chip, Grid, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import Icon from "@mdi/react";
import Image from "@/utils/image";
import { L2S2 } from "./l2s2like";

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const EnrichrButtons = ({input}: {input: {entity: string, label: string, icon: string, values?: {[key: string]: string[]}}}) => {
	const router = useRouter()
	const [geneSetIds, setGeneSetIds] = useState<{[key:string]: {userListId?:string, shortId?:string}}>({})
	const addList = async (description:string, input: {[key:string]: string[]} ) => {
		try {
			const formData = new FormData();
			// const gene_list = geneStr.trim().split(/[\t\r\n;]+/).join("\n")
			for (const [k,v] of Object.entries(input)) {
				const gene_list = v.join("\n")	
				formData.append('list', gene_list)
				if (k === "gene_set") {
					formData.append('description', description)
				} else {
					formData.append('description', `${description} ${k}`)
				}
				const vals:{userListId:string, shortId:string} = await (
					await fetch(`${process.env.NEXT_PUBLIC_ENRICHR_URL}/addList`, {
						method: 'POST',
						body: formData,
					})
				).json()
				setGeneSetIds({...geneSetIds, [k === "gene_set" ? description: `${description} ${k}`]: vals})
				await sleep(300)

			}
		} catch (error) {
			console.error(error)
		}
	}
	useEffect(()=>{
		setGeneSetIds({})
		if (input.entity === 'gene_set') {
			addList(input.label, input.values || {})
		}
	},[])	

const enrichr = Object.entries(geneSetIds).map(([label, {shortId}])=> (
			<ListItemButton sx={{ pl: 4 }}
					href={`https://maayanlab.cloud/Enrichr/enrich?dataset=${shortId}`}
					target="_blank" rel="noopener noreferrer"
					key={label + "-Enrichr"}
				>
				<ListItemIcon>
					<Image alt="sigcom" src="/img/enrichr.png" width={25} height={25}/>
				</ListItemIcon>
				<ListItemText primary={`Perform Enrichment on ${label} using Enrichr`}/>
			</ListItemButton>	
	))
	return enrichr
}
