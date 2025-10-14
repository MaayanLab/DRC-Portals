import { z } from "zod";

const sigComLincs = [
  "sigComLincs",
  {
    title: "sigComLincs",
    description: "Returns the LINCS L1000 small molecules and genetic perturbations that likely up- or down-regulate the expression of a gene set.",
    inputSchema: {},
    outputSchema: {
        function: z.string().describe("Function to run"),
        inputType: z.string().describe("The type of input"),
        methods: z.string().describe("Description of the workflow"),
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
            methods: "Signature search to find mimicking and reversing signatures will be done using SigCom LINCS.",
            // up,
            // down
        })
      }
    ],
    structuredContent: {
        function: "sigComLincs",
        inputType: "GeneSetInput",
        methods: "Signature search to find mimicking and reversing signatures will be done using SigCom LINCS.",
        // up,
        // down
    }
  }
  }
]


export default sigComLincs;