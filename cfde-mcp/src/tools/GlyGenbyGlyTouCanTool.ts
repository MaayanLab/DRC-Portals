import { z } from "zod";

const GlyGenbyGlyTouCan = [
  "GlyGenbyGlyTouCan",
  {
    title: "GlyGenbyGlyTouCan",
    description: "Find information about a given glycan such as G17689DH or a similarly formatted glycan id",
    inputSchema: {
        "glycan": z.string().optional().describe("glycan to be analyzed.")
    },
    outputSchema: {
        "function": z.string().describe("Function to run"),
        "glycan": z.string().optional().nullable().describe("glycan to be analyzed.")
    }
  },
  async ({glycan}: {glycan: string}) => {
    return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
            "function": "GlyGenbyGlyTouCan",
            glycan
        })
      }
    ],
    structuredContent: {
        "function": "GlyGenbyGlyTouCan",
        glycan
    }
  }
  }
]


export default GlyGenbyGlyTouCan;