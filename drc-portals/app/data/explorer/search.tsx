import Icon from "@mdi/react";
import { Grid, Button, Chip, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { router_push } from "../enrichment/utils";
import {  mdiHeadQuestionOutline, mdiHumanMaleBoard, mdiRobotOutline, mdiTextBoxCheckOutline } from '@mdi/js';


const getTaskId = async (method:string, input: {[key:string]: string}, controller: AbortController) => {
	const payload = {
	  '0': {
		method,
		input
	  }
	}
	const res = await fetch(`/data/explorer/api`, {
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

export const methods: {[key: string]: {label: string, icon: string}} = {
  DeepDive: {
	label: "DeepDive Summary",
	icon: mdiTextBoxCheckOutline
  },
  DeepDiveAgent: {
	label: "DeepDive with RAG Agent",
	icon: mdiRobotOutline
  },
  DeepDiveWithReviewer: {
	label: "Summarize with Review Process",
	icon: mdiHumanMaleBoard
  },
  DeepDiveHypothesis: {
	label: "Hypothesize Disease Connections",
	icon: mdiHeadQuestionOutline
  },
}


export const Search = ({inputList, update_input, applicables, getAbortController}: {update_input: Function, inputList: {entity: string, label: string, icon: string, values?: {[key: string]: string[]}}[], applicables: {method: string, params: {[key:string]: string}}[], getAbortController: Function}) => {
	const router = useRouter()
	const [controller, setController] = useState<AbortController | null>(null)
	const [loadingIndex, setLoadingIndex] = useState(-1)
	const get_controller = () => {
		if (controller) controller.abort()
		const c = new AbortController()
		setController(c)
		return c
	}
	
	const addList = async (description:string, input: {[key:string]: string[]}) => {
		try {
			const formData = new FormData();
			// const gene_list = geneStr.trim().split(/[\t\r\n;]+/).join("\n")
			const gene_list = (input.gene_set || input.up).join("\n")
			formData.append('list', gene_list)
			formData.append('description', description)
			const controller = get_controller()
			const {userListId}:{userListId:string} = await (
				await fetch(`${process.env.NEXT_PUBLIC_ENRICHR_URL}/addList`, {
					method: 'POST',
					body: formData,
					signal: controller.signal
				})
			).json()
			router_push(router, '/data/enrichment', {
				q: JSON.stringify({
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
			})
		} catch (error) {
			console.error(error)
		}
	}
	const run_runnable = async (method: string, input:{[key: string]:string}) => {
		const taskId = await getTaskId(method, input, getAbortController())
		if (taskId !== '') router_push(router, `/data/explorer/article/${taskId}`, {})
	}
	if (inputList.length === 0) return null
	else {
		const searches = inputList.map((i, ind)=>(
				<Grid item key={i.label}>
					{i.entity !== 'gene_set' ? <Chip sx={{borderRadius: 0}} key={i.label} color='secondary' variant="outlined"
						label={`Search CFDE Workbench for ${i.label}`}
						avatar={<Icon style={{backgroundColor: "transparent", color: "#2D5986"}} path={i.icon} size={1}/>}
						onClick={()=>{
							setLoadingIndex(ind)
							router_push(router, `/data/processed/search/${i.label}/${i.entity}`, {})
						}}
						onDelete={()=>update_input(i.entity, i.label, 'remove')}
						disabled={loadingIndex!==-1}
					/>:
					<Chip sx={{borderRadius: 0}} key={i.label} color='secondary' variant="outlined"
						avatar={<Icon style={{backgroundColor: "transparent", color: "#2D5986"}} path={i.icon} size={1}/>}
						onClick={()=>{
							setLoadingIndex(ind)
							addList(i.label, i.values || {})}
						}
						label={`Perform Enrichment on ${i.label} using CFDE Gene Sets`}
						onDelete={()=>update_input(i.entity, i.label, 'remove')}
						disabled={loadingIndex!==-1}
					/>
					}
					{loadingIndex === ind && (
						<CircularProgress
							size={24}
							sx={{
							position: 'absolute',
							top: '50%',
							left: '50%',
							marginTop: '-12px',
							marginLeft: '-12px',
							}}
						/>
					)}
				</Grid>
			))
		const runs = applicables.map(a=>(
        <Grid item key={a.method}>
          <Chip sx={{borderRadius: 0}} color='secondary' variant="outlined"
              avatar={<Icon style={{backgroundColor: "transparent", color: "#2D5986"}} path={methods[a.method].icon} size={1}/>}
              onClick={()=>{
                run_runnable(a.method, a.params)
              }}
              label={methods[a.method].label}
              clickable
            />
        </Grid>
      ))
	  return [...searches, ...runs]
    
	}
}
