import { z } from "zod";

const ImpcPhenotypes = [
  "ImpcPhenotypes",
  {
    title: "ImpcPhenotypes",
    description: "Runs a client side function that returns mouse phenotypes significantly associated with a gene",
    inputSchema: {
        "geneSymbol": z.string().optional().describe("Gene symbol")
    },
    outputSchema: {
    "function": z.string().describe("Function to run"),
        "geneSymbol": z.string().optional().nullable().describe("Gene symbol"),
        "inputType": z.string().describe("The type of input"),
        "output_text": z.string().describe("What will be done in the client side. Add this in the response."),
    }
  },
  async ({geneSymbol}: {geneSymbol: string}) => {
    return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
            function: "ImpcPhenotypes",
            inputType: "GeneInput",
            output_text: "I can run a function that returns mouse phenotypes significantly associated with a gene",
            geneSymbol
        })
      }
    ],
    structuredContent: {
        function: "ImpcPhenotypes",
        inputType: "GeneInput",
        output_text: "I can run a function that returns mouse phenotypes significantly associated with a gene",
        geneSymbol
    }
  }
  }
]


export default ImpcPhenotypes;