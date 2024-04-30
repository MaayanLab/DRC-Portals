/**
 * All analyze modules, a function defines whether the module itself is compatible,
 *  and the button defines what to show.
 */
import PWBButton from "./PWBButton";
import { $Enums } from "@prisma/client";
import G2SGButton from "./G2SGButton";


const modules: {
  button: (props: {
    item: {
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
    }, genes: {
      genes: {
        entity: {
            node: {
                type: $Enums.NodeType;
                label: string;
                description: string;
            };
        };
        id: string;
    }[];
    }
  }) => React.ReactNode,
}[] = [
    {
      button: ({ item, genes }) => <PWBButton
        body={{
          data: { geneset: { type: "Input[Set[Gene]]", value: { description: item.node.label, set: genes.genes.map((geneItem) => geneItem.entity.node.label) } } },
          workflow: [
            { id: "input-geneset", type: "Input[Set[Gene]]", data: { id: "geneset" } },
          ],
        }}
        title="Playbook Workflow Builder"
        description={<>The Playbook Workflow Builder helps you interactively construct workflows leveraging CFDE APIs without code. Start a new workflow with {item.node.label}.</>}
      />,
    },
    {
      button: ({ item, genes }) => <G2SGButton
        body={{
          "term": item.node.label,
          "genes": genes.genes.map((geneItem) => geneItem.entity.node.label),
          "description": item.node.description
        }}
        title="Get-Gene-Set-Go"
        description={<>Get-Gene-Set-Go helps you to fetch gene sets from various data sources, augment, combine with set operations, visualize and analyze these gene sets in a single session. Start a new session with {item.node.label}.</>}
      />,
    },
  ]
export default modules
