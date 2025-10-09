import prisma from "../lib/prisma/index.js";
import { z } from "zod";

const GetDccsAndCentersTool = [
	"get_dccs_and_centers",
	{
		title: "Get DCCs and Centers",
		description: "Returns information of all the DCCs and Centers involved in CFDE",
		inputSchema: {},
		outputSchema: {
			dccs: z.array(
				z.object({
					label: z.string().describe("long name of the dcc or center"),
					short_label: z.string().describe("short name of the dcc or center"),
					portal_page: z.string().describe("The corresponding page of the dcc or center in CFDE Workbench"),
					description: z.string().describe("description of the dcc or center"),
					homepage: z.string().nullable().describe("homepage of the dcc or center"),
					cf_site: z.string().nullable().optional().describe("Page of the dcc in the CommonFund (https://commonfund.nih.gov/)"),
				})).describe("List of Data Coordination Centers (DCCs)"),
			centers: z.array(
				z.object({
					label: z.string().describe("long name of the dcc or center"),
					short_label: z.string().describe("short name of the dcc or center"),
					portal_page: z.string().describe("The corresponding page of the dcc or center in CFDE Workbench"),
					description: z.string().nullable().describe("description of the dcc or center"),
					homepage: z.string().nullable().describe("homepage of the dcc or center"),
				})).describe("List of Centers involved in CFDE"),
		}
	},
	async () => {
		const results: {[key:string]: Array<{[key: string]: string | null}>} = {}
		const dccs = await prisma.dccs.findMany({
				where: {
					active: true
				}
			})
		if (dccs.length > 0) {
			results["dccs"] = dccs.map((dcc)=>({
				label: dcc.label,
				short_label: dcc.short_label,
				portal_page: `https://info.cfde.cloud/dcc/${dcc.short_label}`,
				description: dcc.description,
				homepage: dcc.homepage,
				cf_site: dcc.cf_site,
			}))
		}
		const centers = await prisma.centers.findMany({
				where: {
					active: true,
					short_label: {
						not: "centers"
					}
				}
			})
		if (centers.length > 0) {
			results["centers"] = centers.map((center)=>({
				label: center.label,
				short_label: center.short_label,
				portal_page: `https://info.cfde.cloud/center/${center.short_label}`,
				description: center.description,
				homepage: center.homepage,
			}))
		}
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(results)
				}
			],
			structuredContent: results
		}
	}
]

export default GetDccsAndCentersTool;