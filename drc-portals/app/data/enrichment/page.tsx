import { Suspense } from "react"
import Subheader from './subheader'

import Link from 'next/link';
import {
    Grid,
	Container,
    Stack,
    Typography,
    Card,
    CardContent
} from '@mui/material';
import GeneSetForm from './form';
import TooltipComponentGroup from "./tooltip";
import schema from './schema.json'
import { parseAsJson } from "next-usequerystate";
import { EnrichmentParams, NetworkSchema } from "./types";
import TermViz from './termviz';
import InteractiveButtons from "./interactive";
import Summarizer from "./Summarizer";
export default async function Home({searchParams}: {
	searchParams: {
		q?: string,
		fullscreen?: 'true',
		view?: string,
        collapse?: 'true'
	}
}) {
	let props
	for (const tab of schema.header.tabs) {
		if ("/enrichment" === tab.endpoint) props = tab.props
	}

	const query_parser = parseAsJson<EnrichmentParams>().withDefault(props?.default_options || {})
    const parsedParams: EnrichmentParams = query_parser.parseServerSide(searchParams.q)
	
	const libraries_list = props?.libraries.sort(function(a, b) {
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
     }) || []

	const tooltip_templates_nodes: {[key: string]: Array<{
            label: string,
            text: string,
            type: string
        }>} = {}
    const tooltip_templates_edges: {[key: string]: Array<{
            label: string,
            text: string,
            type: string
        }>} = {}
    for (const i of schema.nodes) {
        tooltip_templates_nodes[i.node] = i.display
    }

    for (const e of schema.edges) {
        for (const i of e.match) {
        tooltip_templates_edges[i] = e.display
        }
    }
	
	try {
        const {
            userListId,
            gene_limit,
            min_lib,
            gene_degree,
            term_degree,
            expand,
            remove,
            augment_limit,
            gene_links
        } = parsedParams
        const libraries = parsedParams.libraries || []
        let elements:NetworkSchema|null = null
        let shortId = ''
        let genes: Array<string> = []
        let input_desc
        if (userListId !==undefined && libraries.length > 0) {
            console.log("Getting description...")
            const desc_request = await fetch(`${process.env.NEXT_PUBLIC_ENRICHR_URL}/view?userListId=${userListId}`)
            if (desc_request.ok) input_desc = (await (desc_request.json())).description
            console.log("Getting shortID...")
            console.log(`${process.env.NEXT_PUBLIC_ENRICHR_URL}/share?userListId=${userListId}`)
            const request = await fetch(`${process.env.NEXT_PUBLIC_ENRICHR_URL}/share?userListId=${userListId}`)
            if (request.ok) shortId = (await (request.json())).link_id
            else console.log(`failed ${process.env.NEXT_PUBLIC_ENRICHR_URL}/share?userListId=${userListId}`)
            console.log(`ShortID: ${shortId}`)
            console.log(`Enrichment ${process.env.NEXT_PUBLIC_GSE}/api/enrichment${parsedParams.augment===true ? '/augment': ''}`)
            const res = await fetch(`${process.env.NEXT_PUBLIC_GSE}/api/enrichment${parsedParams.augment===true ? '/augment': ''}`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        userListId,
                        libraries: libraries.map(({name, limit, library, term_limit})=>({
                            library: library || name,
                            term_limit: limit || term_limit
                        })),
                        min_lib,
                        gene_limit,
                        gene_degree,
                        term_degree,
                        expand,
                        remove,
                        augment_limit,
                        gene_links
                    }),
                })
            if (!res.ok) {
                console.log(`failed connecting to ${process.env.NEXT_PUBLIC_GSE}/api/enrichment${parsedParams.augment===true ? '/augment': ''}`)
                console.log(await res.text())
            }
            else{
                console.log(`fetched`)
                elements = await res.json()
                genes = ((elements || {}).nodes || []).reduce((acc: Array<string>, i)=>{
                    if (i.data.kind === "Gene" && acc.indexOf(i.data.label) === -1) return [...acc, i.data.label]
                    else return acc
                }, [])
            }
        }
        const payload = {
            'url': `https://data.cfde.cloud/enrichment?q=${searchParams.q}`,
            'apikey': process.env.TURL_CRED  
        }
        console.log("Getting short url")
        const request = await fetch("https://maayanlab.cloud/turl/api/register", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })
        let short_url=null
        if (request.ok) short_url = (await request.json())['shorturl']
        else console.log("failed turl")
        console.log("Got url")
	
		return (
		<Grid container direction={"column"} spacing={2} justifyContent="space-between">
			<Grid item xs={12} >
				<Typography sx={{ml:3, mt:2}} color="secondary" variant="h2">
					Enrichment Analysis Against Common Fund Gene Set Libraries
				</Typography>
			</Grid>
			<Grid item xs={12}>
				<Typography sx={{ml:3, mb:2}} variant="subtitle1">
					Try submitting your gene sets for enrichment analysis against gene set libraries created from datasets produced by Common Fund programs to discover unexpected statistically significant overlaps between your gene sets and sets from across programs. The overlap between sets is ranked by the Fisher’s exact test. Please select at least one CF program by clicking on the icons. You should be able to explore the results as bar charts, networks, and tables.
				</Typography>
			</Grid>
			<Grid item xs={12} >
				{!searchParams.fullscreen &&<Suspense><Subheader/></Suspense>}
			</Grid>
			<Grid item xs={12} >
				<Grid container spacing={1} alignItems={"flex-start"}>
					
					{(! searchParams.collapse) && 
					<Grid item xs={12} md={elements===null?12:3}>
						<Card elevation={0} sx={{borderRadius: "8px", backgroundColor: "inherit"}}>
							<CardContent>
								<GeneSetForm 
									libraries_list={libraries_list.map(l=>l.name)}
									parsedParams={parsedParams}
									searchParams={searchParams}
									fullWidth={elements===null}
									elements={elements}
									{...props}
								/>
								<TooltipComponentGroup
									elements={elements}
									tooltip_templates_edges={tooltip_templates_edges}
									tooltip_templates_nodes={tooltip_templates_nodes}
								/>
							</CardContent>
						</Card>
					</Grid>
					}

					{ elements!==null && 
						<Grid item xs={12} md={searchParams.collapse ? 12: 9}>
							<Grid container alignItems={"flex-start"}>
								{searchParams.collapse && 
									<Grid item xs={12} md={2}>
										<Card elevation={0} sx={{borderRadius: "8px", backgroundColor: "#FFF"}}>
											<CardContent>
												<GeneSetForm 
													libraries_list={libraries_list.map(l=>l.name)}
													parsedParams={parsedParams}
													searchParams={searchParams}
													fullWidth={elements===null}
													elements={elements}
													{...props}
												/>
											</CardContent>
										</Card>
									</Grid>
								}
								<Grid item xs={12} md={searchParams.collapse? 10: 12}>
									<InteractiveButtons 
										libraries_list={libraries_list.map(l=>l.name)}
										disableLibraryLimit={false}
										hiddenLinksRelations={[]}
										shortId={shortId}
										parsedParams={parsedParams}
										// searchParams={parsedParams}
										fullscreen={searchParams.fullscreen}
										gene_count={genes.length}
										elements={elements}
										short_url={short_url}
										searchParams={searchParams}
									>
										<Summarizer elements={elements} augmented={parsedParams.augment}/>
									</InteractiveButtons>
								</Grid>
								<Grid item xs={12} sx={{position: "relative"}}>
									<Card sx={{borderRadius: "24px", minHeight: 450, width: "100%"}}>
										<CardContent>
											{input_desc && 
												<Typography variant='h5' sx={{textAlign: "center"}}><b>{input_desc}</b></Typography>
											}
											<TermViz
												elements={elements} 
												tooltip_templates_edges={tooltip_templates_edges}
												tooltip_templates_nodes={tooltip_templates_nodes}
												view={searchParams.view}
												edge_tooltip={true}
											/>
										</CardContent>
									</Card>
									{searchParams.collapse && <TooltipComponentGroup
										elements={elements}
										tooltip_templates_edges={tooltip_templates_edges}
										tooltip_templates_nodes={tooltip_templates_nodes}
										float={true}
									/>}
								</Grid>
							</Grid>
						</Grid>
					}
				</Grid>
			</Grid>
		</Grid>
		)
	} catch (error) {
        console.error(error)
        return null
    }
}