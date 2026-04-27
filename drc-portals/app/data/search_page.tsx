'use client'
import Icon from "@mdi/react";
import { Grid, Typography, Card, CardHeader, IconButton, CardContent, Skeleton } from "@mui/material";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";
import { router_push } from "./enrichment/utils";
import {  mdiFileDocument, mdiHeadQuestionOutline, mdiHumanMaleBoard, mdiRobotOutline, mdiTextBoxCheckOutline, mdiTimerSand } from '@mdi/js';
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import React from "react";

import Image from "@/utils/image";
import { ArrowForward, ExpandLess, ExpandMore } from "@mui/icons-material";
import { GSFMButton } from "./buttons/gsfm";
import { GDLPAButton } from "./buttons/gdlpa";
import { SigComButtons } from "./buttons/sigcomLincs";
import { L2S2 } from "./buttons/l2s2like";
import { EnrichrButtons } from "./buttons/enrichr";
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

export const methods: {[key: string]: {label: string, icon: string, description: string}} = {
  DeepDive: {
	label: "DeepDive Summary",
	icon: mdiTextBoxCheckOutline,
	description: "DeepDive2 queries the top 50 highly cited articles co-mentioning input terms on PubMed and creates a summary report based on these articles."
  },
  DeepDiveAgent: {
	label: "DeepDive with RAG Agent",
	icon: mdiRobotOutline,
	description: "DeepDive2 uses an LLM RAG agent that can query PubMed and GSFM for input terms and creates a summary from the search results."
	// ({method, router, params, getAbortController}:{getAbortController: Function, router: AppRouterInstance, method: string, params: {input: string}}) => (
	// 	<Stack spacing={1}>
	// 		<Typography variant={"h4"}>
	// 			Generate Summary With a RAG Agent Using PubMed Articles and GSFM
	// 		</Typography>
	// 		<Typography variant="body1">
	// 			DeepDive2 uses an LLM RAG agent that can query PubMed and GSFM for {params.input} and creates a summary from the search results.
	// 		</Typography>
	// 		<Button onClick={()=>{
    //             run_runnable(method, params, router, getAbortController)
    //           }} variant="outlined" color="secondary" startIcon={<Icon path={mdiRobotOutline} size={1}/>}>
	// 			Get Summary
	// 		  </Button>
	// 	</Stack>
	// )
  },
  DeepDiveCFDEAgent: {
	label: "DeepDive with CFDE Workbench Agent",
	icon: mdiRobotOutline,
	description: "DeepDive2 uses an LLM RAG agent that can query PubMed, GSFM, and CFDE Workbench for input terms and creates a summary using it."
  },
  DeepDiveWithReviewer: {
	label: "Summarize with Review Process",
	icon: mdiHumanMaleBoard,
	description: "An independent LLM Agent will review the generated report from highly cited PubMed articles co-mentioning input terms."
  },
  DeepDiveHypothesis: {
	label: "Hypothesize Disease Connections",
	icon: mdiHeadQuestionOutline,
	description: "DeepDive2 runs a hypothesis generation workflow using highy cited PubMed articles for disease and gene terms, and GSFM predictions on gene terms"
  },
  DeepDiveHypothesisAll: {
	label: "Hypothesize Term Connections",
	icon: mdiHeadQuestionOutline,
	description: "DeepDive2 runs a hypothesis generation workflow using highy cited PubMed articles, GSFM, and CFDE Workbench for the input terms."
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



export const Search = ({inputList}: {inputList: {entity: string, label: string, icon: string, values?: {[key: string]: string[]}, links?: {resource: string, description: string, link: string}[]}[]}) => {
	const router = useRouter()
	const [controller, setController] = useState<AbortController | null>(null)
	const [loadingIndex, setLoadingIndex] = useState(-1)
	const [loading, setLoading] = useState(false)
	const [description, setDescription] = useState<{method: string, description: Function, params: {[key:string]: any}} | null>(null)
	// const [applicables, setApplicables] = useState<{method: string, params: {[key:string]: string}}[]>([])
	const [runnables, setRunnables] = useState<{timestamp: string, method: string, published: boolean, output: {runnable_id: string, value: string}}[]>([])
	const [articles, setArticles] = useState<{timestamp: string, message: {message_id: string, content: string}}[]>([])
	const [open, setOpen] = useState('')
	const abortController = useRef(new AbortController());
	const getAbortController = () => {
		const controller = abortController.current;
		if (controller !== undefined) {
			controller.abort("Cancelling request.");
			abortController.current = new AbortController();
		}
		return abortController.current
	};
	
	useEffect(()=>{
		const get_runnables = async () => {
		  setLoading(true)
		//   setApplicables([])
		  const deepDiveOptions = await fetchRunnables(inputList.map(i=>i.label), getAbortController())
		  if (deepDiveOptions) {
			const [runnable, artc ] = deepDiveOptions
			// const runnables = runnable.result.data.items
			setRunnables(runnable.result.data.items)
			// if (inputList.length === 1) setApplicables(applicable.result.data)
			// else setApplicables(applicable.result.data.filter((i:{method:string})=>i.method !== 'DeepDive'))
			// const articles = artc.result.data.items
		  }
		  setLoading(false)
		}
		if (inputList.length > 0) get_runnables()
	  }, [inputList])

	useEffect(()=>setDescription(null),[inputList])
	
	
	if (inputList.length === 0) return null
	else {
		const searches = inputList.map((i, ind)=>(
			<Grid item xs={6} sm={4} key={i.label}>
				<Card key={i.label} sx={{height: '100%'}}>
					<CardHeader
						avatar={
							<Icon style={{backgroundColor: "transparent", color: "#2D5986"}} path={i.icon} size={1}/>
						}
						action={
						<IconButton aria-label="goto"
							href={`/data/processed/search/${i.label}/${i.entity}`}
						>
							<ArrowForward />
						</IconButton>
						}
						title={i.label}
						subheader={`Search CFDE Workbench ${i.entity.replaceAll("_", " ")} entities`}
					/>
				</Card>
			</Grid>
				// <ListItemButton key={i.label} sx={{ pl: 4 }} href={`/data/processed/search/${i.label}/${i.entity}`}>
				// 	<ListItemIcon>
				// 		<Icon style={{backgroundColor: "transparent", color: "#2D5986"}} path={i.icon} size={1}/>
				// 	</ListItemIcon>
				// 	<ListItemText primary={`Search CFDE Workbench for ${i.label}`}/>
				// </ListItemButton>
		))
		const runs:ReactNode[] = []

		const run_component = ({method, icon, params, label, description}: {method: string, icon: string, params: {[key:string]: string}, label: string, description: string}) => (
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
		 				subheader={description}
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
		gse: "/img/CFDE_square.png",
		gsfm: "/img/gsfm.png",
		gdlpa: "/img/gdlpa.png",
		"sigcom-lincs": "/img/lincs.png",
		l2s2: "/img/l2s2.webp",
		perturbseqr: "/img/perturbseqr.webp"
	  }
	  const resources: {[key: string]: ReactNode[]} = {}
	  for (const i of inputList) {
		if (i.links) {
			for (const l of i.links) {
				const {resource, description, link} = l
				if (resources[resource] === undefined) resources[resource] = []
				
				const props = resource === "gse" ? {}: {target:"_blank", rel:"noopener noreferrer"}
				resources[resource].push(
					<Grid item xs={6} sm={4} key={description}>
						<Card key={description} sx={{height: '100%'}}>
							<CardHeader
								avatar={
									<Icon style={{backgroundColor: "transparent", color: "#2D5986"}} path={i.icon} size={1}/>
								}
								action={
								<IconButton aria-label="goto"
									href={link}
									{...props}
								>
									<ArrowForward />
								</IconButton>
								}
								title={i.label}
								// subheader={`Search CFDE Workbench ${i.entity.replaceAll("_", " ")} entities`}
							/>
						</Card>
					</Grid>
				)
			}
		}
	  }

	  const gsfm:ReactNode[] = []
	  const gdlpa:ReactNode[] = []
	  const enrichr:ReactNode[] = []
	  const sigcomLincs:ReactNode[] = []
	  const l2s2:ReactNode[] = []
	  for (const i of inputList) {
		if (i.entity === "gene") {
			gsfm.push(<GSFMButton input={i}/>)
			gdlpa.push(<GDLPAButton input={i}/>)
		}
		if (i.entity === "compound") {
			gdlpa.push(<GDLPAButton input={i}/>)
		}
		if (i.entity === "gene_set") {
			sigcomLincs.push(<SigComButtons input={i}/>)
			l2s2.push(<L2S2 input={i}/>)
			enrichr.push(<EnrichrButtons input={i}/>)
		}

	  }

	  inputList.filter(i=>i.entity === 'gene').map(i=><GSFMButton input={i}/>)
	  
	  const lists = [
		{
			label: "Search CFDE Workbench",
			image: "/img/CFDE_square.png",
			components: searches
		},
		{
			label: "Query Predictions on GSFM",
			image: "/img/gsfm.png",
			components: gsfm
		},
		{
			label: "View on GDLPA",
			image: "/img/gdlpa.png",
			components: gdlpa
		},
		{
			label: "Enrich Gene Sets using Enrichr",
			image: "/img/Enrichr.png",
			components: enrichr
		},
		{
			label: "Find Mimicking and Reversing Signatures Using SigCom-LINCS",
			image: "/img/lincs.png",
			components: sigcomLincs
		},
		{
			label: "Find Mimicking and Reversing Signatures Using L2S2",
			image: "/img/l2s2.webp",
			components: l2s2
		},
		{
			label: `Generate reports on ${inputList.length === 1 ? inputList[0].label : "multiple terms"} Using DeepDive2`,
			icon: mdiRobotOutline,
			components: runs
		},
		{
			label: `Read available reports on ${inputList.length === 1 ? inputList[0].label : "multiple terms"} From DeepDive2`,
			icon: mdiRobotOutline,
			components: articles
		}
	  ]
	  return (
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<Card>
					<CardHeader
						avatar={
							<Image src="/img/CFDE_square.png" width={30} height={30} alt="cfde"/>
						}
						title={<Typography variant="h3">{`Search CFDE Workbench`}</Typography>}
					/>
					<CardContent>
						<Grid container spacing={2}>
							{searches}
						</Grid>
					</CardContent>
				</Card>
			</Grid>

			{(gdlpa || []).length > 0 && 
				<Grid item xs={12}>
					<Card>
						<CardHeader
							avatar={
								<Image src={icons.gdlpa} width={30} height={30} alt="gdlpa"/>
							}
							title={<Typography variant="h3">{`Query Gene and Drug Landing Page Aggregator (GDLPA)`}</Typography>}
						/>
						<CardContent>
							<Grid container spacing={2}>
								{gdlpa}
							</Grid>
						</CardContent>
					</Card>
				</Grid>
			}
			{(gsfm || []).length > 0 && 
				<Grid item xs={12}>
					<Card>
						<CardHeader
							avatar={
								<Image src={icons.gsfm} width={30} height={30} alt="gsfm"/>
							}
							title={<Typography variant="h3">{`View Gene Function Prediction on GSFM`}</Typography>}
						/>
						<CardContent>
							<Grid container spacing={2}>
								{gsfm}
							</Grid>
						</CardContent>
					</Card>
				</Grid>
			}
			{(resources.gse || []).length > 0 && 
				<Grid item xs={12}>
					<Card>
						<CardHeader
							avatar={
								<Image src={icons.gse} width={30} height={30} alt="gse"/>
							}
							title={<Typography variant="h3">{`Perform Enrichment Analysis on CFDE GSE`}</Typography>}
							subheader={'Enrichment analysis on CFDE Gene Set Libraries'}
						/>
						<CardContent>
							<Grid container spacing={2}>
								{resources.gse}
							</Grid>
						</CardContent>
					</Card>
				</Grid>
			}
			{/* {(resources.enrichr || []).length > 0 && 
				<Grid item xs={12}>
					<Card>
						<CardHeader
							avatar={
								<Image src={icons.enrichr} width={30} height={30} alt="enrichr"/>
							}
							title={<Typography variant="h3">{`Perform Enrichment Analysis on Enrichr`}</Typography>}
							subheader={'Enrichment analysis on over 200 gene set libraries'}
							
						/>
						<CardContent>
							<Grid container spacing={2}>
								{resources.enrichr}
							</Grid>
						</CardContent>
					</Card>
				</Grid>
			} */}
			{/* {(resources['sigcom-lincs'] || []).length > 0 && 
				<Grid item xs={12}>
					<Card>
						<CardHeader
							avatar={
								<Image src={icons['sigcom-lincs']} width={30} height={30} alt="sigcom"/>
							}
							title={<Typography variant="h3">{`Discover Mimicking and Reversing Signatures on SigCom-LINCS`}</Typography>}
							subheader={'Query over one million perturbation signatures on SigCom-LINCS'}
							
						/>
						<CardContent>
							<Grid container spacing={2}>
								{resources['sigcom-lincs']}
							</Grid>
						</CardContent>
					</Card>
				</Grid>
			} */}
			{/* {(resources.l2s2 || []).length > 0 && 
				<Grid item xs={12}>
					<Card>
						<CardHeader
							avatar={
								<Image src={icons.l2s2} width={30} height={30} alt="sigcom"/>
							}
							title={<Typography variant="h3">{`Discover Mimicking and Reversing Signatures on L2S2`}</Typography>}
							subheader={'Query over one million gene sets on L2S2'}
							
						/>
						<CardContent>
							<Grid container spacing={2}>
								{resources.l2s2}
							</Grid>
						</CardContent>
					</Card>
				</Grid>
			} */}
			{(resources.perturbseqr || []).length > 0 && 
				<Grid item xs={12}>
					<Card>
						<CardHeader
							avatar={
								<Image src={icons.perturbseqr} width={30} height={30} alt="sigcom"/>
							}
							title={<Typography variant="h3">{`Discover Mimicking and Reversing Signatures on Perturb-Seqr`}</Typography>}
							subheader={'Query over 400,000 gene sets on Perturb-Seqr'}
							
						/>
						<CardContent>
							<Grid container spacing={2}>
								{resources.perturbseqr}
							</Grid>
						</CardContent>
					</Card>
				</Grid>
			}
			<Grid item xs={12}>
				{runs.length > 0 &&
					<Card>
						<CardHeader
							avatar={
								<Icon path={mdiRobotOutline} style={{backgroundColor: "transparent", color: "#2D5986"}} size={1}/>
							}
							title={<Typography variant="h3">{`Generate Summary Reports For ${inputList.length === 1 ? inputList[0].label: inputList.map(i=>i.label).slice(0, inputList.length-1).join(", ") + ", and " + inputList[inputList.length - 1].label} Using DeepDive2 Workflows`}</Typography>}
						/>
						<CardContent>
							<Grid container spacing={2}>
								{runs}
							</Grid>
						</CardContent>
					</Card>
				}
				
			</Grid>
			{loading && 
				<Grid item xs={12}>
					<Card>
						<CardHeader
							avatar={
								<Icon path={mdiTimerSand} style={{animation: "spin 2s linear infinite"}} size={1}/>
							}
							title={"Contacting Deepdive2..."}
							subheader={`Fetching articles...`}
						/>
						<CardContent><Skeleton variant="rectangular" width={'100%'} height={200} /></CardContent>
					</Card>
				</Grid>
			}

			{articles.length > 0 &&
				<Grid item xs={12}>
					<Card>
						<CardHeader
							avatar={
								<Icon path={mdiRobotOutline} style={{backgroundColor: "transparent", color: "#2D5986"}} size={1}/>
							}
							title={<Typography variant="h3">{`View Summary Reports Considering All Selected Terms Using DeepDive2 Workflows`}</Typography>}
						/>
						<CardContent>
							<Grid container spacing={2}>
								{articles}
							</Grid>
						</CardContent>
					</Card>
				</Grid>
			}
		</Grid>
	  )
	//   return (
	//   <List
	// 	sx={{ width: '100%', bgcolor: 'transparent' }}
	// 	component="nav"
	// 	aria-labelledby="nested-list-subheader"
	// 	>
	// 		{lists.filter(l=>l.components.length > 0).map(l=>(
	// 			<>
	// 			<ListItemButton onClick={()=>open!==l.label ? setOpen(l.label): setOpen('')}>
	// 				<ListItemIcon>
	// 				 {l.image && <Image src={l.image} alt={l.label} width={25} height={25}/>}
	// 				 {l.icon && <Icon style={{backgroundColor: "transparent", color: "#2D5986"}} path={l.icon} size={1}/>}
	// 				</ListItemIcon>
	// 				<ListItemText primary={l.label} />
	// 				{open===l.label ? <ExpandLess /> : <ExpandMore />}
	// 			</ListItemButton>
	// 			<Collapse in={open===l.label} timeout="auto" unmountOnExit>
	// 				<List component="div" disablePadding>
	// 					{l.components}
	// 				</List>
	// 			</Collapse>
	// 			</>
	// 		))}
	// 		{loading && 
	// 			<ListItemButton>
	// 				<ListItemIcon>
	// 					<Icon path={mdiTimerSand} style={{animation: "spin 2s linear infinite"}} size={1}/>
	// 				</ListItemIcon>
	// 				<ListItemText primary={"Contacting DeepDive 2..."} />
	// 			</ListItemButton>
	// 		}
	// </List>
    
	// )
}
}
