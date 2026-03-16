import { z } from "zod";

const METADATA_API = "https://maayanlab.cloud/sigcom-lincs/metadata-api/"
const DATA_API = "https://maayanlab.cloud/sigcom-lincs/data-api/api/v1/"

const SigComLINCS = async (geneset: string[], genesetDown: string[], useUpDown: boolean) => {
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
                forEnrichment.up_entities.push(e["id"])
            else if (genesetDown.includes(symbol))
                forEnrichment.down_entities.push(e["id"])
        })

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

        entities.forEach((e: any) => forEnrichment.entities.push(e.id))
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
    
        return (`https://maayanlab.cloud/sigcom-lincs/#/SignatureSearch/Set/${persistentId.id}`)
    }
}

const sigComLincs = [
  "sigComLincs",
  {
    title: "sigComLincs",
    description: "Returns the LINCS L1000 small molecules and genetic perturbations that likely up- or down-regulate the expression of a gene set.",
    inputSchema: {},
    outputSchema: {
        function: z.string().describe("Function to run"),
        inputType: z.string().describe("The type of input"),
        methods: z.string().describe("Description of the workflow"),
    }
  },
  async () => {
    return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
            function: "sigComLincs",
            inputType: "GeneSetInput",
            methods: "Signature search to find mimicking and reversing signatures will be done using SigCom LINCS.",
            // up,
            // down
        })
      }
    ],
    structuredContent: {
        function: "sigComLincs",
        inputType: "GeneSetInput",
        methods: "Signature search to find mimicking and reversing signatures will be done using SigCom LINCS.",
        // up,
        // down
    }
  }
  }
]


export default sigComLincs;