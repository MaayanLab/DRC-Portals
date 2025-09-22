import { MCPTool } from "mcp-framework";
import { z } from "zod";
import prisma from "../lib/prisma/index.js";

interface GetCenterInput {
  center: string;
}

class GetCenterTool extends MCPTool<GetCenterInput> {
  name = "get_center";
  description = "get information about a certain center";

  schema = {
    center: {
      type: z.string(),
      description: "The name of a Center",
    },
  };

  async execute(input: GetCenterInput) {
    const {center} = input
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
						portal_page: `https://info.cfde.cloud/center/${center_info.short_label}}`,
						description: center_info.description,
						homepage: center_info.homepage,
					}
					return formatted_info;
				} else {
					return "Failed to find the Center";
				}
  }
}

export default GetCenterTool;