import { z } from "zod";

const GtexGeneExpression = [
  "GtexGeneExpression",
  {
    title: "GtexGeneExpression",
    description: "Runs a client side function that returns z-scored gene expression across tissues from GTEx. Takes a single gene as an input",
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
            function: "GtexGeneExpression",
            inputType: "GeneInput",
            output_text: "I can run a function that returns z-scored gene expression across tissues from GTEx.",
            geneSymbol
        })
      }
    ],
    structuredContent: {
        function: "GtexGeneExpression",
        inputType: "GeneInput",
        output_text: "I can run a function that returns z-scored gene expression across tissues from GTEx.",
        geneSymbol
    }
  }
  }
]


export default GtexGeneExpression;