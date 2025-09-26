'use client'
import Image from "next/image";
import { Grid, Button, Tooltip, Snackbar, Alert, Typography } from "@mui/material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { router_push } from "./utils";
import { parseAsJson, useQueryState } from "next-usequerystate";
import { EnrichmentParams } from "./types";
import { useState } from "react";
import schema from './schema.json'

const styles = {
	disabled: {
		opacity: .7,
		height: 70
	},
	enabled: {
		opacity: 1,
		height: 70
	},
	active: {
		opacity: 1,
		height: 70,
		background: "#e0e0e0",
		"&:hover": {
			background: "#9e9e9e",
		},
		"&:focus": {
			background: "#9e9e9e",
		},
		"&:enabled": {
			background: "#e0e0e0",
		},
		verticalAlign: "center",
	}
  }

function contains(superset:Array<string>, subset:Array<string>) {
	for (const i of subset || []) {
		if ((superset || []).indexOf(i) > -1) return true
	}
	return false
}


const Subheader = () => {
	const pathname = usePathname()
	const router = useRouter()
	const searchParams = useSearchParams()
	const subheader = schema.header.subheader
	const view = searchParams.get('view')
	const fullscreen = searchParams.get('fullscreen')
	const collapse = searchParams.get('collapse')
	const misc: {view?: string, fullscreen?: string, collapse?: string,} = {}
	if (view) misc["view"] = view
	if (fullscreen) misc["fullscreen"] = fullscreen
	if (collapse) misc["collapse"] = collapse
	
	const [error, setError] = useState<{message: string, type:string} | null>(null)
	const [userQuery, setQuery] = useQueryState('query', parseAsJson<EnrichmentParams>().withDefault({}))
	const subpaths = (pathname.split("/")).slice(1)
	if (typeof subheader === 'undefined') return null
	else {
		let subheader_props: null | {
                    url_field: string,
                    query_field: string,
                } = null
		let default_options: null | {[key: string]: any} = null
		let disableLibraryLimit = true
		const subpaths = (pathname.split("/")).slice(1)
		for (const tab of schema.header.tabs) {
			if (pathname.replace("/data", "") === tab.endpoint) { 
				subheader_props = tab.props?.subheader
				default_options = tab.props.default_options
			}

		}
		if (subheader_props === null) return null
		return (
			<Grid container spacing={1} justifyContent={'center'} alignItems={"center"} columns={8}>
				<Snackbar open={error!==null}
					anchorOrigin={{ vertical:"bottom", horizontal:"left" }}
					autoHideDuration={4500}
					onClose={()=>{
                        setError(null)
                    }}
				>
                    <Alert 
                        onClose={()=>{
                            setError(null)
                        }}
                        severity={(error || {} ).type === "fail" ? "error": "warning"}
                        sx={{ width: '100%' }} 
                        variant="filled"
                        elevation={6}
                    >
                        <Typography>{( error || {}).message || ""}</Typography>
                    </Alert>
                </Snackbar>
				{subheader.map(i=>{
					const url_field = 'q'
					const query_field = 'libraries'
					const query_parser = parseAsJson<EnrichmentParams>()
					const query = query_parser.parse(searchParams.get(url_field) || '') || default_options || {}
					const selected: {name: string}[] = userQuery[query_field] || query[query_field] || []
					const options: Array<string> = i.props[query_field]					
					const active = contains(selected.map(({name})=>name), options)
					const enabled = selected.length === 0
					let style = {}
					if (enabled) styles.enabled
					else if (active) style = styles.active
					else style = styles.disabled
					return (
						<Grid item xs={2} md={1} key={i.label} className="flex items-center justify-center relative" >
							<Tooltip title={i.label} placement="top">
								<Button
									disabled={!subheader_props}
									className="flex items-center justify-center relative" 
									sx={{padding: 1, ...style}}
									onClick={()=>{
										// delete

										if (contains(selected.map(({name})=>name), i.props[query_field])) {
											const new_selected = []
											for (const s of selected) {
												if (i.props[query_field].indexOf(s.name) === -1) new_selected.push(s)
											}
											query[query_field] = new_selected
											router_push(router, pathname, {
												[url_field]: JSON.stringify(query),
												...misc
											})
										} else { // add
											if (selected.length >= 5 && !disableLibraryLimit) setError({message: `The maximum number of ${query_field} has been selected`, type: "fail"})
											else {
												query[query_field] = [...selected, ...i.props[query_field].map((name:string)=>({name, limit: 5}))]
												router_push(router, pathname, {
													[url_field]: JSON.stringify(query),
													...misc
												})
											}
										}	
									}}
								>
									<Image  src={i.icon || ''} alt={i.label} width={i.width} height={i.height}/>
								</Button>
							</Tooltip>
						</Grid>
					)
				})}
			</Grid>
		)
	}
}

export default Subheader