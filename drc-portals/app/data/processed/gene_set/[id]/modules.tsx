/**
 * All analyze modules, a function defines whether the module itself is compatible,
 *  and the button defines what to show.
 */
import PWBButton from "./PWBButton";
import { $Enums } from "@prisma/client";
import G2SGButton from "./G2SGButton";
import { cache } from "react";
import prisma from "@/lib/prisma";

const getGeneSet = cache(async (id: string) => (
  await prisma.geneSetNode.findUniqueOrThrow({
    where: { id },
    select: { genes: { select: { entity: { select: { node: { select: { label: true } } } } } } }
  })
).genes.map(r => r.entity.node.label))

const modules: {
  button: (props: {
    item: {
      id: string,
      gene_set_library: {
        id: string;
        node: {
          label: string;
          type: $Enums.NodeType;
          description: string;
        };
      };
      _count: {
        genes: number;
      };
      node: {
        type: $Enums.NodeType;
        label: string;
        dcc: { label: string; short_label: string | null; icon: string | null; } | null;
        description: string;
      };
    }
  }) => React.ReactNode,
}[] = [
    {
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
