import { z } from "zod";

const fetchImpcPhenotype = async (geneId: string) => {
    const firstLetter = geneId[0].toUpperCase();
    const restOfTheString = geneId.slice(1).toLowerCase();
    const res = await fetch(`https://www.ebi.ac.uk/mi/impc/solr/genotype-phenotype/select?q=marker_symbol:${firstLetter + restOfTheString}`)
    const data = await res.json();
  return data['response']['docs'];
};

const ImpcPhenotypes = [
  "ImpcPhenotypes",
  {
    title: "ImpcPhenotypes",
    description: "Runs a client side function that returns mouse phenotypes significantly associated with a gene",
    inputSchema: {
        "geneSymbol": z.string().optional().describe("Gene symbol")
    },
    // outputSchema: {
    //     "function": z.string().describe("Function to run"),
    //     "geneSymbol": z.string().optional().nullable().describe("Gene symbol"),
    //     "inputType": z.string().describe("The type of input"),
    //     "methods": z.string().describe("Methods describing the workflow"),
    //     "output": z.array(z.looseObject({
    //       id: z.string(),
    //     })).describe("Analysis returned by the IMPC API"),
    // }
  },
  async ({geneSymbol}: {geneSymbol: string}) => {
    const output = await fetchImpcPhenotype(geneSymbol)
    console.log(output)
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
              function: "ImpcPhenotypes",
              inputType: "GeneInput",
              methods: "Query IMPC for phenotypes associated with a mouse gene.",
              geneSymbol,
              output
          })
        }
      ],
      structuredContent: {
          function: "ImpcPhenotypes",
          inputType: "GeneInput",
          methods: "Query IMPC for phenotypes associated with a mouse gene.",
          geneSymbol,
          output
      }
    }
  }
]


export default ImpcPhenotypes;