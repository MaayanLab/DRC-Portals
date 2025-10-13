import { z } from "zod";

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
        "output_text": z.string().describe("What will be done in the client side. Add this in the response."),
        "geneSymbol": z.string().optional().nullable().describe("Gene symbol")
    }
  },
  async ({geneSymbol}: {geneSymbol: string}) => {
    return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
            function: "KidsFirstTumorExpr",
            inputType: "GeneInput",
            output_text: "I can run a function that returns gene expression in tumors for a gene from Kids First Open Pediatric Cancer Atlas API",
            geneSymbol
        })
      }
    ],
    structuredContent: {
        function: "KidsFirstTumorExpr",
        inputType: "GeneInput",
        output_text: "I can run a function that returns gene expression in tumors for a gene from Kids First Open Pediatric Cancer Atlas API",
        geneSymbol
    }
  }
  }
]


export default KidsFirstTumorExpr;