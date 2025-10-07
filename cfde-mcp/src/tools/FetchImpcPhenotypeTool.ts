import { z } from "zod";

const FetchImpcPhenotypeTool = [
  "fetch_impc_phenotype",
  {
    title: "Fetch IMPC Phenotype",
    description: "Given a gene symbol, return mouse phenotypes significantly associated with that gene",
    inputSchema: {
      gene_symbol: z.string().describe("gene symbol")
    },
    outputSchema: {
      component: z.string().describe("Component to be used by the client to render structured data"),
      data: z.record(z.string(), z.any()).describe("Phenotype data to be rendered")
    }
  },
  async ({gene_symbol}: {gene_symbol: string}) => {
    const firstLetter = gene_symbol[0].toUpperCase();
				const restOfTheString = gene_symbol.slice(1).toLowerCase();
				const res = await fetch(`https://www.ebi.ac.uk/mi/impc/solr/genotype-phenotype/select?q=marker_symbol:${firstLetter + restOfTheString}`)
				if (res.ok) {
					const data = await res.json();
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({component: "TableViewCol", data})
              }
            ],
            structuredContent: {component: "TableViewCol", data}
          }
				}
				else {
					return {
            content: [
              {
                type: "text",
                text: `Failed to find phenotypes for ${gene_symbol}`
              }
            ],
          }

				}
  }
]


export default FetchImpcPhenotypeTool;