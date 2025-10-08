import { z } from "zod";

const sigComLincs = [
  "sigComLincs",
  {
    title: "sigComLincs",
    description: "Runs a client side function that returns the LINCS L1000 small molecules and genetic perturbations that likely up- or down-regulate the expression of the input gene set.",
    inputSchema: {
        "geneset": z.string().optional().nullable().describe("Gene set to be analyzed."),
        "up": z.string().optional().nullable().describe("Up-regulated genes."),
        "down": z.string().optional().nullable().describe("Down-regulated genes.")
    },
    outputSchema: {
        "function": z.string().describe("Function to run"),
        "inputType": z.string().describe("The type of input"),
        "output_text": z.string().describe("What will be done in the client side. Add this in the response."),
        "geneset": z.string().optional().nullable().describe("Gene set to be analyzed."),
        "up": z.string().optional().nullable().describe("Up-regulated genes."),
        "down": z.string().optional().nullable().describe("Down-regulated genes."),
    }
  },
  async ({geneset, up=" ", down=" "}: {geneset: string, up: string, down: string}) => {
    return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
            function: "sigComLincs",
            inputType: "GeneSetInput",
            output_text: "I can run a function that returns the LINCS L1000 small molecules and genetic perturbations that likely up- or down-regulate the expression of the input gene set.",
            geneset,
            up,
            down
        })
      }
    ],
    structuredContent: {
        function: "sigComLincs",
        inputType: "GeneSetInput",
        output_text: "I can run a function that returns the LINCS L1000 small molecules and genetic perturbations that likely up- or down-regulate the expression of the input gene set.",
        geneset,
        up,
        down
    }
  }
  }
]


export default sigComLincs;