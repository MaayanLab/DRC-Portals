import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface FetchImpcPhenotypeInput {
  gene_symbol: string;
}

class FetchImpcPhenotypeTool extends MCPTool<FetchImpcPhenotypeInput> {
  name = "fetch_impc_phenotype";
  description = "Given a gene symbol, return mouse phenotypes significantly associated with that gene";

  schema = {
    gene_symbol: {
      type: z.string(),
      description: "Gene symbol",
    },
  };

  async execute(input: FetchImpcPhenotypeInput) {
    const {gene_symbol} = input
    const firstLetter = gene_symbol[0].toUpperCase();
				const restOfTheString = gene_symbol.slice(1).toLowerCase();
				const res = await fetch(`https://www.ebi.ac.uk/mi/impc/solr/genotype-phenotype/select?q=marker_symbol:${firstLetter + restOfTheString}`)
				if (res.ok) {
					const data = await res.json();
					return {component: "TableViewCol", data};
				}
				else {
					return {
								type: "text",
								text: "Failed to find the phenotype",
							};
				}
  }
}

export default FetchImpcPhenotypeTool;