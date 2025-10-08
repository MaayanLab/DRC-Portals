import { z } from "zod";

const RegElementSetInfo = [
  "RegElementSetInfo",
  {
    title: "RegElementSetInfo",
    description: "Runs a client side function that returns find regulatory elements that regulate a given gene",
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
            function: "RegElementSetInfo",
            inputType: "GeneInput",
            output_text: "I can run a function that returns find regulatory elements that regulate a given gene",
            geneSymbol
        })
      }
    ],
    structuredContent: {
        function: "RegElementSetInfo",
        inputType: "GeneInput",
        output_text: "I can run a function that returns find regulatory elements that regulate a given gene",
        geneSymbol
    }
  }
  }
]


export default RegElementSetInfo;