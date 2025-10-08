import { z } from "zod";

const ARCHS4GeneExpression = [
  "ARCHS4GeneExpression",
  {
    title: "ARCHS4GeneExpression",
    description: "Z-scored gene expression across tissues from ARCHS4. Takes a single gene as an input",
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
            "function": "ARCHS4GeneExpression",
            geneSymbol
        })
      }
    ],
    structuredContent: {
        "function": "ARCHS4GeneExpression",
        geneSymbol
    }
  }
  }
]


export default ARCHS4GeneExpression;