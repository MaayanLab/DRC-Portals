import { z } from "zod";

const ImpcPhenotypes = [
  "ImpcPhenotypes",
  {
    title: "ImpcPhenotypes",
    description: "Mouse phenotypes significantly associated with a gene",
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
            "function": "ImpcPhenotypes",
            geneSymbol
        })
      }
    ],
    structuredContent: {
        "function": "ImpcPhenotypes",
        geneSymbol
    }
  }
  }
]


export default ImpcPhenotypes;