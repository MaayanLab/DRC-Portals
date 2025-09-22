import { MCPTool } from "mcp-framework";
import { z } from "zod";
import prisma from "../lib/prisma/index.js";

interface GetCenterPublicationsInput {
  center: string;
  landmark: boolean
}

class GetCenterPublicationsTool extends MCPTool<GetCenterPublicationsInput> {
  name = "get_center_publications";
  description = "get publications (landmark or all) associated with a center";

  schema = {
    center: {
      type: z.string(),
      description: "The name of a Center",
    },
    landmark: {
      type: z.boolean(),
      description: "Return only landmark publications",
      default: true,
    },
  };

  async execute(input: GetCenterPublicationsInput) {
    const {center, landmark=true} = input
    const filter = landmark ? {
					where: {
								publications: {
									landmark: true
								}
							}
				}: {}
    const center_info = await prisma.centers.findFirst({
					where: {
						OR: [
							{
								short_label: center
							},
							{
								label: center
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
					return `Here are the ${landmark ? "landmark": ""} publications for ${center} ${JSON.stringify(publications)}`
				} else {
					return `Failed to find the Publications for ${center}`
				}
  }
}

export default GetCenterPublicationsTool;