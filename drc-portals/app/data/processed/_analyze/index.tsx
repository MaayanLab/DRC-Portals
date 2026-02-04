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
import { EntityExpandedType, EntityType, capitalize } from '@/app/data/processed/utils';
import CardButton from ".//CardButton";
import PWBButton from ".//PWBButton";
import G2SGButton from './G2SGButton';
import GSEButton from './GSEButton';
import elasticsearch from '@/lib/elasticsearch';

const getGeneSet = React.cache(async (id: string) => {
  const searchRes = await elasticsearch.search<EntityExpandedType>({
    index: 'entity_expanded',
    query: {
      query_string: {
        query: `${id} type:gene`,
        default_operator: 'AND',
      },
    },
    // maybe we should page but I don't think any gene set should be this big
    size: 10000,
  })
  return searchRes.hits.hits.map(hit => hit._source?.a_label as string)
})

const modules: {
  compatible: (item: EntityType) => boolean,
  button: (props: { item: EntityType })=> React.ReactNode,
}[] = [
  {
    // TODO: some way to find all kg types automatically?
    compatible: (item) => (
      item.type === 'gene'
      || item.type === 'compound'
      || item.type === 'metabolite'
      || item.type === 'anatomy'
      || item.type === 'protein'
      || item.type === 'substance'
    ),
    button: ({ item }) => {
      const url = React.useMemo(() => {
        const params = new URLSearchParams()
        params.append('filter', JSON.stringify({
          start: capitalize(item.type),
          start_field: 'label',
          start_term: item.a_label,
          end_field: 'label',
        }))
        return `https://dd-kg-ui.cfde.cloud/?${params.toString()}`
      }, [item])
      return (
        <CardButton
          icon={<Image src={DDIcon} height={64} alt="Data Distillery" />}
          title="CFDE DD-Knowledge Graph"
          description={<>The CFDE Data Distillery Knowledge Graph contains entities and relationships across the CFDE. View {item.a_label}'s neighborhood in the knowledge graph.</>}
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
    compatible: (item) => item.type === 'gene',
    button: ({ item }) => <PWBButton
      body={{
        data: { gene: { type: "Input[Gene]", value: item.a_label } },
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
      description={<>View Gene-Centric information about the gene from a pre-built PWB workflow. View the workflow with {item.a_label}.</>}
      mode="report"
    />,
  },
  {
    compatible: (item) => item.type === 'gene' || item.type === 'variant',
    button: ({ item }) => <CardButton
        icon={<Image src={GeneCentricIcon} height={64} alt="Gene Partnership Appyter" />}
        title="CFDE Gene-Centric Appyter"
        description={<>The CFDE Gene Centric Appyter Resolves and Displays Gene-Centric information from CFDE APIs. Execute the Appyter using {item.a_label}.</>}
      >
      <Button
        color="secondary"
        size="small"
        href={`https://appyters.maayanlab.cloud/CFDE-Gene-Partnership/#?args.gene=${encodeURIComponent(item.a_label)}&submit`}
        target="_blank"
      >Submit</Button>
    </CardButton>,
  },
  {
    compatible: (item) => item.type === 'gene',
    button: ({ item }) => <CardButton
      icon={<Image src={GDLPAIcon} height={64} alt="Gene and Drug Landing Page Aggregator" className="bg-black" />}
      title="GDLPA Landing Pages Links"
      description={<>The Gene and Drug Landing Page Aggregator (GDLPA) finds links to primary and secondary source information from CFDE and other resources. Discover landing pages for {item.a_label}.</>}
    >
      <Button
        color="secondary"
        size="small"
        href={`https://cfde-gene-pages.cloud/gene/${encodeURIComponent(item.a_label)}`}
        target="_blank"
      >Submit</Button>
    </CardButton>,
  },
  {
    compatible: (item) => item.type === 'compound',
    button: ({ item }) => <CardButton
      icon={<Image src={GDLPAIcon} height={64} alt="Gene and Drug Landing Page Aggegrator" className="bg-black" />}
      title="GDLPA Landing Pages Links"
      description={<>The Gene and Drug Landing Page Aggregator (GDLPA) finds links to primary and secondary source information from CFDE and other resources. Discover landing pages for {item.a_label}.</>}
    >
      <Button
        color="secondary"
        size="small"
        href={`https://cfde-gene-pages.cloud/drug/${encodeURIComponent(item.a_label)}`}
        target="_blank"
      >Submit</Button>
    </CardButton>,
  },
  {
    compatible: (item) => item.type === 'protein' && typeof item.a_synonyms !== 'undefined' /* these are from the C2M2 and the ID is a UniProtKB id */,
    button: ({ item }) => <CardButton
      icon={<img src={'/img/icons/uniprot.svg'} height={64} alt="Gene and Drug Landing Page Aggegrator" className="p-2" />}
      title="UniProtKB"
      description={<>UniProt is the world's leading high-quality, comprehensive and freely accessible resource of protein sequence and functional information Knowledge Base. Find out more about {item.a_id}.</>}
    >
      <Button
        color="secondary"
        size="small"
        href={`https://www.uniprot.org/uniprotkb/${encodeURIComponent(item.a_id)}/entry`}
        target="_blank"
      >Submit</Button>
    </CardButton>,
  },
  {
    compatible: (item) => item.type === 'gene',
    button: ({ item }) => <PWBButton
      body={{
        data: { gene: { type: "Input[Gene]", value: item.a_label } },
        workflow: [
          { id: "input-gene", type: "Input[Gene]", data: { id: "gene" } },
        ],
      }}
      title="Playbook Workflow Builder"
      description={<>The Playbook Workflow Builder helps you interactively construct workflows leveraging CFDE APIs without code. Start a new workflow with {item.a_label}.</>}
    />,
  },
  {
    compatible: (item) => item.type === 'compound',
    button: ({ item }) => <PWBButton
      body={{
        data: { drug: { type: "Input[Drug]", value: item.a_label } },
        workflow: [
          { id: "input-drug", type: "Input[Drug]", data: { id: "drug" } },
        ],
      }}
      title="Playbook Workflow Builder"
      description={<>The Playbook Workflow Builder helps you interactively construct workflows leveraging CFDE APIs without code. Start a new workflow with {item.a_label}.</>}
    />,
  },
  {
    compatible: (item) => item.type === 'gene_set',
    button: async ({ item }) => <PWBButton
      body={{
        "data":{
          "gene-set": {
            "type":"Input[Set[Gene]]",
            "value":{
              "description": item.a_description,
              "set": await getGeneSet(item.id),
            }
          }
        },
        "workflow":[
          {"id":"input-gene-set","type":"Input[Set[Gene]]","data":{"id":"gene-set"}},
          {"id":"enrichment-results","type":"CFDEGSEGenesetSearch","inputs":{"geneset":{"id":"input-gene-set"}}},
            {"id":"gtex.0","type":"ExtractCFDEGSEGenesetSearch[GTEx_Tissues_V8_2023]","inputs":{"searchResults":{"id":"enrichment-results"}}},
              {"id":"gtex.1","type":"EnrichrScoredTToScoredT[Tissue]","inputs":{"enrichrscored":{"id":"gtex.0"}}},
              {"id":"gtex.2","type":"BarChartFrom[Scored[Tissue]]","inputs":{"terms":{"id":"gtex.1"}}},
            {"id":"lincs.0","type":"ExtractCFDEGSEGenesetSearch[LINCS_L1000_Chem_Pert_Consensus_Sigs]","inputs":{"searchResults":{"id":"enrichment-results"}}},
              {"id":"lincs.1","type":"EnrichrScoredTToScoredT[Drug]","inputs":{"enrichrscored":{"id":"lincs.0"}}},
              {"id":"lincs.2","type":"BarChartFrom[Scored[Drug]]","inputs":{"terms":{"id":"lincs.1"}}},
            {"id":"idg.0","type":"ExtractCFDEGSEGenesetSearch[IDG_Drug_Targets_2022]","inputs":{"searchResults":{"id":"enrichment-results"}}},
              {"id":"idg.1","type":"EnrichrScoredTToScoredT[Drug]","inputs":{"enrichrscored":{"id":"idg.0"}}},
              {"id":"idg.2","type":"BarChartFrom[Scored[Drug]]","inputs":{"terms":{"id":"idg.1"}}},
            {"id":"hubmap.0","type":"ExtractCFDEGSEGenesetSearch[HuBMAP_ASCTplusB_augmented_2022]","inputs":{"searchResults":{"id":"enrichment-results"}}},
              {"id":"hubmap.1","type":"EnrichrScoredTToScoredT[Tissue]","inputs":{"enrichrscored":{"id":"hubmap.0"}}},
              {"id":"hubmap.2","type":"BarChartFrom[Scored[Tissue]]","inputs":{"terms":{"id":"hubmap.1"}}},
            {"id":"glygen.0","type":"ExtractCFDEGSEGenesetSearch[GlyGen_Glycosylated_Proteins_2022]","inputs":{"searchResults":{"id":"enrichment-results"}}},
              {"id":"glygen.1","type":"EnrichrScoredTToScoredT[glycan]","inputs":{"enrichrscored":{"id":"glygen.0"}}},
              {"id":"glygen.2","type":"BarChartFrom[Scored[glycan]]","inputs":{"terms":{"id":"glygen.1"}}},
            {"id":"metabolomics.0","type":"ExtractCFDEGSEGenesetSearch[Metabolomics_Workbench_Metabolites_2022]","inputs":{"searchResults":{"id":"enrichment-results"}}},
              {"id":"metabolomics.1","type":"EnrichrScoredTToScoredT[Metabolite]","inputs":{"enrichrscored":{"id":"metabolomics.0"}}},
              {"id":"metabolomics.2","type":"BarChartFrom[Scored[Metabolite]]","inputs":{"terms":{"id":"metabolomics.1"}}},
            {"id":"motrpac.0","type":"ExtractCFDEGSEGenesetSearch[MoTrPAC_2023]","inputs":{"searchResults":{"id":"enrichment-results"}}},
              {"id":"motrpac.1","type":"EnrichrScoredTToScoredT[Tissue]","inputs":{"enrichrscored":{"id":"motrpac.0"}}},
              {"id":"motrpac.2","type":"BarChartFrom[Scored[Tissue]]","inputs":{"terms":{"id":"motrpac.1"}}},
        ],
        "metadata":{"title":"CFDE Gene Set Enrichment"}
      }}
      title="Playbook Workflow Builder: Gene Set Enrichment"
      description={<>Perform Gene Set Enrichment with this gene set against Common Fund program's gene sets, identifying significant overlaps using a pre-built PWB workflow. Run the workflow with {item.a_label}.</>}
      mode="report"
    />,
  },
  {
    compatible: (item) => item.type === 'gene_set',
    button: async ({ item }) => <G2SGButton
      body={{
        "term": item.a_label,
        "genes": await getGeneSet(item.id),
        "description": item.a_description
      }}
      title="GeneSetCart"
      description={<>GeneSetCart helps you to fetch gene sets from various data sources, augment, combine with set operations, visualize and analyze these gene sets in a single session. Start a new session with {item.a_label}.</>}
    />,
  },
  {
    compatible: (item) => item.type === 'gene_set',
    button: async ({ item }) => <GSEButton
      body={{
        "term": item.a_label,
        "genes": await getGeneSet(item.id),
        "description": item.a_description
      }}
      title="CFDE Gene Set Enrichment (GSE)"
      description={<>CFDE-GSE illuminates connections between the input gene set and various CF gene sets that overlap with the queried gene set. Query CFDE-GSE with {item.a_label}.</>}
    />,
  },
  {
    compatible: (item) => item.type === 'gene_set',
    button: async ({ item }) => <PWBButton
      body={{
        data: { gene_set: { type: "Input[Set[Gene]]", value: { set: await getGeneSet(item.id), description: item.a_label } } },
        workflow: [
          { id: "input_gene_set", type: "Input[Set[Gene]]", data: { id: "gene_set" } },
        ],
      }}
      title="Playbook Workflow Builder"
      description={<>The Playbook Workflow Builder helps you interactively construct workflows leveraging CFDE APIs without code. Start a new workflow with {item.a_label}.</>}
    />,
  },
  {
    compatible: (item) => typeof item.a_access_url !== 'undefined' && typeof item.a_access_url === 'string' && item.a_access_url.endsWith('.gmt'),
    button: async ({ item }) => <PWBButton
      body={{
        data: { gene_set_library: { type: "GMTFileUpload", value: { url: item.a_access_url, filename: item.a_filename, description: item.a_description } } },
        workflow: [
          { id: "input_gene_set_library", type: "GMTFileUpload", data: { id: "gene_set_library" } },
        ],
      }}
      title="Playbook Workflow Builder"
      description={<>The Playbook Workflow Builder helps you interactively construct workflows leveraging CFDE APIs without code. Start a new workflow with {item.a_label}.</>}
    />,
  },
]
export default modules
