import Image from "@/utils/image"
import { Avatar, Button, Card, CardHeader, Grid, IconButton, ListItemButton, ListItemIcon, ListItemText } from "@mui/material"
import trpc from '@/lib/trpc/client'
import { ArrowForward } from "@mui/icons-material"
import Icon from "@mdi/react"
import { useEffect, useState } from "react"

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

export const PWBButton = ({input}: {input: {entity: string, label: string, icon: string, icon_color: string, color: string, values?: {[key: string]: number}}}) => {
	
	const gs_values: {[key:string]: string[]} = {}
	if (input.entity === "gene_set") {
			if (input.values?.gene_set_id) {
				const gs = trpc.fetch_gene_set.useQuery([input.values.gene_set_id])
				if (Array.isArray(gs.data)) gs_values['gene_set'] = gs.data[0].genes
			} else if (input.values?.up_gene_set_id) {
				const gs = trpc.fetch_gene_set.useQuery([input.values.up_gene_set_id, input.values.down_gene_set_id])
				if (Array.isArray(gs.data)) {
					gs_values['up_gene_set'] = gs.data[0].genes
					gs_values['down_gene_set'] = gs.data[1].genes
				}
			}
		}
	const resolve_link = async () => {
		
		const body = input.entity === "gene_set" ? Input[input.entity](input.label, gs_values):Input[input.entity](input.label)
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
	return <Grid item xs={6} sm={4} key={input.label}>
		<Card key={input.label} sx={{height: '100%'}}>
			<CardHeader
				avatar={
					<Avatar sx={{backgroundColor: input.color}}><Icon style={{backgroundColor: "transparent", color: input.icon_color}} path={input.icon} size={1}/></Avatar>
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
				title={input.label}
				subheader={`Create Applications analyzing ${input.label}`}
			/>
		</Card>
	</Grid>
}