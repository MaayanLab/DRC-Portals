import { z } from "zod";
import { fetch_playbook, get_playbook_description } from "./utils.js";

const getL100Sigs = async (gene: string, dir: string, perturb: string) => {
    const url = `https:///lincs-reverse-search-dashboard.dev.maayanlab.cloud/api/table/${perturb === 'drug' ? 'cp': 'xpr'}/${dir}/${gene}`

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
    }})
    if (!response.ok) {
        return Response.json({}, { status: response.status })
    }
    const tableDataJson = await response.json()
    return tableDataJson
};

const ReverseSearchL1000 = [
  "ReverseSearchL1000",
  {
    title: "ReverseSearchL1000",
    description: "Runs a client side function that returns reverse search for L1000 drugs or crispr knockout genes",
    inputSchema: {
        "geneSymbol": z.string().optional().describe("Gene symbol"),
        "dir": z.enum(["up", "down", "both"]).optional().describe("Please pick a direction."),
        "perturb": z.enum(['drug', 'CRISPR']).optional().describe("Please pick a the type of signatures you are interested in.")
    },
    // outputSchema: {
    //     "function": z.string().describe("Function to run"),
    //     "inputType": z.string().describe("The type of input"),
    //     "methods": z.array(z.string()).describe("Methods describing the workflow"),
    //     "geneSymbol": z.string().optional().nullable().describe("Gene symbol"),
    //     "dir": z.enum(["up", "down", "both"]).optional().nullable().describe("Please pick a direction."),
    //     "perturb": z.enum(['drug', 'CRISPR']).optional().nullable().describe("Please pick a the type of signatures you are interested in."),
    //     "id": z.string(),
    //     "output": z.array(z.looseObject({
    //                 id: z.string(),
    //               })).describe("Analysis returned by the Playbook Workflow Builder"),
    // }
  },
  async ({geneSymbol, dir, perturb}: {geneSymbol: string, dir: "up" | "down" | "both", perturb: "drug" | "CRISPR"}) => {
    const body = {
        "data": {
            "12c02bd3-f2ec-c719-533f-b1bb3b0170b7": {
                "type": "Input[Gene]",
                "value": geneSymbol
            }
        },
        "workflow": [
            {
                "id": "83efe773-027b-4f21-688d-b27555938a04",
                "type": "Input[Gene]",
                "data": {
                    "id": "12c02bd3-f2ec-c719-533f-b1bb3b0170b7"
                }
            },
            {
                "id": "ee9c0c69-347e-8eec-ea68-d2eb0e7925cd",
                "type": "LINCSL1000ReverseSearch",
                "inputs": {
                    "gene": {
                        "id": "83efe773-027b-4f21-688d-b27555938a04"
                    }
                }
            }
        ]
    }
    const {methods, output, id} = await fetch_playbook(body)
    const sigs: {[key:string]: any} = {}
    if (dir === "both") {
        sigs["up"] = await getL100Sigs(geneSymbol, "up", perturb)
        sigs["down"] = await getL100Sigs(geneSymbol, "up", perturb)
    }
    else {
        sigs[dir] = await getL100Sigs(geneSymbol, dir, perturb)
    }
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
              function: "ReverseSearchL1000",
              inputType: "GeneInput",
              methods: methods.usability_domain || [],
              geneSymbol,
              dir,
              perturb,
              output,
              id,
              sigs
          })
        }
      ],
      structuredContent: {
          function: "ReverseSearchL1000",
          inputType: "GeneInput",
          methods: methods.usability_domain || [],
          geneSymbol,
          dir,
          perturb,
          output,
          id,
           sigs
      }
    }
  }
]


export default ReverseSearchL1000;