import { z } from "zod";
import prisma from "../lib/prisma/index.js";

interface GetDccInput {
  dcc: string;
}
const GetDccOrCenterTool = [
	"get_dcc_or_center",
	{
		title: "Get DCC or Center",
		description: "Get information on a DCC or a Center",
		inputSchema: {
			name: z.string().describe("The name of a DCC or Center"),
		},
		outputSchema: {
			label: z.string().describe("long name of the dcc or center"),
			short_label: z.string().describe("short name of the dcc or center"),
			portal_page: z.string().describe("The corresponding page of the dcc or center in CFDE Workbench"),
			description: z.string().describe("description of the dcc or center"),
			homepage: z.string().describe("homepage of the dcc or center"),
			cf_site: z.string().optional().describe("Page of the dcc in the CommonFund (https://commonfund.nih.gov/)"),
		}
	},
	async ({name}: {name: string}) => {
		const dcc_info = await prisma.dccs.findFirst({
			where: {
				OR: [
					{
						short_label: {
							equals: name,
							mode: "insensitive"
						},
					},
					{
						label: {
							equals: name,
							mode: "insensitive"
						},
					}
				]
			}
		})
		if (dcc_info) {
			const formatted_info = {
				label: dcc_info.label,
				short_label: dcc_info.short_label,
				portal_page: `https://info.cfde.cloud/dcc/${dcc_info.short_label}}`,
				description: dcc_info.description,
				homepage: dcc_info.homepage,
				cf_site: dcc_info.cf_site,
			}
			return {
					content: [
						{
							type: "text",
							text: JSON.stringify(formatted_info)
						}
					],
					structuredContent: formatted_info
				}
		} else {
			const center_info = await prisma.centers.findFirst({
				where: {
					OR: [
						{
							short_label: {
								equals: name,
								mode: "insensitive"
							},
						},
						{
							label: {
								equals: name,
								mode: "insensitive"
							},
						}
					]
				}
			})
			if (center_info) {
				const formatted_info = {
					label: center_info.label,
					short_label: center_info.short_label,
					portal_page: `https://info.cfde.cloud/center/${center_info.short_label}}`,
					description: center_info.description,
					homepage: center_info.homepage,
				}
				return {
						content: [
							{
								type: "text",
								text: JSON.stringify(formatted_info)
							}
						],
						structuredContent: formatted_info
					}
			} else {
				return {
						content: [
							{
								type: "text",
								text: `Failed to find ${name}`,
							},
						],
					}
			}
		}
	}
]

export default GetDccOrCenterTool;