import { z } from "zod";
import { get_playbook_description } from "./utils.js";

const KidsFirstTumorExpr = [
  "KidsFirstTumorExpr",
  {
    title: "KidsFirstTumorExpr",
    description: "Runs a client side function that returns gene expression in tumors for a gene from Kids First Open Pediatric Cancer Atlas API",
    inputSchema: {
        "geneSymbol": z.string().optional().describe("Gene symbol")
    },
    outputSchema: {
        "function": z.string().describe("Function to run"),
        "inputType": z.string().describe("The type of input"),
        "methods": z.record(z.string(), z.any()).describe("Methods describing the workflow"),
        "geneSymbol": z.string().optional().nullable().describe("Gene symbol")
    }
  },
  async ({geneSymbol}: {geneSymbol: string}) => {
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
                "id": "2b24d6a3-492d-23d3-d69d-d28b5943ab87",
                "type": "KFTumorExpressionFromGene",
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
              function: "KidsFirstTumorExpr",
              inputType: "GeneInput",
              methods,
              geneSymbol
          })
        }
      ],
      structuredContent: {
          function: "KidsFirstTumorExpr",
          inputType: "GeneInput",
          methods,
          geneSymbol
      }
    }
  }
]


export default KidsFirstTumorExpr;