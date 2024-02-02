/**
 * All analyze modules, a function defines whether the module itself is compatible,
 *  and the button defines what to show.
 */
import Image from "next/image"
import Link from "next/link"
import Button from "@mui/material/Button";
import DDIcon from '@/public/img/DD.png'
import GDLPAIcon from '@/public/img/icons/gdlpa.png'
import GeneCentricIcon from '@/public/img/icons/gene-centric-partnership.png'
import CardButton from "./CardButton";
import PWBButton from "./PWBButton";

const modules: {
  compatible: (item: { node: { label: string; description: string; }; type: string; }) => boolean,
  button: (props: { item: { node: { label: string; description: string; }; type: string; } })=> React.ReactNode,
}[] = [
  {
    compatible: (item) => true,
    button: ({ item }) => <CardButton
      icon={<Image src={DDIcon} height={64} alt="Data Distillery" />}
      title="CFDE DD-Knowledge Graph"
      description={<>The CFDE Data Distillery Knowledge Graph contains entities and relationships across the CFDE. View {item.node.label}'s neighborhood in the knowledge graph.</>}
    >
      <Button color="secondary" size="small" disabled>Coming Soon</Button>
    </CardButton>,
  },
  {
    compatible: (item) => item.type === 'gene',
    button: ({ item }) => <PWBButton
      body={{
        data: { gene: { type: "Input[Gene]", value: item.node.label } },
        workflow: [
          { id: "input-gene", type: "Input[Gene]", data: { id: "gene" } },
        ],
      }}
      title="Playbook Workflow Builder"
      description={<>The Playbook Workflow Builder helps you interactively construct workflows leveraging CFDE APIs without code. Start a new workflow with {item.node.label}.</>}
    />,
  },
  {
    compatible: (item) => item.type === 'Drug',
    button: ({ item }) => <PWBButton
      body={{
        data: { drug: { type: "Input[Drug]", value: item.node.label } },
        workflow: [
          { id: "input-drug", type: "Input[Drug]", data: { id: "drug" } },
        ],
      }}
      title="Playbook Workflow Builder"
      description={<>The Playbook Workflow Builder helps you interactively construct workflows leveraging CFDE APIs without code. Start a new workflow with {item.node.label}.</>}
    />,
  },
  {
    compatible: (item) => item.type === 'gene' || item.type === 'variant',
    button: ({ item }) => <CardButton
        icon={<Image src={GeneCentricIcon} height={64} alt="Gene Partnership Appyter" />}
        title="CFDE Gene-Centric Appyter"
        description={<>The CFDE Gene Centric Appyter Resolves and Displays Gene-Centric information from CFDE APIs. Execute the Appyter using {item.node.label}.</>}
      >
      <Link href={`https://appyters.maayanlab.cloud/CFDE-Gene-Partnership/#?args.gene=${encodeURIComponent(item.node.label)}&submit`} legacyBehavior target="_blank">
        <Button color="secondary" size="small">Submit</Button>
      </Link>
    </CardButton>,
  },
  {
    compatible: (item) => item.type === 'gene',
    button: ({ item }) => <CardButton
      icon={<Image src={GDLPAIcon} height={64} alt="Gene and Drug Landing Page Aggregator" className="bg-black" />}
      title="GDLPA Landing Pages Links"
      description={<>The Gene and Drug Landing Page Aggregator (GDLPA) finds links to primary and secondary source information from CFDE and other resources. Discover landing pages for {item.node.label}.</>}
    >
      <Link href={`https://cfde-gene-pages.cloud/gene/${encodeURIComponent(item.node.label)}`} legacyBehavior target="_blank">
        <Button color="secondary" size="small">Submit</Button>
      </Link>
    </CardButton>,
  },
  {
    compatible: (item) => item.type === 'Drug',
    button: ({ item }) => <CardButton
      icon={<Image src={GDLPAIcon} height={64} alt="Gene and Drug Landing Page Aggegrator" className="bg-black" />}
      title="GDLPA Landing Pages Links"
      description={<>The Gene and Drug Landing Page Aggregator (GDLPA) finds links to primary and secondary source information from CFDE and other resources. Discover landing pages for {item.node.label}.</>}
    >
      <Link href={`https://cfde-gene-pages.cloud/drug/${encodeURIComponent(item.node.label)}`} legacyBehavior target="_blank">
        <Button color="secondary" size="small">Submit</Button>
      </Link>
    </CardButton>,
  },
]
export default modules
