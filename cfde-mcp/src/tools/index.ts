import GetDccsOrCentersTool from "./GetDccsOrCentersTool.js"
import GetDccOrCenterTool from "./GetDccOrCenterTool.js"
import GetDccPublicationsTool from "./GetDccOrCenterPublicationsTool.js"
import GetOutreachTool from "./GetOutreachTool.js"
import FetchImpcPhenotypeTool from "./FetchImpcPhenotypeTool.js"
import GetRegElementInfoTool from "./GetRegElementInfoTool.js"
import ReverseL1000SearchTool from "./ReverseL1000SearchTool.js"
const tools:any[] = [
	GetDccsOrCentersTool,
	GetDccOrCenterTool,
	GetDccPublicationsTool,
	GetOutreachTool,
	FetchImpcPhenotypeTool,
	GetRegElementInfoTool,
	ReverseL1000SearchTool
]
export const initialize_tools = (server:any) => {
	for (const tool of tools) {
		server.registerTool(...tool)
	}
}