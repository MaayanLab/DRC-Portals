import Image from "@/utils/image"
import { Button, Grid, ListItemIcon, ListItemText } from "@mui/material"
import { useEffect, useState } from "react"
import trpc from '@/lib/trpc/client'
import { ListItemButton } from "@mui/material"

const resolve_id = async (gene_set: string[], up: boolean, url: string) => {
	const query = {
			"operationName":"AddUserGeneSet",
			"query":"mutation AddUserGeneSet($genes: [String], $description: String = \"\") {\n  addUserGeneSet(input: {genes: $genes, description: $description}) {\n    userGeneSet {\n      id\n      __typename\n    }\n    __typename\n  }\n}\n",
			"variables": {
				"description": `User ${up ? 'Up': 'Down'} Gene Set`,
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
export const L2S2 = ({input, url='http://l2s2.maayanlab.cloud/', icon="/img/L2S2.webp", title="L2S2"}: {input: {entity: string, label: string, icon: string, values?: {[key: string]: string[]}}, url?: string, icon?: string, title?:string}) => {
	const [link, setLink] = useState('')
	// const search = trpc.l2s2.useMutation()
	// useEffect(()=>{
	// 	const resolve = async () => {
	// 		const res = await search.mutateAsync({
	// 				input: {
	// 					gene_set: (input.values || {}).gene_set || [],
	// 					up_gene_set: (input.values || {}).up || [],
	// 					down_gene_set: (input.values || {}).down || [],
	// 				},
	// 				url,
	// 		})
	// 		setLink(res)
	// 	}
	// 	resolve()
	// }, [])
	if (!link || link === '') return null
	else {
		return  <ListItemButton sx={{ pl: 4 }}
				href={link}
				target="_blank" rel="noopener noreferrer"
			>
			<ListItemIcon>
				<Image alt={title} src={icon} width={15} height={15}/>
			</ListItemIcon>
			<ListItemText primary={`Find mimicking and reversing signatures for ${input.label} gene set using L2S2`}/>
		</ListItemButton>			
	}
}