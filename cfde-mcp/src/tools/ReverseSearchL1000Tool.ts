import { z } from "zod";

const ReverseSearchL1000 = [
  "ReverseSearchL1000",
  {
    title: "ReverseSearchL1000",
    description: "Runs a client side function that returns reverse search for L1000 drugs or crispr knockout genes",
    inputSchema: {
        "geneSymbol": z.string().optional().describe("Gene symbol"),
        "dir": z.enum(["up", "down", "both"]).optional().describe("Please pick a direction."),
        "perturb": z.enum(['drug', 'CRISPR']).optional().describe("Please pick a the type of signatures you are interested in.")
    },
    outputSchema: {
        "function": z.string().describe("Function to run"),
        "inputType": z.string().describe("The type of input"),
        "output_text": z.string().describe("What will be done in the client side. Add this in the response."),
        "geneSymbol": z.string().optional().nullable().describe("Gene symbol"),
        "dir": z.enum(["up", "down", "both"]).optional().nullable().describe("Please pick a direction."),
        "perturb": z.enum(['drug', 'CRISPR']).optional().nullable().describe("Please pick a the type of signatures you are interested in.")
    }
  },
  async ({geneSymbol, dir, perturb}: {geneSymbol: string, dir: "up" | "down" | "both", perturb: "drug" | "CRISPR"}) => {
    return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
            function: "ReverseSearchL1000",
            inputType: "GeneInput",
            output_text: "I can run a function that returns reverse search for L1000 drugs or crispr knockout genes",
            geneSymbol,
            dir,
            perturb
        })
      }
    ],
    structuredContent: {
        function: "ReverseSearchL1000",
        inputType: "GeneInput",
        output_text: "I can run a function that returns reverse search for L1000 drugs or crispr knockout genes",
        geneSymbol,
        dir,
        perturb
    }
  }
  }
]


export default ReverseSearchL1000;