import { z } from "zod";

const PhenotypeSmallMolecules = [
  "PhenotypeSmallMolecules",
  {
    title: "PhenotypeSmallMolecules",
    description: "Runs a client side function that returns find small molecules that are most likely to induce a given phenotype or biological process",
    inputSchema: {
        "phenotype": z.string().optional().describe("Phenotype to be analyzed.")
    },
    outputSchema: {
        "function": z.string().describe("Function to run"),
        "inputType": z.string().describe("The type of input"),
        "output_text": z.string().describe("What will be done in the client side. Add this in the response."),
        "phenotype": z.string().optional().nullable().describe("Phenotype to be analyzed.")
    }
  },
  async ({phenotype}: {phenotype: string}) => {
    return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
            function: "PhenotypeSmallMolecules",
            inputType: "PhenotypeInput",
            output_text: "I can run a function that returns find small molecules that are most likely to induce a given phenotype or biological process",
            phenotype
        })
      }
    ],
    structuredContent: {
        function: "PhenotypeSmallMolecules",
        inputType: "PhenotypeInput",
        output_text: "I can run a function that returns find small molecules that are most likely to induce a given phenotype or biological process",
        phenotype
    }
  }
  }
]


export default PhenotypeSmallMolecules;