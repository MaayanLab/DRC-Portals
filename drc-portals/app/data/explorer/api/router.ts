import { procedure, router } from '@/lib/trpc'
import { z } from 'zod'
import { getGeneSet } from '../../processed/_analyze'

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

const gse_query = (userListId: string) => (
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
  send_gene_set: procedure.input(
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
	  const url = 'https://perturbseqr.maayanlab.cloud/'
	  const {input, description} = props.input
	  const requests: Promise<{[key: string]: string} | string>[] = []
	  if (input?.gene_set) {
		const enrichr_promise: Promise<{[key: string]: string}> = addList(description, input.gene_set || [])
		const sigcom_promise: Promise<string> = fetchSigComLincsId(input.gene_set || [], [], false, description)
		const perturbseqr_promise: Promise<string> = perturbseqr_resolve_id(input.gene_set || [], true, url)
		const [enrichr, sigcom_lincs, perturbseqr] = await Promise.all([enrichr_promise, sigcom_promise, perturbseqr_promise])
		return [
			{
				"resource": "enrichr",
				description,
				link: `https://maayanlab.cloud/Enrichr/enrich?dataset=${enrichr.shortId || ''}` 
			},
			{
				"resource": "gse",
				description,
				link: `/data/enrichment?q=${gse_query(enrichr.userListId)}`,
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
	} else if (input?.up_gene_set && input?.down_gene_set) {
		const enrichr_up_promise: Promise<{[key: string]: string}> = addList(description + " up", input.up_gene_set || [])
		const enrichr_down_promise: Promise<{[key: string]: string}> = addList(description + " down", input.down_gene_set || [])
		const sigcom_promise: Promise<string> = fetchSigComLincsId(input.up_gene_set || [], input.down_gene_set || [], true, description)
		const perturbseqr_up_promise: Promise<string> = perturbseqr_resolve_id(input.up_gene_set || [], true, url)
		const perturbseqr_down_promise: Promise<string> = perturbseqr_resolve_id(input.down_gene_set || [], false, url)
		const [enrichr_up, enrichr_down, sigcom_lincs, perturbseqr_up, perturbseqr_down] = await Promise.all([enrichr_up_promise, enrichr_down_promise, sigcom_promise, perturbseqr_up_promise, perturbseqr_down_promise])
		return [
			{
				"resource": "enrichr",
				description: description + " up",
				link: `https://maayanlab.cloud/Enrichr/enrich?dataset=${enrichr_up.shortId || ''}` 
			},
			{
				"resource": "enrichr",
				description: description + " down",
				link: `https://maayanlab.cloud/Enrichr/enrich?dataset=${enrichr_down.shortId || ''}` 
			},
			{
				"resource": "gse",
				description: description + " up",
				link: `/data/enrichment?q=${gse_query(enrichr_up.userListId)}`,
			},
			{
				"resource": "gse",
				description: description + " down",
				link: `/data/enrichment?q=${gse_query(enrichr_down.userListId)}`,
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
	else return ''
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
	})
});
