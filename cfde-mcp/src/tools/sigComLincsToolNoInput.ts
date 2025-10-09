import { z } from "zod";

const sigComLincsNoInput = [
  "sigComLincsNoInput",
  {
    title: "sigComLincsNoInput",
    description: "Runs a client side function that returns the LINCS L1000 small molecules and genetic perturbations that likely up- or down-regulate the expression of the input gene set.",
    outputSchema: {
        "function": z.string().describe("Function to run"),
        "inputType": z.string().describe("The type of input"),
        "output_text": z.string().describe("What will be done in the client side. Add this in the response."),
    }
  },
  async () => {
    return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
            function: "sigComLincs",
            inputType: "GeneSetInput",
            output_text: "I can run a function that returns the LINCS L1000 small molecules and genetic perturbations that likely up- or down-regulate the expression of the input gene set.",
            
        })
      }
    ],
    structuredContent: {
        function: "sigComLincs",
        inputType: "GeneSetInput",
        output_text: "I can run a function that returns the LINCS L1000 small molecules and genetic perturbations that likely up- or down-regulate the expression of the input gene set.",
    }
  }
  }
]


export default sigComLincsNoInput;