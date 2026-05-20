import Image from "@/utils/image"
import { Avatar, Button, Card, CardHeader, Grid, IconButton, ListItemButton, ListItemIcon, ListItemText } from "@mui/material"
import trpc from '@/lib/trpc/client'
import { ArrowForward } from "@mui/icons-material"
import Icon from "@mdi/react"
import { useEffect, useState } from "react"
import { blueGrey } from "@mui/material/colors"
import { mdiMagnify } from "@mdi/js"

const Input: {[key:string]: Function} = {
	gene: (value:string) => ({
		data: { gene: { type: "Input[Gene]", value} },
		workflow: [
			{ id: "input_gene", type: "Input[Gene]", data: { id: "gene" } },
		],
	}),
	variant: (value:string) => ({
		data: { variant: { type: "Input[Variant]", value} },
		workflow: [
			{ id: "input_variant", type: "Input[Variant]", data: { id: "variant" } },
		],
	}),
	disease: (value:string) => ({
		data: { disease: { type: "Input[Disease]", value} },
		workflow: [
			{ id: "input_disease", type: "Input[Disease]", data: { id: "disease" } },
		],
	}),
	drug: (value:string) => ({
		data: { drug: { type: "Input[Drug]", value} },
		workflow: [
			{ id: "input_drug", type: "Input[Drug]", data: { id: "drug" } },
		],
	}),
	metabolite: (value:string) => ({
		data: { metabolite: { type: "Input[Metabolite]", value} },
		workflow: [
			{ id: "input_metabolite", type: "Input[Metabolite]", data: { id: "metabolite" } },
		],
	}),
	anatomy: (value:string) => ({
		data: { anatomy: { type: "Input[Tissue]", value} },
		workflow: [
			{ id: "input_anatomy", type: "Input[Tissue]", data: { id: "anatomy" } },
		],
	}),
	gene_set: (label: string, values: {[key: string]: string[]}) => {
		if (values.gene_set) {
			return {
				data: { gene_set: { type: "Input[Set[Gene]]", value: { set: values.gene_set, description: label } }},
				workflow: [
					{ id: "input_gene_set", type: "Input[Set[Gene]]", data: { id: "gene_set" } },
				],
			}
		} else {
			return {
					data: { up_gene_set: { type: "Input[Set[Gene]]", value: { set: values.up_gene_set, description: `${label} up` } },
					dn_gene_set: { type: "Input[Set[Gene]]", value: { set: values.down_gene_set, description:  `${label} dn` } }
					},
					workflow: [
						{ id: "input_up_gene_set", type: "Input[Set[Gene]]", data: { id: "up_gene_set" } },
						{ id: "input_dn_gene_set", type: "Input[Set[Gene]]", data: { id: "dn_gene_set" } },
					],
				}
		}		
	},
}

export const pwb = ({label, values, entity, color=blueGrey[100], icon_color=blueGrey[900], icon=mdiMagnify}: {label: string, entity?:string, values?: {[key: string]: number}, color?: string, icon_color?: string, icon?:string}) => {
	const gs_values: {[key:string]: string[]} = {}
	if (entity === "gene_set") {
			if (values?.gene_set_id) {
				const gs = trpc.fetch_gene_set.useQuery([values.gene_set_id])
				if (Array.isArray(gs.data)) gs_values['gene_set'] = gs.data[0].genes
			} else if (values?.up_gene_set_id) {
				const gs = trpc.fetch_gene_set.useQuery([values.up_gene_set_id, values.down_gene_set_id])
				if (Array.isArray(gs.data)) {
					gs_values['up_gene_set'] = gs.data[0].genes
					gs_values['down_gene_set'] = gs.data[1].genes
				}
			}
		}
	const resolve_link = async () => {
		
		const body = entity === "gene_set" ? Input[entity](label, gs_values):Input[entity||''](label)
		console.log(body, gs_values)
		const req = await fetch('https://playbook-workflow-builder.cloud/api/db/fpl', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
			body: JSON.stringify(body),
			})
		const res = await req.json()
		return `https://playbook-workflow-builder.cloud/graph/${res}`


	}
	// if (link === '') return null
	return <Card key={label} sx={{height: '100%'}}>
			<CardHeader
				avatar={
					<Avatar sx={{backgroundColor: color}}><Icon style={{backgroundColor: "transparent", color: icon_color}} path={icon} size={1}/></Avatar>
				}
				action={
				<IconButton aria-label="goto"
					onClick={async () => {
						const link = await resolve_link()
						window.open(link, '_blank')
					}}
				>
					<ArrowForward />
				</IconButton>
				}
				title={label}
				subheader={`Build workflows starting with the ${entity?.replace("_", " ")} ${label}`}
			/>
		</Card>
}