/**
 * All analyze modules, a function defines whether the module itself is compatible,
 *  and the button defines what to show.
 */
import PWBButton from "@/app/data/processed/PWBButton";
import G2SGButton from "./G2SGButton";
import GSEButton from "./GSEButton";
import prisma from "@/lib/prisma/slow";
import { cache } from "react";

const getGeneSet = cache(async (id: string) => (
  await prisma.geneSetNode.findUnique({
    where: { id },
    select: { genes: { select: { entity: { select: { node: { select: { label: true } } } } } } }
  })
)?.genes.map(r => r.entity.node.label))

const modules: {
  compatible: (item: { id: string; label: string; description: string; }) => boolean,
  button: (props: { item: { id: string; label: string; description: string; } }) => React.ReactNode,
}[] = [
  {
    compatible: (item) => true,
    button: async ({ item }) => <PWBButton
      body={{
        "data":{
          "gene-set": {
            "type":"Input[Set[Gene]]",
            "value":{
              "description": item.description,
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
      description={<>Perform Gene Set Enrichment with this gene set against Common Fund program's gene sets, identifying significant overlaps using a pre-built PWB workflow. Run the workflow with {item.label}.</>}
      mode="report"
    />,
  },
  {
    compatible: (item) => true,
    button: async ({ item }) => <G2SGButton
      body={{
        "term": item.label,
        "genes": await getGeneSet(item.id),
        "description": item.description
      }}
      title="GeneSetCart"
      description={<>GeneSetCart helps you to fetch gene sets from various data sources, augment, combine with set operations, visualize and analyze these gene sets in a single session. Start a new session with {item.label}.</>}
    />,
  },
  {
    compatible: (item) => true,
    button: async ({ item }) => <GSEButton
      body={{
        "term": item.label,
        "genes": await getGeneSet(item.id),
        "description": item.description
      }}
      title="CFDE Gene Set Enrichment (GSE)"
      description={<>CFDE-GSE illuminates connections between the input gene set and various CF gene sets that overlap with the queried gene set. Query CFDE-GSE with {item.label}.</>}
    />,
  },
  {
    compatible: (item) => true,
    button: async ({ item }) => <PWBButton
      body={{
        data: { gene_set: { type: "Input[Set[Gene]]", value: { set: await getGeneSet(item.id), description: item.label } } },
        workflow: [
          { id: "input_gene_set", type: "Input[Set[Gene]]", data: { id: "gene_set" } },
        ],
      }}
      title="Playbook Workflow Builder"
      description={<>The Playbook Workflow Builder helps you interactively construct workflows leveraging CFDE APIs without code. Start a new workflow with {item.label}.</>}
    />,
  },
]

export default modules
