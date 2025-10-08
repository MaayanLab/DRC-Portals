import prisma from "../lib/prisma/index.js";
import { z } from "zod";

const GetDccsOrCentersTool = [
	"get_dccs_or_centers",
	{
		title: "Get DCCs or Centers",
		description: "Get brief information of all the DCCs or Centers involved in CFDE",
		inputSchema: {
			category: z.enum(["dccs", "centers"]).describe("Can either be dccs or centers")
		},
		outputSchema: {
			results: z.array(z.object({
				label: z.string().describe("long name of the dcc or center"),
				short_label: z.string().describe("short name of the dcc or center"),
				portal_page: z.string().describe("The corresponding page of the dcc or center in CFDE Workbench"),
				description: z.string().describe("description of the dcc or center"),
							
			}))
		}
	},
	async ({category}: {category: "dccs"|"centers"}) => {
		if (category === "dccs") {
			const results = await prisma.dccs.findMany({
				where: {
					active: true
				}
			})
			if (results.length > 0) {
				const formatted = results.map((dcc:any)=>({
					label: dcc.label,
					short_label: dcc.short_label,
					portal_page: `https://info.cfde.cloud/dcc/${dcc.short_label}}`,
					description: dcc.description
				}))
				return {
					content: [
						{
							type: "text",
							text: JSON.stringify({results: formatted})
						}
					],
					structuredContent: {results: formatted}
				}
			} else {
				return {
						content: [
							{
								type: "text",
								text: "Failed to find the DCCs",
							},
						]
					}
			}	
		} else if (category === "centers"){
			const results = await prisma.centers.findMany({
				where: {
					active: true
				}
			})
			if (results.length > 0) {
				const formatted = results.map((center:any)=>({
					label: center.label,
					short_label: center.short_label,
					portal_page: `https://info.cfde.cloud/center/${center.short_label}}`,
					description: center.description
					
				}))
				return {
					content: [
						{
							type: "text",
							text: JSON.stringify({results: formatted})
						}
					],
					structuredContent: {results: formatted}
				}
			} else {
				return {
						content: [
							{
								type: "text",
								text: "Failed to find the Centers",
							},
						],
					}
			}
		}
	}
]

export default GetDccsOrCentersTool;