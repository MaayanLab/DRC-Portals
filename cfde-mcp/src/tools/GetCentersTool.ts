import { MCPTool } from "mcp-framework";
import prisma from "../lib/prisma/index.js";



class GetCentersTool extends MCPTool {
  name = "get_centers";
  description = "get brief information on all active centers";

  schema = {};

  async execute() {
    const centers = await prisma.centers.findMany({
					where: {
						active: true
					}
				})
				if (centers.length > 0) {
					const centers_formatted = centers.map((center:any)=>({
						label: center.label,
						short_label: center.short_label,
						portal_page: `https://info.cfde.cloud/center/${center.short_label}}`,				
					}))
					return centers_formatted
				} else {
					return "No active centers found"
				}
  }
}

export default GetCentersTool;