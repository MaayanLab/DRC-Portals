import { z } from "zod";

const RegElementSetInfo = [
  "RegElementSetInfo",
  {
    title: "RegElementSetInfo",
    description: "Find regulatory elements that regulate a given gene",
    inputSchema: {
        "geneSymbol": z.string().optional().describe("Gene symbol")
    },
    outputSchema: {
        "function": z.string().describe("Function to run"),
        "geneSymbol": z.string().optional().nullable().describe("Gene symbol")
    }
  },
  async ({geneSymbol}: {geneSymbol: string}) => {
    return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
            "function": "RegElementSetInfo",
            geneSymbol
        })
      }
    ],
    structuredContent: {
        "function": "RegElementSetInfo",
        geneSymbol
    }
  }
  }
]


export default RegElementSetInfo;