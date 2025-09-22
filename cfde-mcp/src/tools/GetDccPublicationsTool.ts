import { MCPTool } from "mcp-framework";
import { z } from "zod";
import prisma from "../lib/prisma/index.js";

interface GetDccPublicationsInput {
  dcc: string;
  landmark: boolean
}

class GetDccPublicationsTool extends MCPTool<GetDccPublicationsInput> {
  name = "get_dcc_publications";
  description = "get publications (landmark or all) associated with a dcc";

  schema = {
    dcc: {
      type: z.string(),
      description: "The name of a DCC",
    },
    landmark: {
      type: z.boolean(),
      description: "Return only landmark publications",
      default: true,
    },
  };

  async execute(input: GetDccPublicationsInput) {
    const {dcc, landmark=true} = input
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
								short_label: dcc
							},
							{
								label: dcc
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
					return `Here are the ${landmark ? "landmark": ""} publications for ${dcc} ${JSON.stringify(publications)}`
				} else {
					return `Failed to find the Publications for ${dcc}`
				}
  }
}

export default GetDccPublicationsTool;