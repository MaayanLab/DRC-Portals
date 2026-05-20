import Image from "@/utils/image"
import { Avatar, Button, Card, CardHeader, Grid, IconButton, ListItemButton, ListItemIcon, ListItemText } from "@mui/material"
import trpc from '@/lib/trpc/client'
import { ArrowForward } from "@mui/icons-material"
import Icon from "@mdi/react"
import { useEffect, useState } from "react"
import { blueGrey } from "@mui/material/colors"
import { mdiMagnify } from "@mdi/js"

const gse_query = (userListId: number) => (
	JSON.stringify({
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
)

export const gse = ({label, values, entity, color=blueGrey[100], icon_color=blueGrey[900], icon=mdiMagnify}: {label: string, entity?:string, values?: {[key: string]: number}, color?: string, icon_color?: string, icon?:string}) => {
	const children:React.ReactNode[] = []
	for (const [k,v] of Object.entries(values || {})) {
				const dir = k.split("_")[0]
				const suffix = dir === "gene"? "": ` ${dir}`
				children.push((
					<Card sx={{height: '100%'}}>
						<CardHeader
							avatar={
								<Avatar sx={{backgroundColor: color}}><Icon style={{backgroundColor: "transparent", color: icon_color}} path={icon} size={1}/></Avatar>
							}
							action={
							<IconButton aria-label="goto"
								href={`/data/enrichment?q=${gse_query(v)}`}
							>
								<ArrowForward />
							</IconButton>
							}
							title={label+suffix}
							subheader={"Perform enrichment analysis on this gene set"}
						/>
					</Card>
				))
			}
	return children
}