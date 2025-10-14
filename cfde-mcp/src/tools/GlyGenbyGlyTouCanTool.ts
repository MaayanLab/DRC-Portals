import { z } from "zod";
import { get_playbook_description } from "./utils.js";

const GlyGenbyGlyTouCan = [
  "GlyGenbyGlyTouCan",
  {
    title: "GlyGenbyGlyTouCan",
    description: "Runs a client side function that find information about a given glycan such as G17689DH or a similarly formatted glycan id",
    inputSchema: {
        "glycan": z.string().optional().describe("glycan to be analyzed.")
    },
    outputSchema: {
        "function": z.string().describe("Function to run"),
        "inputType": z.string().describe("The type of input"),
        "methods": z.array(z.string()).describe("Methods describing the workflow"),
        "glycan": z.string().optional().nullable().describe("glycan to be analyzed.")
    }
  },
  async ({glycan}: {glycan: string}) => {
    const body = {
        "data": {
            "80ca332c-4217-2216-055e-888b992453f4": {
                "type": "Input[glycan]",
                "value": glycan
            }
        },
        "workflow": [
            {
                "id": "c8e46e25-17f7-b6d8-fd98-9447e7bc3542",
                "type": "Input[glycan]",
                "data": {
                    "id": "80ca332c-4217-2216-055e-888b992453f4"
                }
            },
            {
                "id": "f5412429-c51f-5cbc-2201-ceaf153d1afd",
                "type": "GlycanInformation",
                "inputs": {
                    "glycan": {
                        "id": "c8e46e25-17f7-b6d8-fd98-9447e7bc3542"
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
              function: "GlyGenbyGlyTouCan",
              inputType: "GlycanInput",
              methods: methods.usability_domain || [],
              glycan
          })
        }
      ],
      structuredContent: {
          function: "GlyGenbyGlyTouCan",
          inputType: "GlycanInput",
          methods: methods.usability_domain || [],
          glycan
      }
    }
  }
]


export default GlyGenbyGlyTouCan;