import { z } from "zod";

interface ReverseL1000SearchInput {
  gene_symbol: string;
  dir: string;
  perturb: string;
}

const getL100Sigs = async (gene: string, dir: string, perturb: string) => {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            gene: gene,
            dir: dir,
            perturb: perturb
        })
    }

    const res = await fetch(`https://data.cfde.cloud/chat/l1000sigs`, options)
    if (!res.ok) return {
		error: res.statusText
	}
    const data = await res.json()
    return data
};

const ReverseL1000SearchTool = [
	'reverse_l1000_search',
	{
		title: "Reverse L1000 Search Tool",
		description: "Find perturbations that up or downregulate a gene input",
		inputSchema: {
			gene_symbol: z.string().default("ACE2").describe("gene symbol"),
      dir: z.enum(["up", "down", "both"]).default("both").describe("Direction of gene expression"),
      perturb: z.enum(["CRISPR", "drugs"]).default("drugs").describe("Type of perturbation")
		},
		outputSchema: {
			component: z.string().describe("Component to be used by the client to render structured data"),
			data: z.record(z.string(), z.any()).describe("Phenotype data to be rendered"),
      gene_symbol: z.string().default("ACE2").describe("gene symbol"),
      dir: z.enum(["up", "down", "both"]).describe("Direction of gene expression"),
      perturb: z.enum(["CRISPR", "drugs"]).describe("Type of perturbation")
		}
	},
	async ({gene_symbol="ACE2", dir, perturb}: {gene_symbol: string, dir: "up"|"down"|"both", perturb: "CRISPR"|"drugs"}) => {
		const body = {
        "data": {
          "12c02bd3-f2ec-c719-533f-b1bb3b0170b7": {
            "type": "Input[Gene]",
            "value": gene_symbol
          }
        },
        "workflow": [
          {
            "id": "83efe773-027b-4f21-688d-b27555938a04",
            "type": "Input[Gene]",
            "data": {
              "id": "12c02bd3-f2ec-c719-533f-b1bb3b0170b7"
            }
          },
          {
            "id": "ee9c0c69-347e-8eec-ea68-d2eb0e7925cd",
            "type": "LINCSL1000ReverseSearch",
            "inputs": {
              "gene": {
                "id": "83efe773-027b-4f21-688d-b27555938a04"
              }
            }
          }
        ]
      }
      const options: any = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body)

      }
      const res = await fetch(`https://data.cfde.cloud/chat/fetchPlaybook`, options)
      // const r:any = dir === "up" ? upres: dir === "down"? downres: {}
      if (res.ok) {
        const data = await res.json();
        return {
					content: [
						{
							type: "text",
							text: JSON.stringify({component: "TableViewPlaybook", data,  gene_symbol, dir, perturb})
						}
					],
					structuredContent: {component: "TableViewPlaybook", data,  gene_symbol, dir, perturb}
				}
      }
      else {
        return {
					content: [
						{
							type: "text",
							text: `Failed to find results for ${gene_symbol}`
						}
					],
				}
      }
	}
]


export default ReverseL1000SearchTool;