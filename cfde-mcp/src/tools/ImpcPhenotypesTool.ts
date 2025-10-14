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
        "methods": z.string().describe("Methods describing the workflow"),
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
              methods: "Query IMPC for phenotypes associated with a mouse gene.",
              geneSymbol
          })
        }
      ],
      structuredContent: {
          function: "ImpcPhenotypes",
          inputType: "GeneInput",
          methods: "Query IMPC for phenotypes associated with a mouse gene.",
          geneSymbol
      }
    }
  }
]


export default ImpcPhenotypes;