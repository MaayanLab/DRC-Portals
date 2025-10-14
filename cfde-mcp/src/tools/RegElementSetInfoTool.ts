import { z } from "zod";
import { get_playbook_description } from "./utils.js";

const RegElementSetInfo = [
  "RegElementSetInfo",
  {
    title: "RegElementSetInfo",
    description: "Runs a client side function that returns find regulatory elements that regulate a given gene",
    inputSchema: {
        "geneSymbol": z.string().optional().describe("Gene symbol")
    },
    outputSchema: {
        "function": z.string().describe("Function to run"),
        "inputType": z.string().describe("The type of input"),
        "methods": z.array(z.string()).describe("Methods describing the workflow"),
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
                "id": "e6ed0549-fd80-0766-7e31-6193a5f16ecb",
                "type": "GetRegulatoryElementsForGeneInfoFromGene",
                "inputs": {
                    "gene": {
                        "id": "83efe773-027b-4f21-688d-b27555938a04"
                    }
                }
            },
            {
                "id": "bf5c1482-67e0-e8c9-be8a-84ff8941ace1",
                "type": "RegElementSetInfoFromRegElementTerm",
                "inputs": {
                    "regulatoryElementSet": {
                        "id": "e6ed0549-fd80-0766-7e31-6193a5f16ecb"
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
              function: "RegElementSetInfo",
              inputType: "GeneInput",
              methods: methods.usability_domain || [],
              geneSymbol
          })
        }
      ],
      structuredContent: {
          function: "RegElementSetInfo",
          inputType: "GeneInput",
          methods: methods.usability_domain || [],
          geneSymbol
      }
    }
  }
]


export default RegElementSetInfo;