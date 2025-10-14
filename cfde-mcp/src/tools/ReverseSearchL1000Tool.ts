import { z } from "zod";
import { get_playbook_description } from "./utils.js";

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
    outputSchema: {
        "function": z.string().describe("Function to run"),
        "inputType": z.string().describe("The type of input"),
        "methods": z.record(z.string(), z.any()).describe("Methods describing the workflow"),
        "geneSymbol": z.string().optional().nullable().describe("Gene symbol"),
        "dir": z.enum(["up", "down", "both"]).optional().nullable().describe("Please pick a direction."),
        "perturb": z.enum(['drug', 'CRISPR']).optional().nullable().describe("Please pick a the type of signatures you are interested in.")
    }
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
    const methods = await get_playbook_description(body)
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
              function: "ReverseSearchL1000",
              inputType: "GeneInput",
              methods,
              geneSymbol,
              dir,
              perturb
          })
        }
      ],
      structuredContent: {
          function: "ReverseSearchL1000",
          inputType: "GeneInput",
          methods,
          geneSymbol,
          dir,
          perturb
      }
    }
  }
]


export default ReverseSearchL1000;