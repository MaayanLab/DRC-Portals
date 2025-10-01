import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import prisma from "./lib/prisma";
import fetch from 'isomorphic-unfetch'

export const initialize_server = () => {
	const server = new McpServer({
		name: "cfde-mcp",
		version: "0.0.1",
		capabilities: {
			resources: {},
			tools: {},
		},
		});

		server.tool(
			"get_dccs",
			"get brief information on all active dccs",
			{},
			async () => {
				const dccs = await prisma.dccs.findMany({
					where: {
						active: true
					}
				})
				if (dccs.length > 0) {
					const dccs_formatted = dccs.map(dcc=>({
						label: dcc.label,
						short_label: dcc.short_label,
						portal_lage: `https://info.cfde.cloud/dcc/${dcc.short_label}}`,				
					}))
					return {
						content: [
							{
								type: "text",
								text: JSON.stringify(dccs_formatted),
							},
						],
					};
				} else {
					return {
						content: [
							{
								type: "text",
								text: "No active dccs found",
							},
						],
					};
				}
				

			}
		);

		server.tool(
			"get_centers",
			"get brief information on all active centers",
			{},
			async () => {
				const centers = await prisma.centers.findMany()
				if (centers.length > 0) {
					const centers_formatted = centers.map(center=>({
						label: center.label,
						short_label: center.short_label,
						portal_lage: `https://info.cfde.cloud/center/${center.short_label}}`,				
					}))
					return {
						content: [
							{
								type: "text",
								text: JSON.stringify(centers_formatted),
							},
						],
					};
				} else {
					return {
						content: [
							{
								type: "text",
								text: "No active centers found",
							},
						],
					};
				}
			}
		);


		server.tool(
			"get_dcc_info",
			"get information about a certain dcc",
			{
				dcc: z.string().describe("The name of a DCC")
			},
			async ({dcc}) => {
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
					}
				})
				if (dcc_info) {
					const formatted_info = {
						label: dcc_info.label,
						short_label: dcc_info.short_label,
						portal_lage: `https://info.cfde.cloud/dcc/${dcc_info.short_label}}`,
						description: dcc_info.description,
						homepage: dcc_info.homepage,
						cf_site: dcc_info.cf_site,
					}
					return {
						content: [
							{
								type: "text",
								text: JSON.stringify(formatted_info),
							},
						],
					};
				} else {
					return {
						content: [
							{
								type: "text",
								text: "Failed to find the DCC",
							},
						],
					};
				}
				

			}
		);


		server.tool(
			"get_center_info",
			"get information about a certain center",
			{
				center: z.string().describe("The name of a CFDE Center")
			},
			async ({center}) => {
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
					}
				})
				if (center_info) {
					const formatted_info = {
						label: center_info.label,
						short_label: center_info.short_label,
						portal_lage: `https://info.cfde.cloud/center/${center_info.short_label}}`,
						description: center_info.description,
						homepage: center_info.homepage,
					}
					return {
						content: [
							{
								type: "text",
								text: JSON.stringify(formatted_info),
							},
						],
					};
				} else {
					return {
						content: [
							{
								type: "text",
								text: "Failed to find the Center",
							},
						],
					};
				}
				

			}
		);

		server.tool(
			"get_dcc_publication",
			"get publications (landmark or all) associated with a dcc",
			{
				dcc: z.string().describe("The name of a DCC"),
				landmark: z.boolean().default(true).describe("Return only landmark publications"),
			},
			async ({dcc, landmark=true}) => {
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
					const publications = dcc_info.dcc_publications.map(pub=>({
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
								text: `Here are the ${landmark ? "landmark": ""} publications for ${dcc} ${JSON.stringify(publications)}`,
							},
						],
					};
				} else {
					return {
						content: [
							{
								type: "text",
								text: "Failed to find the Publications",
							},
						],
					};
				}
			}
		);



		server.tool(
			"get_center_publication",
			"get publications (landmark or all) associated with a center",
			{
				center: z.string().describe("The name of a CFDE Center"),
				landmark: z.boolean().default(true).describe("Return only landmark publications"),
			},
			async ({center, landmark=true}) => {
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
					const publications = center_info.center_publications.map(pub=>({
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
								text: `Here are the ${landmark ? "landmark": ""} publications for ${center} ${JSON.stringify(publications)}`,
							},
						],
					};
				} else {
					return {
						content: [
							{
								type: "text",
								text: "Failed to find publications",
							},
						],
					};
				}
			}
		);


		server.tool(
			"get_outreach",
			"get current training and outreach activity.",
			{
				dcc: z.string().optional().describe("The name of a DCC"),
				center: z.string().optional().describe("The name of a Center"),
				tag: z.string().optional().describe("the kind of outreach or training activity they are looking for. It can be: fellowship, workshop, intership, course, training program, webinar, office hours, face to face meeting, competition, conference, use-a-thon, hackathon, or symposium."),
			},
			async ({dcc, center, tag}) => {
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
					return {
						content: [
							{
								type: "text",
								text: JSON.stringify(formatted),
							},
						],
					};
				} else {
					return {
						content: [
							{
								type: "text",
								text: "No activiites found.",
							},
						],
					};
				}
			}
		);

		server.tool(
			"fetch_impc_phenotype",
			"Given a gene symbol, return mouse phenotypes significantly associated with that gene",
			{
				gene_symbol: z.string().describe("Gene symbol")
			},
			async ({gene_symbol}) => {
				const firstLetter = gene_symbol[0].toUpperCase();
				const restOfTheString = gene_symbol.slice(1).toLowerCase();
				const res = await fetch(`https://www.ebi.ac.uk/mi/impc/solr/genotype-phenotype/select?q=marker_symbol:${firstLetter + restOfTheString}`)
				if (res.ok) {
					const data = await res.json();
					return {
						content: [
							{
								type: "text",
								mimeType: "application/json",
								text: JSON.stringify({component: "TableViewCol", data})
							},
						],
					};
				}
				else {
					return {
						content: [
							{
								type: "text",
								text: "Failed to find the DCC",
							},
						],
					};
				}
			}
		);

	return server
}