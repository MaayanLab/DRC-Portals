import { z } from "zod";

const GlyGenbyGlyTouCan = [
  "GlyGenbyGlyTouCan",
  {
    title: "GlyGenbyGlyTouCan",
    description: "Runs a client side function that find information about a given glycan such as G17689DH or a similarly formatted glycan id",
    inputSchema: {
        "glycan": z.string().optional().describe("glycan to be analyzed.")
    },
    outputSchema: {
        "function": z.string().describe("Function to run"),
        "inputType": z.string().describe("The type of input"),
        "output_text": z.string().describe("What will be done in the client side. Add this in the response."),
        "glycan": z.string().optional().nullable().describe("glycan to be analyzed.")
    }
  },
  async ({glycan}: {glycan: string}) => {
    return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
            function: "GlyGenbyGlyTouCan",
            inputType: "GlycanInput",
            output_text: "I can run a function that find information about a given glycan.",
            glycan
        })
      }
    ],
    structuredContent: {
        function: "GlyGenbyGlyTouCan",
        inputType: "GlycanInput",
        output_text: "I can run a function that find information about a given glycan.",
        glycan
    }
  }
  }
]


export default GlyGenbyGlyTouCan;