'use client'
import Icon from "@mdi/react";
import { Grid, Typography, Card, CardHeader, IconButton, CardContent, Skeleton, Stack, Tooltip, Chip, Avatar, List, ListItemButton, ListItemIcon, ListItemText, Collapse, Paper, Button } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";
import { router_push } from "./data/enrichment/utils";
import {  mdiFileDocument, mdiHeadQuestionOutline, mdiHumanMaleBoard, mdiRobotOutline, mdiSearchWeb, mdiTextBoxCheckOutline, mdiTimerSand } from '@mdi/js';
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import React from "react";

import Image from "@/utils/image";
import { ArrowForward, ExpandLess, ExpandMore } from "@mui/icons-material";
import { amber, blue, cyan, indigo, lightGreen, teal } from "@mui/material/colors";
import { ExpandableComponent,
	SearchCard,
	GDLPA,
	GSFM,
	PWB,
	GSE,
	PerturbSeqr,
	BiomarkerKB,
	DDKG } from "@/components/Explorer";
import trpc from '@/lib/trpc/client'

const getTaskId = async (method:string, input: {[key:string]: string}, controller: AbortController) => {
	const payload = {
	  '0': {
		method,
		input
	  }
	}
	const res = await fetch(`/data/api`, {
		  method: 'POST',
		  body: JSON.stringify({
			methods: 'runRunnable',
			payload: payload,
			signal: controller.signal
		  }),
	  })
	if (res.status === 200) {
	  const results = await res.json()
	  const taskId = results.map((i:{result: {data: string}})=>i['result']['data'])[0]
	  return taskId
	} else return ''
  }

const run_runnable = async (method: string, input:{[key: string]:string}, router: AppRouterInstance, getAbortController: Function) => {
	const taskId = await getTaskId(method, input, getAbortController())
	if (taskId !== '') router_push(router, `/data/article/${taskId}`, {})
}

export const methods: {[key: string]: {label: string, icon: string, description: string, icon_color: string, color: string}} = {
  DeepDive: {
	label: "Create a DeepDive2 Summary",
	icon: mdiTextBoxCheckOutline,
	description: "Generate a report by summarizing the top 50 most cited abstracts retruned from a PubMed search of your input terms",
	color: indigo[100],
	icon_color: indigo[900]
  },
  DeepDiveAgent: {
	label: "Create a DeepDive2 Summary with GSFM",
	icon: mdiRobotOutline,
	description: "Generate a report by summarizing abstracts from a PubMed search and results from GSFM for your input terms",
	color: teal[100],
	icon_color: teal[900]
  },
  DeepDiveCFDEAgent: {
	label: "Create a DeepDive2 Summary with a CFDE Workbench Search",
	icon: mdiRobotOutline,
	description: "Generate a report by summarizing abstracts from a PubMed search and results from a CFDE Workbench search for your input terms",
	color: blue[100],
	icon_color: blue[900]
  },
  DeepDiveWithReviewer: {
	label: "Create a DeepDive2 Summary with a Review",
	icon: mdiHumanMaleBoard,
	description: "An independent LLM will review the generated report from the top 50 most highly cited PubMed abstracts to improve the report",
	color: amber[100],
	icon_color: amber[900]
  },
  DeepDiveHypothesis: {
	label: "Create DeepDive2 Hypotheses about Disease Connections",
	icon: mdiHeadQuestionOutline,
	description: "DeepDive2 generates hypotheses by combining PubMed abstracts about a disease with GSFM predictions for a human gene",
	color: cyan[100],
	icon_color: cyan[900]
  },
  DeepDiveHypothesisAll: {
	label: "Create DeepDive2 Hypotheses about Terms Connections",
	icon: mdiHeadQuestionOutline,
	description: "DeepDive2 generates hypotheses by combining highy cited PubMed abstracts, GSFM predictions, and CFDE Workbench search for the input terms",
	color: lightGreen[100],
	icon_color: lightGreen[900]
  },
}

