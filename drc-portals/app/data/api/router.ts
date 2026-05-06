import { procedure, router } from '@/lib/trpc'
import { z } from 'zod'
import { getGeneSet } from '../processed/_analyze'

const METADATA_API = "https://maayanlab.cloud/sigcom-lincs/metadata-api/"

const fetchSigComLincsId = async (geneset: string[], genesetDown: string[], useUpDown: boolean, description?: string) => {
	const url = METADATA_API + "entities/find"

	if (useUpDown) {
		const input_gene_set = {
			"up_genes": geneset,
			"down_genes": genesetDown
		}
	
		const allGenes = input_gene_set["up_genes"].concat(input_gene_set["down_genes"])
	
		const payload = {
			filter: {
				where: {
					"meta.symbol": {
						inq: allGenes
					}
				},
				fields: ["id", "meta.symbol"]
			}
		}
	
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
		})
	
		const entities: any = await res.json()
	
		const upEntities: string[] = []
		const downEntities: string[] = []
		const forEnrichment = {
			"up_entities": upEntities,
			"down_entities": downEntities
		}
		entities.forEach((e: any) => {
			const symbol = e["meta"]["symbol"]
			if (geneset.includes(symbol)) 
				forEnrichment.up_entities.push(e.id)
			else if (genesetDown.includes(symbol))
				forEnrichment.down_entities.push(e.id)
				
		})

		const payload2 = {
			"meta": {
				"$validator": "/dcic/signature-commons-schema/v6/meta/user_input/user_input.json",
				...forEnrichment,
				description
			},
			"type": "signatures"
		}
	
		const res2 = await fetch(METADATA_API + "user_input", {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload2),
		})
	
		const persistentId = await res2.json()
	
		return (`https://maayanlab.cloud/sigcom-lincs/#/SignatureSearch/Rank/${persistentId.id}`)
	} else {
		const input_gene_set = {
			"genes": geneset,
		}

		const allGenes = input_gene_set["genes"]

		const payload = {
			filter: {
				where: {
					"meta.symbol": {
						inq: allGenes
					}
				},
				fields: ["id", "meta.symbol"]
			}
		}

		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
		})

		const entities = await res.json()

		const entitiyList : string[] = [];

		const forEnrichment = {
			"entities": entitiyList,
			"signatures": [],
			"offset": 0,
			"limit": 0
		}
		for (const e of entities) {
			if (forEnrichment.entities.indexOf(e.id) === -1) {
				forEnrichment.entities.push(e.id)
			}
		}
		const payload2 = {
			"meta": {
				"$validator": "/dcic/signature-commons-schema/v6/meta/user_input/user_input.json",
				...forEnrichment,
				description
			},
			"type": "signatures"
		}
	
		const res2 = await fetch(METADATA_API + "user_input", {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload2),
		})
	
		const persistentId = await res2.json()
	
		return (`https://maayanlab.cloud/sigcom-lincs/#/SignatureSearch/Set/${persistentId.id}`)
	}
}

