import { MCPTool } from "mcp-framework";
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

class ReverseL1000SearchTool extends MCPTool<ReverseL1000SearchInput> {
  name = "reverse_l1000_search";
  description = "ReverseL1000Search tool description";

  schema = {
    gene_symbol: {
      type: z.string(),
      description: "gene_symbol",
      default: "ACE2"
    },
    dir: {
      type: z.string(),
      description: "Direction of gene expression",
      enum: ["up", "down", "both"]
    },
    perturb: {
      type: z.string(),
      description: "Type of perturbation",
      enum: ["CRISPR", "drugs"]
    }
  };

  async execute({gene_symbol="ACE2", dir, perturb}: ReverseL1000SearchInput) {
    // const upres = await getL100Sigs(gene_symbol, "up", perturb)
    //   const downres = await getL100Sigs(gene_symbol, "down", perturb)
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
        return {component: "TableViewPlaybook", data, gene_symbol, dir, perturb};
      }
      else {
        return {
              type: "text",
              text: res.text || "Error retrieving data",
            };
      }
  }
}

export default ReverseL1000SearchTool;