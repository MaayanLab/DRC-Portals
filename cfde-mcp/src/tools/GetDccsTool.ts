import { MCPTool } from "mcp-framework";
import prisma from "../lib/prisma/index.js";



class GetDccsTool extends MCPTool {
  name = "get_dccs";
  description = "get brief information on all active dccs";

  schema = {};

  async execute() {
    const dccs = await prisma.dccs.findMany({
					where: {
						active: true
					}
				})
				if (dccs.length > 0) {
					const dccs_formatted = dccs.map((dcc:any)=>({
						label: dcc.label,
						short_label: dcc.short_label,
						portal_page: `https://info.cfde.cloud/dcc/${dcc.short_label}}`,				
					}))
					return dccs_formatted
				} else {
					return "No active dccs found"
				}
  }
}

export default GetDccsTool;