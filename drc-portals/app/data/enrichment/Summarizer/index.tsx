import React from 'react'
import { makeTemplate, precise } from '../helper';
import Box from '@mui/material/Box';

import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import ClientSummarizer from './Client';
import schema from '../schema.json'
import { NetworkSchema } from '../types';
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "60%",
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };
function capitalize(string:string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function lowerFirst(string: string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}

export const Summarizer = ({elements, augmented}: {elements: NetworkSchema | null, augmented?: boolean}) => {
	const templates:{[key:string]: {singular?: string, multiple?: string}} = {}
	for (const i of schema.edges){
		const template = i.templates
		for (const j of i.match) {
			const edge = i.edge_suffix ? j + " " + i.edge_suffix: j
			templates[edge] = template
		}
	}
    const node_type: {[key: string]: string} = {}
	const resource_relations: {[key: string]: {[key: string]: {
		relation?: string,
		gene?: string,
		gene_1_list?: string[],
		gene_1?: string,
		gene_2_list?: string[],
		gene_2?: string,
		gene_list?: string[],
		genes?: string,
		term?: string,
		pval?: number
	}}} = {}
	const node_label: {[key:string]: string} = {}
		
	if (elements) {
		for (const i of elements.nodes) {
			if (i.data.kind !== "Relation") {
				node_type[i.data.id] = i.data.kind
				node_label[i.data.id] = `${i.data.label}${i.data.pval?" (pval: " + precise(i.data.pval) + ")": ""}`
			}
		}
		for (const i of elements.edges) {
			if (i.data.kind === "Relation") {
				const source = i.data.source
				const relation = i.data.relation
				const target = i.data.target
				// figure out if term-gene, gene-term, or gene_1-gene_2 relationship
				const source_type = (node_type[source] !== "Gene" && node_type[source] !== "Predicted Gene (Co-Expression)") ? "term": (node_type[target] !== "Gene" && node_type[target] !== "Predicted Gene (Co-Expression)") ? "gene": "gene_1"
				const target_type = (node_type[target] !== "Gene" && node_type[target] !== "Predicted Gene (Co-Expression)") ? "term": (node_type[source] !== "Gene" && node_type[source] !== "Predicted Gene (Co-Expression)") ? "gene": "gene_2"
				const resource = `${i.data.resource}` || `${relation} associations`
				const source_label = node_label[i.data.source]
				const target_label =node_label[i.data.target]
				
				if (resource_relations[resource] === undefined) resource_relations[resource] = {}
				const data = {
					[source_type]: source_label,
					[target_type]: target_label,
					relation
				}
				if (data.term) {
					if (resource_relations[resource][data.term] === undefined) resource_relations[resource][data.term] = data
					else {
						const {gene, gene_list=[], ...rest} = resource_relations[resource][data.term]
						if (gene) gene_list.push(gene)
						if (data.gene && gene_list.indexOf(data.gene) === -1) {
							resource_relations[resource][data.term] = {...rest, gene_list: [...gene_list, data.gene]}
						} else {
							resource_relations[resource][data.term] = data
						}
						
					}
				} else if (data.gene_1) {
					if (resource_relations[resource][data.gene_1] === undefined) resource_relations[resource][data.gene_1] = data
					else {
						const {gene_2, gene_2_list, ...rest} = resource_relations[resource][data.gene_1]
						if (data.gene_2 && gene_2_list && gene_2_list.indexOf(data.gene_2) === -1) {
							// rest["gene_2"] = [...gene_2, data.gene_2]
							resource_relations[resource][data.gene_1] = {...rest, gene_2_list: [...gene_2_list, data.gene_2]}
						} else {
							resource_relations[resource][data.gene_1] = data
						}
					}
				}
			}
		}
	}
	
	let summary = `The ${augmented ? "augmented ": ""}subnetwork shows the following associations: `
	for (const [resource, relationships] of Object.entries(resource_relations)) {
		summary = `${summary}From ${resource}: `
		for (const i in Object.values(relationships)) {
			const index = parseInt(i)
			const {relation='', ...data} = Object.values(relationships)[index]
			const template_object = templates[relation]
			let text = ''
			if (template_object && template_object.multiple && template_object.singular) {
				if (data.gene !== undefined) {
					text = makeTemplate(template_object.singular, {gene: data.gene, term: data.term || ''})
				} else if (data.gene_list !== undefined) {
					const new_data = {
						term: data.term || '',
						gene: data.gene || '',
						genes: `${data.gene_list.slice(0, -1).join(", ")}, and ${data.gene_list[data.gene_list.length - 1]}`
					}
					text = makeTemplate(template_object.multiple, new_data)
				} else if (data.gene_2_list !== undefined) {
					data.gene_2 = `${data.gene_2_list.slice(0, -1).join(", ")}, and ${data.gene_2_list[data.gene_2_list.length - 1]}`
					
					text = makeTemplate(template_object.multiple, {
						gene: data.gene || '',
						gene_1: data.gene_1 || '',
						gene_2: data.gene_2,
					})
				}
			}
			summary = `${summary} ${text} `
		}
	}

    if (Object.keys(templates).length === 0) return null
    return  (
		<ClientSummarizer>
			<Box sx={style}>
				<Typography variant="h5">{augmented ? "Free text summary of the augmented subnetwork": "Free text summary of the subnetwork"} automatically generated from text templates</Typography>
				{summary === "null" ? <CircularProgress/>: 
					<Box sx={{padding: 10, border: "1px solid", marginTop: 10, height: 400, overflow: "auto"}}>
						<Typography variant="subtitle1">{summary}</Typography>
					</Box>
				}
			</Box>
		</ClientSummarizer>
	)
}
export default Summarizer
