import { z } from "zod";

const PhenotypeSmallMolecules = [
  "PhenotypeSmallMolecules",
  {
    title: "PhenotypeSmallMolecules",
    description: "Find small molecules that are most likely to induce a given phenotype or biological process",
    inputSchema: {
        "glycan": z.string().optional().describe("Phenotype to be analyzed.")
    },
    outputSchema: {
        "function": z.string().describe("Function to run"),
        "glycan": z.string().optional().nullable().describe("Phenotype to be analyzed.")
    }
  },
  async ({glycan}: {glycan: string}) => {
    return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
            "function": "PhenotypeSmallMolecules",
            glycan
        })
      }
    ],
    structuredContent: {
        "function": "PhenotypeSmallMolecules",
        glycan
    }
  }
  }
]


export default PhenotypeSmallMolecules;