/**
 * All analyze modules, a function defines whether the module itself is compatible,
 *  and the button defines what to show.
 */
import PWBButton from "@/app/data/processed/PWBButton";
import prisma from "@/lib/prisma";
import { cache } from "react";

const modules: {
  compatible: (item: { id: string, node: { label: string; description: string; }, asset_type: string }) => boolean,
  button: (props: { item: { id: string,node: { label: string; description: string; }, asset_type: string } }) => React.ReactNode,
}[] = [
  {
    compatible: (item) => true,
    button: async ({ item }) => <PWBButton
      body={{
        data: { file: { type: "Input[File]", value: { set: await getGeneSet(item.id), description: item.node.label } } },
        workflow: [
          { id: "input_file", type: "Input[File]", data: { id: "file" } },
        ],
      }}
      title="Playbook Workflow Builder"
      description={<>The Playbook Workflow Builder helps you interactively construct workflows leveraging CFDE APIs without code. Start a new workflow with {item.node.label}.</>}
    />,
  },
]
export default modules
