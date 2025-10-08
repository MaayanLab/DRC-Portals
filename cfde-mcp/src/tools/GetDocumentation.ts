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
const GetDocumentation = [
	"get_documentation",
	{
		title: "Get Documentation",
		description: "Get some information about the basic terminologies used in the CFDE Workbench.",
		inputSchema: {},
	},
	async () => {
		return {
			content: [
				{
					type: "text",
					text: docs
				}
			],
		}
  }
]


export default GetDocumentation;