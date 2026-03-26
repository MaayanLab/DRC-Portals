import { lte, z } from "zod";

const METADATA_API = "https://maayanlab.cloud/sigcom-lincs/metadata-api/"
const DATA_API = "https://maayanlab.cloud/sigcom-lincs/data-api/api/v1/"

const converter: {[key:string]: string} = {
    gene_set: "entities",
    up_gene_set: "up_entities",
    down_gene_set: "down_entities"
}
const getPersistentUrl = async (input: {gene_set?:string[], up_gene_set?: string[], down_gene_set?: string[]}) => {
    const url = METADATA_API + "entities/find"
    const up_down = input.up_gene_set !== undefined
    const all_genes:string[] = []
    const mapper:{[key:string]: string} = {}
    for (const [k,v] of Object.entries(input)) {
        for (const i of v) {
            all_genes.push(i)
            mapper[i] = converter[k]
        }
    }

    const payload = {
        filter: {
            where: {
                "meta.symbol": {
                    inq: all_genes
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

    const converted = await res.json()
    const forEnrichment:{[key:string]: any} = {}
    for (const i of converted) {
        const loc = mapper[i.meta.symbol]
        if (forEnrichment[loc] === undefined) forEnrichment[loc] = []
        forEnrichment[loc].push(i.id)
    }

    const payload2 = {
            "meta": {
                "$validator": "/dcic/signature-commons-schema/v6/meta/user_input/user_input.json",
                ...forEnrichment
            },
            "type": "signature"
        }
    
    const res2 = await fetch(METADATA_API + "user_input", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload2),
    })

    const persistentId = await res2.json()
    const share_url = `https://maayanlab.cloud/sigcom-lincs/#/SignatureSearch/${up_down ? "Rank": "Set"}/${persistentId.id}`
    return {share_url, forEnrichment}
}

const SignatureSearch = async (for_enrichment: {[key:string]: string[]}, database: string) => {
    const payload = {
        ...for_enrichment,
        database,
        limit: 50,
    }
    const up_down = for_enrichment.up_entities !== undefined
    const res = await fetch(DATA_API + `enrich/${up_down? "ranktwosided": "rank"}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })
    const results = await res.json()
    const uuids = []
    const sigs: {[key:string]: any} = {}
    for (const i of results["results"]) {
        const {uuid, ...scores} = i
        i["z-down"] = -i["z-down"]
        i["direction-down"] = -i["direction-down"]
        sigs[uuid] = {...scores, "z-down": -scores["z-down"], "direction-down": -scores["direction-down"]}
        uuids.push(uuid)
    }
    const payload2 = {
        "filter": {
            "where": {
                "id": {
                    "inq": uuids
                }
            }
        }
    }
    const res2 = await fetch(METADATA_API + `signatures/find`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload2),
    })
    const signatures = await res2.json()
    for (const i of signatures) {
        i["scores"] = sigs[i.id]
    }
    return signatures.sort((a:any,b:any)=>(a.scores.rank - b.scores.rank))
}

const sigComLincs = [
  "sigComLincs",
  {
    title: "sigComLincs",
    description: "Returns the LINCS L1000 small molecules and genetic perturbations that likely up- or down-regulate the expression of a gene set.",
    inputSchema: {
        input: z.union([
            z.object({
                gene_set: z.array(z.string()).describe("Input gene set for single gene sets")
            }),
            z.object({
                up_gene_set: z.array(z.string()).describe("Input up gene set for querying up and down gene sets"),
                down_gene_set: z.array(z.string()).describe("Input down gene set for querying up and down gene sets")
            }),
    ]).describe("Input gene sets for signature search. Can either be a single gene set or an up and a down gene set")},
    // outputSchema: {
    //     function: z.string().describe("Function to run"),
    //     inputType: z.string().describe("The type of input"),
    //     methods: z.string().describe("Description of the workflow"),
    // }
  },
  async ({input}: {input: {gene_set?:string[], up_gene_set?:string[], down_gene_set?:string[]}}) => {
    const result = await getPersistentUrl(input)
    const CRISPR_KO_signatures = await SignatureSearch(result.forEnrichment, 'l1000_xpr')
    const Chemical_Perturbation_signatures = await SignatureSearch(result.forEnrichment, 'l1000_cp')
    return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
            function: "sigComLincs",
            inputType: "GeneSetInput",
            methods: "Signature search to find mimicking and reversing signatures will be done using SigCom LINCS.",
            share_url: result.share_url,
            CRISPR_KO_signatures,
            Chemical_Perturbation_signatures,
            // up,
            // down
        })
      }
    ],
    structuredContent: {
        function: "sigComLincs",
        inputType: "GeneSetInput",
        methods: "Signature search to find mimicking and reversing signatures will be done using SigCom LINCS.",
        share_url: result.share_url,
        CRISPR_KO_signatures,
        Chemical_Perturbation_signatures,
        // up,
        // down
    }
  }
  }
]


export default sigComLincs;