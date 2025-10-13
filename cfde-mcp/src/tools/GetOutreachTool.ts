import { z } from "zod";
import prisma from "../lib/prisma/index.js";

interface GetOutreachInput {
  dcc?: string;
  center?: string;
  tag?: string
}
const GetOutreachTool = [
	"get_outreach",
	{
		title: "Get Outreach",
		description: "Get current outreach and training activities. Enter a name of a dcc or center to filter by dcc or center.",
		inputSchema: {
			name: z.string().optional().describe("Name of a center or DCC. Can be left blank."),
			tag: z.enum([
				"fellowship",
				"workshop",
				"intership",
				"course",
				"training program",
				"webinar",
				"office hours",
				"face to face meeting",
				"competition",
				"conference",
				"use-a-thon",
				"hackathon",
				"symposium",
				"social event"
			]).optional().describe("Type of outreach activity"),
		},
		outputSchema: {
			outreach: z.array(z.object({
				title: z.string().describe("Title of the activity"),
				description: z.string().describe("Description of the activity"),
				link: z.string().describe("Link to the activity"),
				tags: z.array(z.string()).nullable().describe("Tags of the activity"),
				start_date: z.date().nullable().describe("Start date of the activity. If blank then the event is recurring"),
				end_date: z.date().nullable().describe("End date of the activity. If blank then the event is recurring"),
				application_start: z.date().nullable().describe("Start of the application period if the activity has an application period"),
				application_end: z.date().nullable().describe("End of the application period if the activity has an application period"),
			}))
		}
	},
	async ({name, tag}: {name?: string, tag?: string}) => {
		console.log(name, tag)
		if (name) {
			const where_tags = tag ? {
				where: {
				outreach: {
					tags: {
						path: [],
						array_contains: tag
					}
				}}}: {}
			const dcc_outreach = await prisma.dccs.findFirst({
				where: {
					OR: [
						{
							label: {
								equals: name,
								mode: "insensitive"
							}
						},
						{
							short_label: {
								equals: name,
								mode: "insensitive"
							}
						}
					]
				},
				include: {
					dcc_outreach: {
						select: {
							outreach: true
						},
						...where_tags
					}
				}
			})
			if (dcc_outreach?.dcc_outreach) {
				const outreach = dcc_outreach?.dcc_outreach.map(o=>({
							title: o.outreach.title,
							description: o.outreach.description,
							link: o.outreach.link,
							start_date: o.outreach.start_date,
							end_date: o.outreach.end_date,
							application_start: o.outreach.application_start,
							application_end: o.outreach.application_end,
							tags: o.outreach.tags,
						}))
				return {
					content: [
						{
							type: "text",
							text: JSON.stringify({outreach})
						}
					],
					structuredContent: {outreach}
				}
			} else {
				const center_outreach = await prisma.centers.findFirst({
					where: {
						OR: [
							{
								label: {
									equals: name,
									mode: "insensitive"
								}
							},
							{
								short_label: {
									equals: name,
									mode: "insensitive"
								}
							}
						]
					},
					include: {
						center_outreach: {
							select: {
								outreach: true
							},
							...where_tags
						}
					}
				})
				if (center_outreach?.center_outreach) {
					const outreach = center_outreach?.center_outreach.map(o=>({
								title: o.outreach.title,
								description: o.outreach.description,
								link: o.outreach.link,
								start_date: o.outreach.start_date,
								end_date: o.outreach.end_date,
								application_start: o.outreach.application_start,
								application_end: o.outreach.application_end,
								tags: o.outreach.tags,
							}))
					return {
						content: [
							{
								type: "text",
								text: JSON.stringify({outreach})
							}
						],
						structuredContent: {outreach}
					}
				} else {
					return {
						content: [
							{
								type: "text",
								text: `Failed to find outreach activity for ${name}`
							}
						]
					}
				}
			}
		} else {
			const where = tag ? {
				tags: {
					path: [],
					array_contains: tag
				}
			}: {}
			const results = await prisma.outreach.findMany({where})
			if (results.length) {
				const outreach = results.map(o=>({
					title: o.title,
					description: o.description,
					link: o.link,
					start_date: o.start_date,
					end_date: o.end_date,
					application_start: o.application_start,
					application_end: o.application_end,
					tags: o.tags,
				}))
				return {
					content: [
						{
							type: "text",
							text: JSON.stringify({outreach})
						}
					],
					structuredContent: {outreach}
				}
			} else {
				return {
						content: [
							{
								type: "text",
								text: `No outreach activity found`
							}
						]
					}
			}
		}
  }
]


export default GetOutreachTool;