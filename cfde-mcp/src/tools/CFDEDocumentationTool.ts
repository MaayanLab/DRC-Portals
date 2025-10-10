import prisma from "../lib/prisma/index.js";
import { z } from "zod";
const docs = `
Documentation:

C2M2: The Crosscut Metadata Model (C2M2) was designed to standardize metadata annotations across Common Fund DCCs by the original CFDE Coordination Center. C2M2 datapackage files are usually a zipfile containing a set of TSV files already standardized to a set of known ontologies, along with a single JSON schema.


RNA-seq Standard Pipeline:
The CFDE RNA-seq Partnership aims to harmonize diverse RNA-seq datasets across the CFDE to improve their interoperability and reusability for the broader scientific research community. To this end, the partnership is developing common pipelines for both bulk and single cell RNA-seq data analysis, with the end goal of building a large, readily accessible, and harmonized resource of RNA-seq datasets and processing tools from various DCCs and CFDE projects.


More information about the standardized bulk and single cell RNA-seq pipelines will be available soon.


OpenAI and SmartAPI:
The OpenAPI specification allows for the standardization of application programming interfaces (APIs), and facilitates their interoperability.


The SmartAPI project builds on top of the OpenAPI specifications to maximize the findability, accessibility, interoperability, and reusability (FAIRness) of web-based tools, especially those within the biomedical sphere. Through richer metadata descriptions, SmartAPI enables users to search and use a connected network of tools.


Knowledge Graph Assertions:
The CFDE Data Distillery Partnership aims to integrate data assertions across DCCs into a functional knowledge graph for knowledge query and discovery. The partnership has collected "distilled" data relationships from each DCC to be unified in a knowledge graph model with controlled ontology and vocabulary terms for exploring pre-defined, biologically relevant use cases.
More information about generating knowledge graph assertions will be available soon.


Fair evaluations with FAIRshake:
The FAIRshake toolkit enables manual and automated assessments of the findability, accessibility, interoperability, and reusability (FAIRness) of digital resources. FAIRshake provides community-driven metrics and rubrics for evaluation, and visualizes the results with a characteristic embeddable insignia. The primary goal of FAIRshake is to enable researchers and developers to objectively measure and improve the FAIRness of their tools.


Playbook Metanodes:
The Playbook Workflow Builder (PWB) is a web-based knowledge resolution platform being developed by the CFDE Workflow Playbook Partnership and consisting of a growing network of datasets, semantically annotated API endpoints, and visualization tools from across the CFDE. Users can construct workflows from the individual building blocks, termed "meta nodes", with little effort or technical expertise required.
`

const CFDEDocumentationTool = [
	"CFDEDocumentationTool",
	{
		title: "CFDEDocumentationTool",
		description: "Returns information of all the DCCs and Centers involved in CFDE as well as relevant documentation",
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
			documentation: z.string().describe("Documentation about the different data, standards, and terminologies used in CFDE")
		}
	},
	async () => {
		const results: {[key:string]: Array<{[key: string]: string | null}> | string} = {}
		results["documentation"] = docs
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

export default CFDEDocumentationTool;