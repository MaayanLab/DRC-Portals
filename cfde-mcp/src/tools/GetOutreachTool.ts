import { MCPTool } from "mcp-framework";
import { z } from "zod";
import prisma from "../lib/prisma/index.js";

interface GetOutreachInput {
  dcc?: string;
  center?: string;
  tag?: string
}

class GetOutreachTool extends MCPTool<GetOutreachInput> {
  name = "get_outreach";
  description = "GetOutreach tool description";

  schema = {
    dcc: {
      type: z.string().optional(),
      description: "The name of a DCC",
    },
    center: {
      type: z.string().optional(),
      description: "The name of a Center",
    },
    tag: {
      type: z.string().optional(),
      description: "The kind of outreach or training activity they are looking for. It can be: fellowship, workshop, intership, course, training program, webinar, office hours, face to face meeting, competition, conference, use-a-thon, hackathon, or symposium.",
    },
  };

  async execute(input: GetOutreachInput) {
    const {dcc, center, tag} = input
    const where_tags = tag ? {
					tag: {
						path: [],
						array_contains: tag
					}
				}: {}

				const where_dcc = dcc ? {
					where: {
						dccs: {
							OR: [
								{label: dcc},
								{short_label: dcc}
							]
						}
					}
				}: {}

				const where_center = center ? {
					where: {
						centers: {
							OR: [
								{label: center},
								{short_label: center}
							]
						}
					}
				}: {}
				const now = new Date()
				const current = await prisma.outreach.findMany({
					// take: limit,
					include: {
						dcc_outreach: {
							include: {
								dccs: true
							},
							...where_dcc
						},
						center_outreach: {
						include: {
							centers: true
						},
						...where_center
						}
					},
					where: {
						active: true,
						recurring: false,
						...where_tags,
						AND: [
						// date filters
						{
							OR: [
							{
								application_end: {
								gte: now
								}
							},
							{
								application_start: {
								gte: now
								},
								application_end: null
							},
							{
								end_date: {
								gte: now
								},
								application_end: null
							},
							{
								end_date: null,
								start_date: {
								gte: now
								}
							}
							]
						},
						],
						
					},
					orderBy: [
						{
						start_date: { sort: 'asc', nulls: 'last' }
						},
						{
						end_date: { sort: 'asc', nulls: 'last' }
						},
						{
						application_end: { sort: 'asc', nulls: 'last' }
						},
					] 
					})
				const recurring = await prisma.outreach.findMany({
					where: {
					recurring: true,
					active: true,
					...where_tags
					},
					include: {
						dcc_outreach: {
							include: {
								dccs: true
							},
							...where_dcc
						},
						center_outreach: {
							include: {
								centers: true
							},
							...where_center
						}
					},
				})

				const outreach_activites = [...current, ...recurring]
				if (outreach_activites.length > 0) {
					const formatted = outreach_activites.map(o=>({
						title: o.title,
						description: o.description,
						link: o.link,
						start_date: o.start_date,
						end_date: o.end_date,
						application_start: o.application_start,
						application_end: o.application_end,
						tags: o.tags,
					}))
					return formatted
				} else {
					return "No activites found."
				}
  }
}

export default GetOutreachTool;