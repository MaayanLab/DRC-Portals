import GetDccsAndCentersTool from "./GetDccsAndCentersTool.js"
import GetDccPublicationsTool from "./GetDccOrCenterPublicationsTool.js"
import GetOutreachTool from "./GetOutreachTool.js"
import GetDocumentation from "./GetDocumentation.js"
import ARCHS4GeneExpression from "./ARCHS4GeneExpressionTool.js"
import GlyGenbyGlyTouCan from "./GlyGenbyGlyTouCanTool.js"
import GtexGeneExpression from "./GtexGeneExpressionTool.js"
import ImpcPhenotypes from "./ImpcPhenotypesTool.js"
import PhenotypeSmallMolecules from "./PhenotypeSmallMoleculesTool.js"
import RegElementSetInfo from "./RegElementSetInfoTool.js"
import ReverseSearchL1000 from "./ReverseSearchL1000Tool.js"
import sigComLincs from "./sigComLincsTool.js"
import KidsFirstTumorExpr from "./KidsFirstTumorExpr.js"
import sigComLincsNoInput from "./sigComLincsToolNoInput.js"

const tools:any[] = [
	GetDccsAndCentersTool,
	GetDccPublicationsTool,
	GetOutreachTool,
	GetDocumentation,
	ARCHS4GeneExpression,
	GlyGenbyGlyTouCan,
	GtexGeneExpression,
	ImpcPhenotypes,
	KidsFirstTumorExpr,
	PhenotypeSmallMolecules,
	RegElementSetInfo,
	ReverseSearchL1000,
	sigComLincs,
	sigComLincsNoInput
]
export const initialize_tools = (server:any) => {
	for (const tool of tools) {
		server.registerTool(...tool)
	}
}