const perturbseqr_resolve_id = async (gene_set: string[], up: boolean, url: string) => {
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

const addList = async (description:string, gene_set: string[] ) => {
		try {
			const formData = new FormData();
			const gene_list = gene_set.join("\n")	
			formData.append('list', gene_list)
			formData.append('description', description)
			const vals:{userListId:string, shortId:string} = await (
					await fetch(`${process.env.NEXT_PUBLIC_ENRICHR_URL}/addList`, {
						method: 'POST',
						body: formData,
					})
				).json()
			return vals
		} catch (error) {
			console.error(error)
		}
		return {}
	}

const fetchList = async (userListId: number ) => {
		const res = await fetch(`https://maayanlab.cloud/Enrichr/view?userListId=${userListId}`)
		const {genes, description} =  await res.json()
		return {genes, description}
	}
const gse_query = (userListId: number) => (
	JSON.stringify({
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
)
export default router({
  entity_links: procedure.input(
	  z.object({
		// lastEventId is the last event id that the client has received
		// On the first call, it will be whatever was passed in the initial setup
		// If the client reconnects, it will be the last event id that the client received
		// The id is the createdAt of the post
		input: z.array(z.object({
			entity: z.string(),
			label: z.string()
		})),
	  }),
	)
	.mutation(async (props) => {
	  // `props.signal` is an AbortSignal that will be aborted when the client disconnects.
	  const {input} = props.input
	//   const results: Array<{entity: string, label: string, resource: string, link: string}> = []
	  const results: {[key:string]: {[key:string]: {resource: string, description: string, link: string}[]}} = {}
	  for (const i of input) {
		if (i.entity !== "gene_set") {
			if (['gene', 'variant', 'disease', 'drug'].indexOf(i.entity) > -1) {
				if (results[i.entity] === undefined) results[i.entity] = {}
				try {
					const req = await fetch(`https://api.biomarkerkb.org/biomarker/search_simple?query={"operation":"AND","query_type":"biomarker_search_simple","term":"${i.label}","term_category":"any"}`)
					const res = await (req.json())
					if (res.list_id !== "") {
						if (results[i.entity][i.label] === undefined) results[i.entity][i.label] = []
						results[i.entity][i.label].push({
							...i,
							description: i.label,
							resource: "biomarker-kb",
							link: `https://biomarkerkb.org/biomarker-list/${res.list_id}`
						})
					}	
				} catch (error) {
					console.error(error)
				}
				 
			} if (i.entity === 'gene') {
				if (results[i.entity] === undefined) results[i.entity] = {}
				if (results[i.entity][i.label] === undefined) results[i.entity][i.label] = []
				results[i.entity][i.label].push({
					...i,
					description: i.label,
					resource: "dd-kg",
					link: `https://dd-kg-ui.cfde.cloud/?filter={"start":"Gene","start_field":"label","start_term":"${i.label}"}`
				})
			} else if (i.entity === 'drug') {
				if (results[i.entity] === undefined) results[i.entity] = {}
				try {
					const r = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${i.label}/JSON`)
					const res = await r.json()
					if (res.PC_Compounds) {
						const cid = res.PC_Compounds[0].id.id.cid
						const r1 = await fetch(`https://dd-kg-ui.cfde.cloud/api/knowledge_graph?filter={"start":"Compound","start_field":"PUBCHEM","start_term":"${cid}"}`)
						const res1 = await r1.json()
						if (res1.nodes.length > 0) {
							if (results[i.entity][i.label] === undefined) results[i.entity][i.label] = []
							results[i.entity][i.label].push({
								...i,
								description: i.label,
								resource: "dd-kg",
								link: `https://dd-kg-ui.cfde.cloud/?filter={"start":"Compound","start_field":"PUBCHEM","start_term":"${cid}"}`
							})
						}
					}	
				} catch (error) {
					console.error(error)	
				}
				
			} else if (i.entity === 'anatomy') {
				if (results[i.entity] === undefined) results[i.entity] = {}
				try {
					const r = await fetch(`https://www.ebi.ac.uk/ols4/api/search?q=${i.label}&ontology=uberon`)
					const res = await r.json()
					const id = res.response.docs[0].obo_id.split(":")[1]
					const r1 = await fetch(`https://dd-kg-ui.cfde.cloud/api/knowledge_graph?filter={"start":"Anatomy","start_field":"UBERON","start_term":"${id}.0"}`)
					const res1 = await r1.json()
					if (res1.nodes.length > 0) {
						if (results[i.entity][i.label] === undefined) results[i.entity][i.label] = []
						results[i.entity][i.label].push({
							...i,
							description: i.label,
							resource: "dd-kg",
							link: `https://dd-kg-ui.cfde.cloud/?filter={"start":"Anatomy","start_field":"UBERON","start_term":"${id}.0"}`
						})	
					}
				} catch (error) {
					console.error(error)
				}
				
			}
		}
	  }
	  return results
  }),
    submit_gene_set: procedure.input(
	  z.object({
		// lastEventId is the last event id that the client has received
		// On the first call, it will be whatever was passed in the initial setup
		// If the client reconnects, it will be the last event id that the client received
		// The id is the createdAt of the post
		input: z.object({
                gene_set: z.array(z.string()).optional().describe("Input gene set for single gene sets"),
				up_gene_set: z.array(z.string()).optional().describe("Input up gene set for querying up and down gene sets"),
                down_gene_set: z.array(z.string()).optional().describe("Input down gene set for querying up and down gene sets")
            }),
		description: z.string(),
	  }),
	)
	.mutation(async (props) => {
	  // `props.signal` is an AbortSignal that will be aborted when the client disconnects.
	  const {input, description} = props.input
	  if (input?.gene_set) {
		const res:{[key: string]: string} = await addList(description, input.gene_set || [])
		return {
			gene_set_id: res.userListId,
			description
		}
	} else if (input?.up_gene_set && input?.down_gene_set) {
		const res_up:{[key: string]: string} = await addList(description + " up", input.up_gene_set || [])
		const res_down:{[key: string]: string} = await addList(description+ " down", input.down_gene_set || [])
		return {
			up_gene_set_id: res_up.userListId,
			down_gene_set_id: res_down.userListId,
			description
		}
	}
	else return {}
  }),
  send_gene_set: procedure.input(
	  z.object({
		// lastEventId is the last event id that the client has received
		// On the first call, it will be whatever was passed in the initial setup
		// If the client reconnects, it will be the last event id that the client received
		// The id is the createdAt of the post
		description: z.string(),
		input: z.object({
                gene_set_id: z.number().optional().describe("Input gene set id for single gene sets"),
				up_gene_set_id: z.number().optional().describe("Input up gene set id for querying up and down gene sets"),
                down_gene_set_id: z.number().optional().describe("Input down gene set id for querying up and down gene sets")
            }),
	  }),
	)
	.mutation(async (props) => {
	  // `props.signal` is an AbortSignal that will be aborted when the client disconnects.
	  const url = 'https://perturbseqr.maayanlab.cloud/'
	  const {input, description} = props.input
	  console.log(input, description)
	  if (input?.gene_set_id) {
		const {genes: gene_set} = await fetchList(input.gene_set_id)
		const sigcom_promise: Promise<string> = fetchSigComLincsId(gene_set || [], [], false, description)
		const perturbseqr_promise: Promise<string> = perturbseqr_resolve_id(gene_set || [], true, url)
		const [sigcom_lincs, perturbseqr] = await Promise.all([sigcom_promise, perturbseqr_promise])
		return [
			{
				"resource": "gse",
				description,
				link: `/data/enrichment?q=${gse_query(input.gene_set_id)}`,
			},
			{
				"resource": "sigcom-lincs",
				description,
				link: sigcom_lincs
			},
			{
				"resource": "perturbseqr",
				description,
				link: `${url}enrich?dataset=${perturbseqr}`
			},
			
		]
	} else if (input?.up_gene_set_id && input?.down_gene_set_id) {
		const {genes: up_gene_set} = await fetchList(input.up_gene_set_id)
		const {genes: down_gene_set} = await fetchList(input.down_gene_set_id)
		
		const sigcom_promise: Promise<string> = fetchSigComLincsId(up_gene_set || [], down_gene_set || [], true, description.slice(0, description.length - 3))
		const perturbseqr_up_promise: Promise<string> = perturbseqr_resolve_id(up_gene_set || [], true, url)
		const perturbseqr_down_promise: Promise<string> = perturbseqr_resolve_id(down_gene_set || [], false, url)
		const [sigcom_lincs, perturbseqr_up, perturbseqr_down] = await Promise.all([sigcom_promise, perturbseqr_up_promise, perturbseqr_down_promise])
		return [
			{
				"resource": "gse",
				description: description + " up",
				link: `/data/enrichment?q=${gse_query(input.up_gene_set_id)}`,
			},
			{
				"resource": "gse",
				description: description + " down",
				link: `/data/enrichment?q=${gse_query(input.down_gene_set_id)}`,
			},
			{
				"resource": "sigcom-lincs",
				description,
				link: sigcom_lincs
			},
			{
				"resource": "perturbseqr",
				description,
				link: `${url}enrichpair?dataset=${perturbseqr_up}&dataset=${perturbseqr_down}`
			},
		]
	}
	else return []
	}),
	gene_set: procedure.input(
	  z.object({
		// lastEventId is the last event id that the client has received
		// On the first call, it will be whatever was passed in the initial setup
		// If the client reconnects, it will be the last event id that the client received
		// The id is the createdAt of the post
		id: z.string(),
	  }),
	)
	.query(async (props) => {
		const {id} = props.input
		if (id === '') return []
		const gene_set = getGeneSet(id)
		return gene_set
	}),
	ontology: procedure.input(
		z.object({
			term: z.string(),
			facet: z.string(),
		})
	)
	.query(async (props)=>{
		const {term, facet} = props.input
		const ontologies:{[key:string]: string} = {
			anatomy: "uberon",
			disease: "mondo",
			assay: "edam",
			drug: "chebi"
		}
		if (term.length < 3) return []
		else if (facet === "gene") {
			const prom1 = fetch(`https://clinicaltables.nlm.nih.gov/api/genes/v4/search?df=symbol&terms=${term}`)
			const prom2 = fetch(`https://clinicaltables.nlm.nih.gov/api/variants/v4/search?df=dbSNP&terms=${term}`)
			const [res1, res2] = await Promise.all([prom1, prom2])
			const entities:Array<{type: string, a_label: string}> = []
			for (const e of (await res1.json())[3]) {
				const g:string = e[0]
				if (g!=='') entities.push({type: "gene", a_label: g})
			}
			for (const e of (await res2.json())[3]) {
				const g:string = e[0]
				if (g!=='') entities.push({type: "variant", a_label: g})
			}
			return entities
		}
		else if (facet === "drug" || facet === "metabolite") {
			const p = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/Compound/${term}/JSON`)
			// const [res1, res2] = await Promise.all([prom1, prom2])
			const res = await p.json()
			const results = res?.dictionary_terms?.compound.map((a_label:string)=>({type: facet, a_label}))
			return results
		}
		else if (ontologies[facet] === undefined) return []
		else {
			const res = await fetch(`https://www.ebi.ac.uk/ols4/api/suggest?ontology=${ontologies[facet]}&q=${term}`)
			const entities: any = await res.json()
			if (entities?.response?.docs.length > 0) {
				return entities.response.docs.map((i:any)=>({type: facet, a_label: i.autosuggest as string}))
			} else return []
		}
	}),
	runDeepDive: procedure.input(
	  z.object({
			methods: z.string(),
			payload: z.any()
		}),
	)
	.mutation(async (props) => {
		const {methods, payload} = props.input
		if (typeof methods === 'undefined' || methods === '') {
			return [{error: `invalid method ${methods}`}]
		}
		if (methods === 'runRunnable') {
			const res = await fetch(`${process.env.DEEPDIVE_URL}/${methods}?batch=1`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Token ${process.env.DEEPDIVE_TOKEN}`
				},
				body: JSON.stringify(payload),
			})
			if (res.statusText !== 'OK') {
				return [{error: await res.text()}]
			} else {
				return await res.json() as Array<any>
			}
		} else {
			const params = Object.entries(payload).map(([key, val])=>`${key}=${val}`).join("&")
			const res = await fetch(`${process.env.DEEPDIVE_URL}${methods}?${params}`,{
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Token ${process.env.DEEPDIVE_TOKEN}`
					}
				}
			)
			if (res.statusText !== 'OK') {
				return [{error: await res.text()}]
			} else {
				return await res.json() as Array<any>
			}
		}
	}),
	fetch_gene_set: procedure.input(
		z.array(z.number())
	)
	.query(async (props)=>{
		const ids = props.input
		const req: Array<Promise<{genes: string[], description: string}>> = []
		for (const id of ids) {
			req.push(fetchList(id))
		}
		const values:Array<{genes: string[], description: string}> = await Promise.all(req)
		return values
	}) 
});
