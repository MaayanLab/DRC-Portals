/**
 * All analyze modules, a function defines whether the module itself is compatible,
 *  and the button defines what to show.
 */
import React from 'react'
import Image from "@/utils/image"
import Button from "@mui/material/Button";
import DDIcon from '@/public/img/DD.png'
import GDLPAIcon from '@/public/img/icons/gdlpa.png'
import GeneCentricIcon from '@/public/img/icons/gene-centric-partnership.png'
import CardButton from "@/app/data/processed/CardButton";
import PWBButton from "@/app/data/processed/PWBButton";

const modules: {
  compatible: (item: { label: string; description: string; entity: { type: string; } }) => boolean,
  button: (props: { item: { label: string; description: string; entity: { type: string; } } })=> React.ReactNode,
}[] = [
  {
    compatible: (item) => true,
    button: ({ item }) => {
      const url = React.useMemo(() => {
        const params = new URLSearchParams()
        if (item.entity.type === 'gene') {
          params.append('filter', JSON.stringify({
            start: 'Gene',
            start_field: 'label',
            start_term: item.label,
            end_field: 'label',
          }))
        } else {
          params.append('filter', JSON.stringify({
            start: item.entity.type,
            start_field: 'label',
            start_term: item.label,
            end_field: 'label',
          }))
        }
        return `https://dd-kg-ui.cfde.cloud/?${params.toString()}`
      }, [item])
      return (
        <CardButton
          icon={<Image src={DDIcon} height={64} alt="Data Distillery" />}
          title="CFDE DD-Knowledge Graph"
          description={<>The CFDE Data Distillery Knowledge Graph contains entities and relationships across the CFDE. View {item.label}'s neighborhood in the knowledge graph.</>}
        >
          <Button
            color="secondary"
            size="small"
            href={url}
            target="_blank"
          >Submit</Button>
        </CardButton>
      )
    },
  },
  {
    compatible: (item) => item.entity.type === 'gene',
    button: ({ item }) => <PWBButton
      body={{
        data: { gene: { type: "Input[Gene]", value: item.label } },
        workflow: [
          { id: "input-gene", type: "Input[Gene]", data: { id: "gene" } },
          { id: "LINCS", type: "LINCSL1000ReverseSearch", inputs: { gene: { id: "input-gene" } } },
          { id: "GlyGen", type: "GlyGenProteinInformation", inputs: { gene: { id: "input-gene" } } },
          { id: "GTEx", type: "GTExTissueExpressionFromGene", inputs: { gene: { id: "input-gene" } } },
          { id: "KidsFirst", type: "KFTumorExpressionFromGene", inputs: { gene: { id: "input-gene" } } },
          { id: "GTEx-KF-Barplot", type: "BarplotFrom[[TumorGeneExpression]]", inputs: {
            terms: { id: "KidsFirst" }, other_terms: { "id": "GTEx" },
            } },
          { id: "exRNA", type: "GetRegulatoryElementsForGeneInfoFromGene", inputs: { gene: { id: "input-gene" } } },
          { id: "Metabolomics", type: "MetGeneSearch", inputs: { gene: { id: "input-gene" } } },
        ],
      }}
      title="Playbook Workflow Builder: Gene-Centric Workflow"
      description={<>View Gene-Centric information about the gene from a pre-built PWB workflow. View the workflow with {item.label}.</>}
      mode="report"
    />,
  },
  {
    compatible: (item) => item.entity.type === 'gene' || item.entity.type === 'variant',
    button: ({ item }) => <CardButton
        icon={<Image src={GeneCentricIcon} height={64} alt="Gene Partnership Appyter" />}
        title="CFDE Gene-Centric Appyter"
        description={<>The CFDE Gene Centric Appyter Resolves and Displays Gene-Centric information from CFDE APIs. Execute the Appyter using {item.label}.</>}
      >
      <Button
        color="secondary"
        size="small"
        href={`https://appyters.maayanlab.cloud/CFDE-Gene-Partnership/#?args.gene=${encodeURIComponent(item.label)}&submit`}
        target="_blank"
      >Submit</Button>
    </CardButton>,
  },
  {
    compatible: (item) => item.entity.type === 'gene',
    button: ({ item }) => <CardButton
      icon={<Image src={GDLPAIcon} height={64} alt="Gene and Drug Landing Page Aggregator" className="bg-black" />}
      title="GDLPA Landing Pages Links"
      description={<>The Gene and Drug Landing Page Aggregator (GDLPA) finds links to primary and secondary source information from CFDE and other resources. Discover landing pages for {item.label}.</>}
    >
      <Button
        color="secondary"
        size="small"
        href={`https://cfde-gene-pages.cloud/gene/${encodeURIComponent(item.label)}`}
        target="_blank"
      >Submit</Button>
    </CardButton>,
  },
  {
    compatible: (item) => item.entity.type === 'Drug',
    button: ({ item }) => <CardButton
      icon={<Image src={GDLPAIcon} height={64} alt="Gene and Drug Landing Page Aggegrator" className="bg-black" />}
      title="GDLPA Landing Pages Links"
      description={<>The Gene and Drug Landing Page Aggregator (GDLPA) finds links to primary and secondary source information from CFDE and other resources. Discover landing pages for {item.label}.</>}
    >
      <Button
        color="secondary"
        size="small"
        href={`https://cfde-gene-pages.cloud/drug/${encodeURIComponent(item.label)}`}
        target="_blank"
      >Submit</Button>
    </CardButton>,
  },
  {
    compatible: (item) => item.entity.type === 'gene',
    button: ({ item }) => <PWBButton
      body={{
        data: { gene: { type: "Input[Gene]", value: item.label } },
        workflow: [
          { id: "input-gene", type: "Input[Gene]", data: { id: "gene" } },
        ],
      }}
      title="Playbook Workflow Builder"
      description={<>The Playbook Workflow Builder helps you interactively construct workflows leveraging CFDE APIs without code. Start a new workflow with {item.label}.</>}
    />,
  },
  {
    compatible: (item) => item.entity.type === 'Drug',
    button: ({ item }) => <PWBButton
      body={{
        data: { drug: { type: "Input[Drug]", value: item.label } },
        workflow: [
          { id: "input-drug", type: "Input[Drug]", data: { id: "drug" } },
        ],
      }}
      title="Playbook Workflow Builder"
      description={<>The Playbook Workflow Builder helps you interactively construct workflows leveraging CFDE APIs without code. Start a new workflow with {item.label}.</>}
    />,
  },
]
export default modules
