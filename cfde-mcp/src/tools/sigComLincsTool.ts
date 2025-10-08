import { z } from "zod";

const sigComLincs = [
  "sigComLincs",
  {
    title: "sigComLincs",
    description: "What are the LINCS L1000 small molecules and genetic perturbations that likely up- or down-regulate the expression of my gene set?",
    inputSchema: {
        "geneset": z.string().optional().describe("Gene set to be analyzed."),
        "up": z.string().optional().describe("Up-regulated genes."),
        "down": z.string().optional().describe("Down-regulated genes.")
    },
    outputSchema: {
        "function": z.string().describe("Function to run"),
        "geneset": z.string().optional().nullable().describe("Gene set to be analyzed."),
        "up": z.string().optional().nullable().describe("Up-regulated genes."),
        "down": z.string().optional().nullable().describe("Down-regulated genes.")
    }
  },
  async ({geneset, up, down}: {geneset: string, up: string, down: string}) => {
    return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
            "function": "sigComLincs",
            geneset,
            up,
            down
        })
      }
    ],
    structuredContent: {
        "function": "sigComLincs",
        geneset,
        up,
        down
    }
  }
  }
]


export default sigComLincs;