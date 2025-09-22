import { MCPTool } from "mcp-framework";
import { z } from "zod";
import prisma from "../lib/prisma/index.js";

interface GetDccInput {
  dcc: string;
}

class GetDccTool extends MCPTool<GetDccInput> {
  name = "get_dcc";
  description = "get information about a certain dcc";

  schema = {
    dcc: {
      type: z.string(),
      description: "The name of a DCC",
    },
  };

  async execute(input: GetDccInput) {
    const {dcc} = input
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
						portal_page: `https://info.cfde.cloud/dcc/${dcc_info.short_label}}`,
						description: dcc_info.description,
						homepage: dcc_info.homepage,
						cf_site: dcc_info.cf_site,
					}
					return formatted_info;
				} else {
					return "Failed to find the DCC";
				}
  }
}

export default GetDccTool;