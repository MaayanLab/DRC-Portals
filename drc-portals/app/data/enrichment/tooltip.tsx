'use client'
import { useEffect, useState } from "react"
import { useRouter, } from "next/navigation"
import { Stack, 
	Typography, 
	Card, 
	CardContent, 
	CardActions, 
	Button, 
	IconButton,
	Tooltip
 } from "@mui/material"
import { NetworkSchema } from "./types"
import { useQueryState, parseAsJson } from 'next-usequerystate';
import { makeTemplate } from "./helper"
import { precise } from "./helper"
import HubIcon from '@mui/icons-material/Hub';
import Link from "next/link"
import schema from './schema.json'

export const TooltipComponent = ({data, float, tooltip_templates}: {
	data: {
		id: string,
		label: string,
		relation: string,
		kind: string,
		[key: string]: string | number
	},
	tooltip_templates: {[key: string]: Array<{[key: string]: string}>}, 
	float?: boolean
}) => {
	const router = useRouter()
	const elements = []
	const field = data.kind === "Relation" ? data.label : data.kind.replace("Co-expressed Gene", "lncRNA")
	for (const i of tooltip_templates[field] || []) {
		if (i.type === "link") {
			const text = makeTemplate(i.text, data)
			const href = makeTemplate(i.href, data)
			if (text !== 'undefined') {
			  elements.push(
				<Typography key={i.label} variant="subtitle2" sx={{wordWrap: "break-word"}}>
				  <b>{i.label}:</b> <Button size='small' 
					color="secondary"
					  sx={{padding: 0, textDecoration: "underline"}} 
					  href={href}
									  target="_blank"
									  rel="noopener noreferrer"
				  >{text}</Button>
				</Typography>  
			  )
			}
		  } else {
			let e = makeTemplate(i.text, data)
			if (e !== 'undefined') {
			  elements.push(
				<Typography key={i.label} sx={{wordWrap: "break-word"}} variant="subtitle2">
				  <b>{i.label}:</b> {i.type === "text" ? e: precise(e)}
				</Typography>  
			  )
			}
		  }
	}
	const extrasx:{position?: string, top?: number, left?: number, zIndex?: number} = {}
	if (float) {
		extrasx["position"] = "absolute"
		extrasx["top"] = 0
		extrasx["left"] = 0
		extrasx["zIndex"] = 100
	}
	const pathname = (schema.header.tabs.filter(i=>(i.component === 'KnowledgeGraph' || i.component === 'SimpleKnowledgeGraph'))[0] || {}).endpoint || ''
	const filter = JSON.stringify({
		start: data.kind,
		start_term: data.label
		})
	return (
		<Card sx={{marginTop: 2, ...extrasx}}>
			<CardContent sx={{padding: 2}}>
				{elements}
			</CardContent>
			{data.kind !== "Relation" &&
            <CardActions>
              {/* {!filter.end_term && <Tooltip title="Delete Node">
                <IconButton
                  onClick={()=>{
                    setSelected(null)
					setHovered(null)
                    const queryParams: {filter: string, [key:string]: string} = {filter: '{}'}
          searchParams.forEach((value, key) => {
						queryParams[key] = value;
					});
					const f = JSON.stringify({
                        ...filter,
                        remove: [...(filter.remove || []), data.id]
                      })
					router_push(router, pathname, {...queryParams, filter: f})
          }}><DeleteIcon/></IconButton>
              </Tooltip>} */}
              <Tooltip title="Expand Node">
				<Link href={`${process.env.NEXT_PUBLIC_GSE}/${pathname}?filter=${filter}`}>
					<IconButton>
						<HubIcon sx={{transform: "scaleX(-1)"}}/>
					</IconButton>
				</Link>
              </Tooltip>
            </CardActions>
          }
		</Card>
	)
}

const TooltipComponentGroup = ({
	elements,
	tooltip_templates_nodes,
    tooltip_templates_edges,
	float
}: {
		elements: null | NetworkSchema,
		tooltip_templates_edges: {[key: string]: Array<{[key: string]: string}>},
        tooltip_templates_nodes: {[key: string]: Array<{[key: string]: string}>},
		float?: boolean
	}) => {
	
	const [tooltip, setTooltip] = useQueryState('tooltip')
	const [selected, setSelected] = useQueryState('selected',  parseAsJson<{id: string, type: 'nodes' | 'edges'}>())
	const [hovered, setHovered] = useQueryState('hovered',  parseAsJson<{id: string, type: 'nodes' | 'edges'}>())
	const [elementMapper, setElementMapper] = useState<{nodes: {[key: string]: any}, edges: {[key: string]: any}}>({nodes: {}, edges: {}})


	useEffect(()=>{
        if (elements) {
			const nodes = elements.nodes.reduce((acc, i)=>({
				...acc,
				[i.data.id]: i.data
			}), {})

			const edges = elements.edges.reduce((acc, i)=>({
				...acc,
				[`${i.data.source}_${i.data.relation}_${i.data.target}`]: i.data
			}), {})
			setElementMapper({nodes, edges})
		}
    }, [elements])
	if (selected === null && hovered === null) return null
	else {
		const user_input = selected || hovered
		if (tooltip && user_input !== null && elementMapper[user_input.type] !== undefined && elementMapper[user_input.type][user_input.id] !== undefined) {
			return (
				<TooltipComponent 
						data={elementMapper[user_input.type][user_input.id]} 
						tooltip_templates={user_input.type === 'nodes' ? tooltip_templates_nodes: tooltip_templates_edges}
						float={float}
					/>
			)
		}
		else return null
	
	}
	
	
}

export default TooltipComponentGroup