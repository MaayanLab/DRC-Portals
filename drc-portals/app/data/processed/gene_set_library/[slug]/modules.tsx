/**
 * All analyze modules, a function defines whether the module itself is compatible,
 *  and the button defines what to show.
 */
import PWBButton from "@/app/data/processed/PWBButton";
import prisma from "@/lib/prisma/slow";
import { cache } from "react";

const getGeneSet = cache(async (id: string) => (
  await prisma.geneSetNode.findUnique({
    where: { id },
    select: { genes: { select: { entity: { select: { node: { select: { label: true } } } } } } }
  })
)?.genes.map(r => r.entity.node.label))

const modules: {
  compatible: (item: { id: string, node: { label: string; description: string; }, access_url: string, filename: string }) => boolean,
  button: (props: { item: { id: string, node: { label: string; description: string; }, access_url: string, filename: string } }) => React.ReactNode,
}[] = [
  {
    compatible: (item) => item.access_url.endsWith('.gmt'),
    button: async ({ item }) => <PWBButton
      body={{
        data: { gene_set_library: { type: "GMTFileUpload", value: { url: item.access_url, filename: item.filename, description: item.node.description } } },
        workflow: [
          { id: "input_gene_set_library", type: "GMTFileUpload", data: { id: "gene_set_library" } },
        ],
      }}
      title="Playbook Workflow Builder"
      description={<>The Playbook Workflow Builder helps you interactively construct workflows leveraging CFDE APIs without code. Start a new workflow with {item.node.label}.</>}
    />,
  },
]

export default modules