const fetchRunnables = async (search:string[], controller:AbortController) => {
	  try {
		const res = await fetch(`/data/api`, {
			  method: 'POST',
			  body: JSON.stringify({
				methods: 'getRunnables,getArticles',
				payload: {
				  batch: 1,
				  input: JSON.stringify({"0":{"search":search.join(" ")},"1":{"search":search.join(" ")}})
				},
				signal: controller.signal
			  }),
		  })
		  if (res.status === 200) {
			return await res.json()
		  }
		  return []
	  } catch (error) {
		  console.log(error)
		  return []
	  }
	  
}

function toTitleCase(str:string) {
  return str.replace(
    /\w\S*/g,
    text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}

export const Search = ({inputList}: {inputList: {entity: string, label: string, icon: string, icon_color: string,  color:string, values?: {[key: string]: number}, links?: {resource: string, description: string, link: string}[]}[]}) => {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [loading, setLoading] = useState(false)
	const [description, setDescription] = useState<{method: string, description: Function, params: {[key:string]: any}} | null>(null)
	// const [applicables, setApplicables] = useState<{method: string, params: {[key:string]: string}}[]>([])
	const [runnables, setRunnables] = useState<{timestamp: string, method: string, published: boolean, output: {runnable_id: string, value: string}}[]>([])
	const [open, setOpen] = useState('search')
	const abortController = useRef(new AbortController());
	const getAbortController = () => {
		const controller = abortController.current;
		if (controller !== undefined) {
			controller.abort("Cancelling request.");
			abortController.current = new AbortController();
		}
		return abortController.current
	};
	
	const searches = trpc.useQueries((t)=>{
		const terms = inputList.filter(i=>i.entity !== 'gene_set').map(i=>i.label)
		const input = terms.length > 1 ? [...terms, terms.join(" and ")]: terms
		return input.map(search=>t.facet({search}))
	})
	useEffect(()=>{
		const get_runnables = async () => {
		  setLoading(true)
		  const deepDiveOptions = await fetchRunnables(inputList.map(i=>i.label), getAbortController())
		  if (deepDiveOptions) {
			const [runnable, artc ] = deepDiveOptions
			setRunnables(runnable?.result?.data?.items || [])
		  }
		  setLoading(false)
		}
		if (inputList.length > 0) get_runnables()
	  }, [inputList])

	useEffect(()=>setDescription(null),[inputList])
	
	
  	const reroute = (entity:string, label: string) => {
		const query: {[key:string]: string[] | {[key:string]: {
			up_gene_set_id?: number,
			down_gene_set_id?: number,
			gene_set_id?: number
			}}} = JSON.parse(searchParams.get('q') || '{}')
		if (Array.isArray(query[entity])) {
			if (query[entity].length === 1) delete query[entity]
			else query[entity] = query[entity].filter(i=>i!==label)
		} else {
			if (Object.keys(query[entity]).length === 1) delete query[entity]
			else {
				delete query[entity][label]
			}
		}
		if (Object.keys(query).length === 0 ) router_push(router, `/`, {})
		else {
			router_push(router, `/`, {q: JSON.stringify(query), search: true})
		}
		
	}

	if (inputList.length === 0) return null
	else {
		
		const runs:ReactNode[] = []

		const run_component = ({method, icon, params, label, description, icon_color, color}: {method: string, icon: string, icon_color: string, color: string, params: {[key:string]: string}, label: string, description: string}) => (
			<Grid item xs={6} sm={4} key={method}>
		 		<Card key={method} sx={{height: '100%'}}>
		 			<CardHeader
		 				avatar={
		 				<Icon style={{backgroundColor: "transparent", color: "#2D5986"}} path={icon} size={1}/>
		 				}
		 				action={
		 				<IconButton aria-label="goto"
		 					onClick={()=>{
		 						run_runnable(method, params, router, getAbortController)
		 					}}
		 				>
		 					<ArrowForward />
		 				</IconButton>
		 				}
		 				title={label}
		 				subheader={<Stack>
							<Typography variant="caption">{description}</Typography>
							{inputList.map(i=>(
								<Typography variant="caption" color={i.icon_color} key={i.label}><b>{i.entity}: </b>{i.label}</Typography>
							))}
						</Stack>}
		 			/>
		 		</Card>
		 	</Grid>
		)
		for (const [method, v] of Object.entries(methods)) {
			const input = inputList.map(i=>i.label).join(" ")
			if (method === 'DeepDive') {
				if (inputList.length === 1) {
					runs.push(
						run_component({...v, method, params: {input}})
					)
				}
			} else if (method === "DeepDiveHypothesis") {
				const diseases = inputList.filter(i=>i.entity === 'disease' || i.entity === 'disease or phenotype' || i.entity === 'phenotype').map(i=>i.label)
				const genes = inputList.filter(i=>i.entity === 'gene').map(i=>i.label)
				if (diseases.length === 1 && genes.length === 1 && inputList.length === 2) {
					runs.push(run_component({...v, method, params: {gene: genes[0], disease: diseases[0]}}))	
				} 
				
			} else if (method === "DeepDiveHypothesisAll"){
					runs.push(run_component({...v, method: "DeepDiveCFDEAgent", params: {input: `Create a hypothesis that shows connections between ${inputList.map(i=>i.label).join(", ")}`}}))
			} else {
				runs.push(run_component({...v, method, params: {input}}))
			}
		}
		// const runs = inputList.map(a=>(
		// 	<Grid item xs={6} sm={4} key={a.method}>
		// 		<Card key={a.method} sx={{height: '100%'}}>
		// 			<CardHeader
		// 				avatar={
		// 				<Icon style={{backgroundColor: "transparent", color: "#2D5986"}} path={(methods[a.method] || {}).icon} size={1}/>
		// 				}
		// 				action={
		// 				<IconButton aria-label="goto"
		// 					onClick={()=>{
		// 						run_runnable(a.method, a.params, router, getAbortController)
		// 					}}
		// 				>
		// 					<ArrowForward />
		// 				</IconButton>
		// 				}
		// 				title={(methods[a.method] || {}).label || a.method}
		// 				subheader={(methods[a.method] || {}).description}
		// 			/>
		// 		</Card>
		// 	</Grid>
      	// ))
		const articles = runnables.map((i: {[key:string]: any})=>
			<Grid item xs={6} sm={4} key={i.output.runnable_id}>
				<Card key={i.output.runnable_id} sx={{height: '100%'}}>
					<CardHeader
						avatar={
							<Icon style={{backgroundColor: "transparent", color: "#2D5986"}} path={mdiFileDocument} size={1}/>
						}
						action={
						<IconButton aria-label="goto"
							href={`/data/article/${i.output.runnable_id}`}
						>
							<ArrowForward />
						</IconButton>
						}
						title={i.output.value.split("\n\n")[0].replace("# ", "").replace("#", "")}
						subheader={`Created: ${i.output.timestamp.toLocaleString()} using ${methods[i.method].label}`}
					/>
				</Card>
			</Grid>
			// <ListItemButton key={i.output.runnable_id} sx={{ pl: 4 }}
			// 	href={`/data/article/${i.output.runnable_id}`}
			// >
			// 	<ListItemIcon>
			// 		<Icon style={{backgroundColor: "transparent", color: "#2D5986"}} path={mdiFileDocument} size={1}/>
			// 	</ListItemIcon>
			// 	<ListItemText primary={i.output.value.split("\n\n")[0].replace("# ", "").replace("#", "")} 
			// 		secondary={`Created: ${i.output.timestamp.toLocaleString()} using ${methods[i.method].label}`}/>
			// </ListItemButton>
		)
	const icons: {[key:string]: string} = {
		enrichr: "/img/Enrichr.png",
		gse: "/img/cfde-gse.png",
		pwb: "/img/pwb.png",
		gsfm: "/img/gsfm.png",
		gdlpa: "/img/gdlpa.png",
		"sigcom-lincs": "/img/lincs.png",
		l2s2: "/img/l2s2.webp",
		perturbseqr: "/img/perturbseqr.webp",
		"biomarker-kb": "/img/biomarker-kb.png",
		"dd-kg": "/img/dd-kg-icon.png"
	  }
	  const resources: {[key: string]: ReactNode[]} = {}
	  for (const i of inputList) {
		if (i.links) {
			for (const l of i.links) {
				const {resource, description, link} = l

				if (resources[resource] === undefined) resources[resource] = []
				const desc = resource === 'gse' ?  `Perform enrichment analysis on this gene set`: resource === 'perturbseqr' ? `Find perturbagens that up or down regulate the expression of this gene set`: resource === 'biomarker-kb' ? "View biomarkers associated with this term": "Explore connections with this term in DD-KG"
				const props = resource === "gse" ? {}: {target:"_blank", rel:"noopener noreferrer"}
				resources[resource].push(
					<Grid item xs={6} sm={4} key={description}>
						<Card key={description} sx={{height: '100%'}}>
							<CardHeader
								avatar={
									<Avatar sx={{backgroundColor: i.color}}><Icon style={{backgroundColor: "transparent", color: i.icon_color}} path={i.icon} size={1}/></Avatar>
								}
								action={
								<IconButton aria-label="goto"
									href={link}
									{...props}
								>
									<ArrowForward />
								</IconButton>
								}
								title={description}
								subheader={desc}
								// subheader={`Search CFDE Workbench ${i.entity.replaceAll("_", " ")} entities`}
							/>
						</Card>
					</Grid>
				)
			}
		}
	  }
	  
	  const handleClick = (query:string) => {
		if (open===query) setOpen('')
		else setOpen(query)
	  }
	  return (
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<Grid container spacing={1} justifyContent={'flex-start'} sx={{marginTop: 1}}>
					{inputList.map(i=>(
					<Grid item key={i.label}>
						<Tooltip title={i.label} key={i.label}>
							<Chip avatar={<Avatar sx={{backgroundColor: i.color}}><Icon style={{color: i.icon_color}} path={i.icon} size={1}/></Avatar>}
							label={i.label}
							sx={{backgroundColor: i.color}}
							onDelete={()=>reroute(i.entity, i.label)}
							/>
						</Tooltip>
					</Grid>
					))}
				</Grid>
			</Grid>
			<Grid item xs={12}>
				 <List
					sx={{ width: '100%', bgcolor: 'transparent' }}
					component="nav"
					aria-labelledby="nested-list-subheader"
				>
					
					<ExpandableComponent 
						collapsed={false}
						icon="/img/cfde-search.png" 
						title="Search the CFDE Workbench"
						description="Query data and metadata assets produced by the Common Fund programs that participate in the CFDE"
					>
						{inputList.filter(i=>i.entity!=='gene_set').map(i=>(<SearchCard key={`search-${i.label}`} labels={[i.label]} {...i} />))}
						{inputList.filter(i=>i.entity!=='gene_set').length > 1 && <SearchCard labels={inputList.filter(i=>i.entity!=='gene_set').map(i=>i.label)} />}
					</ExpandableComponent>
					<ExpandableComponent 
						icon={icons.gdlpa}
						title="Query Gene and Drug Landing Page Aggregator (GDLPA)"
						description="GDLPA aggregated links to databases that have gene, drug, and variant landing pages including some created by Common Fund programs">
						{inputList.filter(i=>i.entity === 'gene' || i.entity === 'variant' || i.entity === 'compound' || i.entity === 'drug').map(i=>
							<GDLPA key={`gdlpa-${i.label}`} {...i} />
						)}
					</ExpandableComponent>
					<ExpandableComponent
						icon={icons.gsfm}
						title="View Gene Function Predictions with GSFM"
						description="GSFM is an AI foundation trained by finding the embeddings of 1 million gene sets. It can be used to reliably predict the function of genes and proteins">
						{inputList.filter(i=>i.entity === 'gene' || i.entity === 'gene_set').map(i=>
							<GSFM key={`gsfm-${i.label}`} {...i} />
						)}
					</ExpandableComponent>
					<ExpandableComponent 
						icon={icons.pwb}
						title="Build a Workflow with Playbook Workflow Builder"
						description="The Playbook Workflow Builder is an environemt that enables users to build workflows by clicking on cards or interfacing with an LLM-powered chatbot">
						{inputList.filter(i=>["gene", "variant", "disease", "drug", "metabolite", "anatomy", "gene_set"].indexOf(i.entity) > -1).map(i=>
							<PWB key={`pwb-${i.label}`} {...i} />
						)}
					</ExpandableComponent>
					<ExpandableComponent 
						icon={icons.gse}
						title="Perform Enrichment Analysis with CFDE GSE"
						description="CFDE Gene Set Enrichment (GSE) is an enrichment analysis tool made with gene set libraries created from data produced by Common Fund programs">
						{inputList.filter(i=>i.entity === 'gene_set').map(i=>
							<GSE key={`gse-${i.label}`} {...i} />
						)}
					</ExpandableComponent>
					
					<ExpandableComponent  
						collapsed={true}
						width={30}
						height={30}
						icon={icons.perturbseqr}
						title="Discover Mimickers and Reversers with Perturb-Seqr"
						description="Discover Mimickers and Reversers with Perturb-Seqr">
						{inputList.filter(i=>i.entity === 'gene_set').map(i=>
							<PerturbSeqr key={`pert-${i.label}`} {...i} />
						)}
					</ExpandableComponent> 
					<ExpandableComponent
						collapsed={true}
						width={30}
						height={30}
						icon={icons['biomarker-kb']}
						title="Explore Biomarkers in the CFDE BiomarkerKB"
						description="BiomarkerKB integrates biomarker information using a data model that is stored as a knowledge graph database">
						{inputList.filter(i=>["gene", "variant", "disease", "drug", "metabolite", "anatomy"].indexOf(i.entity) > -1).map(i=>
							<BiomarkerKB key={`bkb-${i.label}`} {...i} />
						)}
					</ExpandableComponent>
					<ExpandableComponent 
						collapsed={true}
						width={40}
						height={40}
						icon={icons['dd-kg']}
						title="Explore Connections in the CFDE DD-KG"
						description="The Data Distillery Knowledge Graph (DD-KG) is a massive knowledge graph that integrate data from Common Fund programs and other sources">
						{inputList.filter(i=>["gene", "disease", "drug", "metabolite", "anatomy"].indexOf(i.entity) > -1).map(i=>
							<DDKG key={`ddkg-${i.label}`} {...i} />
						)}
					</ExpandableComponent>

					{runs.length > 0 &&
					<>
							<ListItemButton onClick={()=>handleClick('deepdive')}>
								<ListItemIcon>
									<Icon path={mdiRobotOutline} style={{backgroundColor: "transparent", color: "#2D5986"}} size={2}/>
								</ListItemIcon>
								<ListItemText primary={<Typography variant="h3">DeepDive2 Summary Reports</Typography>}
									secondary={"Generate reports with verified citations by summarizing PubMed abstracts and results from CFDE tools"} />
								{open==='deepdive' ? <ExpandLess /> : <ExpandMore />}
							</ListItemButton>
							<Collapse in={open==='deepdive'} timeout="auto" unmountOnExit>
								<Paper elevation={0} sx={{background: 'transparent'}}>
									<Grid container spacing={2}>
										{runs}
									</Grid>
								</Paper>
							</Collapse>
						</>
				}
				{articles.length > 0 &&
					<>
						<ListItemButton onClick={()=>handleClick('deepdive-article')}>
							<ListItemIcon>
								<Icon path={mdiRobotOutline} style={{backgroundColor: "transparent", color: "#2D5986"}} size={2}/>
							</ListItemIcon>
							<ListItemText primary={<Typography variant="h3">{`DeepDive2 Articles`}</Typography>}
								secondary={'View previously created DeepDive2 generated reports for your selected terms'} />
							{open==='deepdive-article' ? <ExpandLess /> : <ExpandMore />}
						</ListItemButton>
						<Collapse in={open==='deepdive-article'} timeout="auto" unmountOnExit>
							<Paper elevation={0} sx={{background: 'transparent'}}>
								<Grid container spacing={2}>
									{articles}
								</Grid>
							</Paper>
						</Collapse>
					</>
				}
				</List>
			</Grid>
			<Grid item xs={12}>
				<Button variant="outlined" color="secondary" sx={{width: "100%", mb: 2}} href={`/?q=${searchParams.get('q')}`}>
					<Typography>Back</Typography>
				</Button>
			</Grid>
		</Grid>
	  )
	  
}
}
