import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface GetRegElementInfoInput {
  gene_symbol: string;
}

class GetRegElementInfoTool extends MCPTool<GetRegElementInfoInput> {
  name = "get_reg_element_info";
  description = "Find regulatory elements that regulate a given gene";

  schema = {
    gene: {
      type: z.string(),
      description: "Gene symbol",
      default: "ACE2"
    },
  };

  async execute({gene_symbol="ACE2"}: GetRegElementInfoInput) {
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
							"id": "e6ed0549-fd80-0766-7e31-6193a5f16ecb",
							"type": "GetRegulatoryElementsForGeneInfoFromGene",
							"inputs": {
								"gene": {
									"id": "83efe773-027b-4f21-688d-b27555938a04"
								}
							}
						},
						{
							"id": "bf5c1482-67e0-e8c9-be8a-84ff8941ace1",
							"type": "RegElementSetInfoFromRegElementTerm",
							"inputs": {
								"regulatoryElementSet": {
									"id": "e6ed0549-fd80-0766-7e31-6193a5f16ecb"
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
								text: "Failed to find the regulatory element for the gene",
							};
				}
  }
}

export default GetRegElementInfoTool;