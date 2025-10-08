import { z } from "zod";

const GtexGeneExpression = [
  "GtexGeneExpression",
  {
    title: "GtexGeneExpression",
    description: "Z-scored gene expression across tissues from GTEx. Takes a single gene as an input",
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
            "function": "GtexGeneExpression",
            geneSymbol
        })
      }
    ],
    structuredContent: {
        "function": "GtexGeneExpression",
        geneSymbol
    }
  }
  }
]


export default GtexGeneExpression;