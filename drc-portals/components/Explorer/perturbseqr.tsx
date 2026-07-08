import Image from "@/utils/image"
import { Avatar, Button, Card, CardHeader, Grid, IconButton, ListItemButton, ListItemIcon, ListItemText } from "@mui/material"
import trpc from '@/lib/trpc/client'
import { ArrowForward } from "@mui/icons-material"
import Icon from "@mdi/react"
import { blueGrey } from "@mui/material/colors"
import { mdiMagnify } from "@mdi/js"
import { ReactNode, useEffect, useState } from "react"
const url = 'https://perturbseqr.maayanlab.cloud/'
const perturbseqr_resolve_id = async (gene_set: string[], label: string) => {
	const query = {
			"operationName":"AddUserGeneSet",
			"query":"mutation AddUserGeneSet($genes: [String], $description: String = \"\") {\n  addUserGeneSet(input: {genes: $genes, description: $description}) {\n    userGeneSet {\n      id\n      __typename\n    }\n    __typename\n  }\n}\n",
			"variables": {
				"description": label,
				"genes": gene_set
			}
		}
	const res = await fetch(url + 'graphql', {
		method: "POST",
		headers: {
		  "Content-Type": "application/json",
		},
		body: JSON.stringify(query),
	})
	if (!res.ok) return null
	const results = await res.json()
	return results.data.addUserGeneSet.userGeneSet.id
}

export const PerturbSeqr = ({label, values, entity, color=blueGrey[100], icon_color=blueGrey[900], icon=mdiMagnify}: {label: string, entity?:string, values?: {[key: string]: number}, color?: string, icon_color?: string, icon?:string}) => {
	const [clicked, setClicked] = useState('')
	const gs_values: {[key:string]: string[]} = {}
	const input = values?.gene_set_id ? [values.gene_set_id]: (values?.up_gene_set_id && values?.dn_gene_set_id) ? [values.up_gene_set_id, values.down_gene_set_id]: []
	const gs = trpc.fetch_gene_set.useQuery(input, {enabled: input.length>0})
	if (values?.gene_set_id) {
		if (Array.isArray(gs.data)) gs_values['gene_set'] = gs.data[0].genes
	} else if (values?.up_gene_set_id) {
		if (Array.isArray(gs.data)) {
			gs_values['up_gene_set'] = gs.data[0].genes
			gs_values['down_gene_set'] = gs.data[1].genes
		}
	}
	const perturb_seqr_link = async () => {
		if (gs_values.gene_set) {
			const uid = await perturbseqr_resolve_id(gs_values.gene_set, label)
			const u = `${url}enrich?dataset=${uid}`
			window.open(u, '_blank');
		} else {
			const up = await perturbseqr_resolve_id(gs_values.up_gene_set, label+ " up")
			const down = await perturbseqr_resolve_id(gs_values.down_gene_set, label+ " down")
			const u = `${url}enrichpair?dataset=${up}&dataset=${down}`
			window.open(u, '_blank');
		}
	}
		
		return <Grid item xs={6} sm={4}>
					<Card sx={{height: '100%'}}>
						<CardHeader
							avatar={
								<Avatar sx={{backgroundColor: color}}><Icon style={{backgroundColor: "transparent", color: icon_color}} path={icon} size={1}/></Avatar>
							}
							action={
							<IconButton aria-label="goto"
								onClick={()=>perturb_seqr_link()}
							>
								<ArrowForward />
							</IconButton>
							}
							title={label}
							subheader={"Find perturbagens that up or down regulate the expression of this gene set"}
						/>
					</Card>
				</Grid>
	
}