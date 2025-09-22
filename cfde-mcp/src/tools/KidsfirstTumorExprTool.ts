import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface KidsfirstTumorExprInput {
  gene_symbol: string;
}

class KidsfirstTumorExprTool extends MCPTool<KidsfirstTumorExprInput> {
  name = "kidsfirst_tumor_expr";
  description = "Gene expression in tumors for a gene from Kids First Open Pediatric Cancer Atlas API";

  schema = {
    gene_symbol: {
      type: z.string(),
      description: "Gene symbol",
      default: "ACE2"
    },
  };

  async execute({gene_symbol='ACE2'}: KidsfirstTumorExprInput) {
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
							"id": "2b24d6a3-492d-23d3-d69d-d28b5943ab87",
							"type": "KFTumorExpressionFromGene",
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
				
				if (res.ok) {
					const data = await res.json();
					return {component: "TableViewPlaybook", data};
				}
				else {
					return {
								type: "text",
								text: "Failed to find the expression data",
							};
				}
  }
}

export default KidsfirstTumorExprTool;