import { z } from "zod";

interface GetRegElementInfoInput {
  gene_symbol: string;
}
const GetRegElementInfoTool = [
	"get_reg_element_info",
	{
		title: "Get Regulatory Element Information",
		description: "Find regulatory elements that regulate a given gene",
		inputSchema: {
			gene_symbol: z.string().default("ACE2").describe("gene symbol")
			},
			outputSchema: {
				component: z.string().describe("Component to be used by the client to render structured data"),
				data: z.record(z.string(), z.any()).describe("Phenotype data to be rendered")
			}
		},
		async ({gene_symbol="ACE2"}: {gene_symbol: string}) => {
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
				return {
					content: [
						{
							type: "text",
							text: JSON.stringify({component: "TableViewPlaybook", data})
						}
					],
					structuredContent: {component: "TableViewPlaybook", data}
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

export default GetRegElementInfoTool;