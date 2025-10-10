import { z } from "zod";

const sigComLincs = [
  "sigComLincs",
  {
    title: "sigComLincs",
    description: "Returns the LINCS L1000 small molecules and genetic perturbations that likely up- or down-regulate the expression of a gene set.",
    inputSchema: {
      perturbation_type: z.enum(['drugs', 'CRISPR']).describe("The perturbation type, can either be drugs or CRISPR gene knockouts.")
    },
    outputSchema: {
        function: z.string().describe("Function to run"),
        inputType: z.string().describe("The type of input"),
        output_text: z.string().describe("What will be done in the client side. Add this in the response."),
        perturbation_type: z.enum(['drugs', 'CRISPR']).describe("The perturbation type, can either be drugs or CRISPR gene knockouts.")
    }
  },
  async ({perturbation_type}: {perturbation_type: string}) => {
    return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
            function: "sigComLincs",
            inputType: "GeneSetInput",
            output_text: "I can run a function that returns the LINCS L1000 small molecules and genetic perturbations that likely up- or down-regulate the expression of the input gene set.",
            perturbation_type,
            // up,
            // down
        })
      }
    ],
    structuredContent: {
        function: "sigComLincs",
        inputType: "GeneSetInput",
        output_text: "I can run a function that returns the LINCS L1000 small molecules and genetic perturbations that likely up- or down-regulate the expression of the input gene set.",
        perturbation_type,
        // up,
        // down
    }
  }
  }
]


export default sigComLincs;