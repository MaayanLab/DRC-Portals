/**
 * All analyze modules, a function defines whether the module itself is compatible,
 *  and the button defines what to show.
 */
import PWBButton from "@/app/data/processed/PWBButton";
import G2SGButton from "./G2SGButton";
import prisma from "@/lib/prisma";
import { cache } from "react";

const getGeneSet = cache(async (id: string) => (
  await prisma.geneSetNode.findUniqueOrThrow({
    where: { id },
    select: { genes: { select: { entity: { select: { node: { select: { label: true } } } } } } }
  })
).genes.map(r => r.entity.node.label))

const modules: {
  compatible: (item: { id: string, node: { label: string; description: string; } }) => boolean,
  button: (props: { item: { id: string,node: { label: string; description: string; } } }) => React.ReactNode,
}[] = [
  {
    compatible: (item) => true,
    button: async ({ item }) => <PWBButton
      body={{
        data: { gene_set: { type: "Input[Set[Gene]]", value: { set: await getGeneSet(item.id), description: item.node.label } } },
        workflow: [
          { id: "input_gene_set", type: "Input[Set[Gene]]", data: { id: "gene_set" } },
        ],
      }}
      title="Playbook Workflow Builder"
      description={<>The Playbook Workflow Builder helps you interactively construct workflows leveraging CFDE APIs without code. Start a new workflow with {item.node.label}.</>}
    />,
  },
  {
    compatible: (item) => true,
    button: async ({ item }) => <G2SGButton
      body={{
        "term": item.node.label,
        "genes": await getGeneSet(item.id),
        "description": item.node.description
      }}
      title="Get-Gene-Set-Go"
      description={<>Get-Gene-Set-Go helps you to fetch gene sets from various data sources, augment, combine with set operations, visualize and analyze these gene sets in a single session. Start a new session with {item.node.label}.</>}
    />,
  },
]

export default modules