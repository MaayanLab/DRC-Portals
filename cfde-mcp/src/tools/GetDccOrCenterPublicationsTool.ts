import { z } from "zod";
import prisma from "../lib/prisma/index.js";


const GetDccPublicationsTool = [
	"get_dcc_or_center_publications",
	{
		name: "Get DCC or Center Publications",
		description: "Get publications associated with a dcc or a center. By default you are only getting landmark publications. Set landmark to false to get all publications.",
		inputSchema: {
			name: z.string().describe("The name of a DCC or Center"),
			landmark: z.boolean().default(true).describe( "Return only landmark publications. True by default"),
		}
	},
	async ({name, landmark=true}: {name: string, landmark: boolean}) => {
		const filter = landmark ? {
			where: {
						publications: {
							landmark: true
						}
					}
		}: {}
		const dcc_info = await prisma.dccs.findFirst({
			where: {
				OR: [
					{
						short_label: {
							equals: name,
							mode: "insensitive"
						}
					},
					{
						label: {
							equals: name,
							mode: "insensitive"
						}
					}
				]
			},
			include: {
				dcc_publications: {
					select: {
						publications: true
					},
					...filter
				}
			}
		})
		if (dcc_info?.dcc_publications) {
			const publications = dcc_info.dcc_publications.map((pub:any)=>({
				authors: pub.publications.authors,
				title: pub.publications.title,
				journal: pub.publications.journal,
				volume: pub.publications.volume,
				page: pub.publications.page,
				issue: pub.publications.issue,
				year: pub.publications.year,
				doi: pub.publications.doi,
				pmid: pub.publications.pmid,
				pmcid: pub.publications.pmcid,
				
			}))
			return {
				content: [
					{
						type: "text",
						text: JSON.stringify({publications})
					}
				],
				structuredContent: {publications}
			}
		} else {
			const center_info = await prisma.centers.findFirst({
				where: {
					OR: [
						{
							short_label: {
								equals: name,
								mode: "insensitive"
							}
						},
						{
							label: {
								equals: name,
								mode: "insensitive"
							}
						}
					]
				},
				include: {
					center_publications: {
						select: {
							publications: true
						},
						...filter
					}
				}
			})
			if (center_info?.center_publications) {
				const publications = center_info.center_publications.map((pub:any)=>({
					authors: pub.publications.authors,
					title: pub.publications.title,
					journal: pub.publications.journal,
					volume: pub.publications.volume,
					page: pub.publications.page,
					issue: pub.publications.issue,
					year: pub.publications.year,
					doi: pub.publications.doi,
					pmid: pub.publications.pmid,
					pmcid: pub.publications.pmcid,
					
				}))
				return {
					content: [
						{
							type: "text",
							text: JSON.stringify({publications})
						}
					],
					structuredContent: {publications}
				}
			} else {
				return {
						content: [
							{
								type: "text",
								text: `Failed to find publications for ${name}`,
							},
						],
					}
			}
		}
  }
]

export default GetDccPublicationsTool;