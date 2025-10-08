import { z } from "zod";

const KidsFirstTumorExpr = [
  "KidsFirstTumorExpr",
  {
    title: "KidsFirstTumorExpr",
    description: "Gene expression in tumors for a gene from Kids First Open Pediatric Cancer Atlas API",
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
            "function": "KidsFirstTumorExpr",
            geneSymbol
        })
      }
    ],
    structuredContent: {
        "function": "KidsFirstTumorExpr",
        geneSymbol
    }
  }
  }
]


export default KidsFirstTumorExpr;