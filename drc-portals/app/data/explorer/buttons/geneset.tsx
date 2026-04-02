import { fetchSigComLincsId } from "@/components/Chat/GeneSet/sigComLincs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { router_push } from "../../enrichment/utils";
import { Button, Chip, Grid } from "@mui/material";
import Icon from "@mdi/react";
import Image from "@/utils/image";
import { L2S2 } from "./l2s2like";

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const GeneSetButtons = ({input}: {input: {entity: string, label: string, icon: string, values?: {[key: string]: string[]}}}) => {
	const router = useRouter()
	const [geneSetIds, setGeneSetIds] = useState<{[key:string]: {userListId?:string, shortId?:string}}>({})
	const [sigcomUrl, setSigComUrl] = useState('')
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
		setGeneSetIds({})
		if (input.entity === 'gene_set') {
			addList(input.label, input.values || {})
			sigcom_lincs(input.values || {})
		}
	},[input])	

	const sendToGSE = (userListId: string) => {
		router_push(router, '/data/enrichment', {
			q: JSON.stringify({
				userListId: `${userListId}`,
				search: true,
				min_lib: 1,
				libraries: [
					{
						"name": "GTEx_Aging_Signatures_2021",
						"limit": 5
					},
					{
						"name": "GTEx_Tissues_V8_2023",
						"limit": 5
					},
					{
						"name": "GlyGen_Glycosylated_Proteins_2022",
						"limit": 5
					},
					{
						"name": "HuBMAP_ASCTplusB_augmented_2022",
						"limit": 5
					},
					{
						"name": "IDG_Drug_Targets_2022",
						"limit": 5
					},
					{
						"name": "KOMP2_Mouse_Phenotypes_2022",
						"limit": 5
					},
					{
						"name": "LINCS_L1000_CRISPR_KO_Consensus_Sigs",
						"limit": 5
					},
					{
						"name": "LINCS_L1000_Chem_Pert_Consensus_Sigs",
						"limit": 5
					},
					{
						"name": "Metabolomics_Workbench_Metabolites_2022",
						"limit": 5
					},
					{
						"name": "MoTrPAC_2023",
						"limit": 5
					}
				]
			})
		})
	}

	const gse = Object.entries(geneSetIds).map(([label, {userListId, shortId}])=> (
			<Grid item key={label + "-GSE"}><Chip sx={{borderRadius: 0}} key={label + "-GSE"} color='secondary' variant="outlined"
				avatar={<Icon style={{backgroundColor: "transparent", color: "#2D5986"}} path={input.icon} size={1}/>}
				onClick={()=>{
					if (userListId) sendToGSE(userListId)
				}}
				label={`Perform Enrichment on ${label} using CFDE Gene Sets`}
				// onDelete={()=>update_input(i.entity, i.label, 'remove')}
				// disabled={loadingIndex!==-1}
			/></Grid>))	
	const enrichr = Object.entries(geneSetIds).map(([label, {userListId, shortId}])=> (
			<Grid item key={label + "-Enrichr"}>
				<Button 
					key={label + "-Enrichr"}
					sx={{padding: "3px 15px"}} 
					variant="outlined" 
					color="secondary" 
					startIcon={<Image alt="sigcom" src="/img/enrichr.png" width={25} height={25}/>}
					href={`https://maayanlab.cloud/Enrichr/enrich?dataset=${shortId}`}
					target="_blank" rel="noopener noreferrer"
				>
				{`Perform Enrichment on ${label} using Enrichr`}
			</Button></Grid>
	))
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
	const l2s2 = <L2S2 input={input}/>
	return [...gse, ...enrichr, sigcom_button, l2s2]
}
