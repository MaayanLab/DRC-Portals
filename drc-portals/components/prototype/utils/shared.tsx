import ArrowRightAltRoundedIcon from "@mui/icons-material/ArrowRightAltRounded";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Box, Link } from "@mui/material";
import { CSSProperties } from "react";
import { v4 } from "uuid";

import {
  ANALYSIS_TYPE_LABEL,
  ANATOMY_LABEL,
  ASSAY_TYPE_LABEL,
  COMPOUND_LABEL,
  DATA_TYPE_LABEL,
  DISEASE_LABEL,
  FILE_FORMAT_LABEL,
  GENE_LABEL,
  NCBI_TAXONOMY_LABEL,
  NODE_LABELS,
  PHENOTYPE_LABEL,
  PROTEIN_LABEL,
  RELATIONSHIP_TYPES,
  SAMPLE_PREP_METHOD_LABEL,
  SUBSTANCE_LABEL,
} from "@/lib/neo4j/constants";
import { Direction } from "@/lib/neo4j/enums";
import { NodeResult } from "@/lib/neo4j/types";

import { EDGE_COLOR } from "../constants/shared";
import {
  DividerContainer,
  ENTITY_STYLES_MAP,
  EntityDivider,
  NODE_CLASS_MAP,
  NODE_DISPLAY_PROPERTY_MAP,
  NodeElement,
  NodeText,
  RelationshipElement,
  RelationshipText,
} from "../constants/shared";
import {
  NodeElementFactory,
  RelationshipElementFactory,
} from "../types/shared";

export const createNodeElement = (
  label: string,
  text?: string,
  customStyle?: CSSProperties
) => {
  const nodeLabelClass = NODE_CLASS_MAP.get(label);
  const labelStyles =
    nodeLabelClass === undefined
      ? undefined
      : ENTITY_STYLES_MAP.get(nodeLabelClass);
  return (
    <NodeElement key={v4()} style={{ ...labelStyles, ...customStyle }}>
      <NodeText>{text || label}</NodeText>
    </NodeElement>
  );
};

export const getNodeDisplayProperty = (
  label: string,
  node: NodeResult
): string => {
  const displayProp = NODE_DISPLAY_PROPERTY_MAP.get(label) || "name";
  return node.properties[displayProp] || label;
};

const createLineDividerElement = () => (
  <DividerContainer key={v4()}>
    <EntityDivider></EntityDivider>
  </DividerContainer>
);

export const createArrowDividerElement = (flip: boolean) => (
  <DividerContainer key={v4()}>
    <ArrowRightAltRoundedIcon
      sx={{
        color: EDGE_COLOR,
        transform: flip ? null : "rotate(180deg)",
      }}
    />
  </DividerContainer>
);

const createRelationshipElement = (type: string, style?: CSSProperties) => (
  <RelationshipElement key={v4()} style={style}>
    <RelationshipText>{type}</RelationshipText>
  </RelationshipElement>
);

export const createDirectedRelationshipElement = (
  type: string,
  direction: Direction,
  text?: string,
  style?: CSSProperties
) => (
  <Box key={v4()} sx={{ display: "flex" }}>
    {direction === Direction.OUTGOING || direction === Direction.UNDIRECTED
      ? createLineDividerElement()
      : createArrowDividerElement(false)}
    {createRelationshipElement(text || type, style)}
    {direction === Direction.INCOMING || direction === Direction.UNDIRECTED
      ? createLineDividerElement()
      : createArrowDividerElement(true)}
  </Box>
);

export const LABEL_TO_FACTORY_MAP: ReadonlyMap<string, NodeElementFactory> =
  new Map([
    ...Array.from(NODE_LABELS).map((label): [string, NodeElementFactory] => [
      label,
      createNodeElement,
    ]),
  ]);

const TYPE_TO_FACTORY_MAP: ReadonlyMap<string, RelationshipElementFactory> =
  new Map([
    ...Array.from(RELATIONSHIP_TYPES).map(
      (type): [string, RelationshipElementFactory] => [
        type,
        createDirectedRelationshipElement,
      ]
    ),
  ]);

export const labelInFactoryMapFilter = (label: string) => {
  if (!LABEL_TO_FACTORY_MAP.has(label)) {
    console.warn(`Label "${label}" not found in node factory map!`);
    return false;
  }
  return true;
};

export const typeInFactoryMapFilter = (type: string) => {
  if (!TYPE_TO_FACTORY_MAP.has(type)) {
    console.warn(`Type "${type}" not found in relationship factory map!`);
    return false;
  }
  return true;
};

export const downloadBlob = (data: string, type: string, filename: string) => {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
};

export const getOntologyLink = (label: string, id: string) => {
  const [prefix, id_num] = id.split(":");
  switch (label) {
    case ANALYSIS_TYPE_LABEL:
    case ASSAY_TYPE_LABEL:
    case SAMPLE_PREP_METHOD_LABEL:
      return `http://purl.obolibrary.org/obo/OBI_${id.split(":")[1]}`;
    case ANATOMY_LABEL: {
      if (prefix === "CL") {
        return `http://purl.obolibrary.org/obo/CL_${id_num}`;
      } else {
        return `http://purl.obolibrary.org/obo/UBERON_${id_num}`;
      }
    }
    case COMPOUND_LABEL:
      if (id[0] === "G") {
        return `https://glytoucan.org/Structures/Glycans/${id}`;
      } else {
        return `https://pubchem.ncbi.nlm.nih.gov/compound/${id}`;
      }
    case DATA_TYPE_LABEL:
      if (prefix === "ILX") {
        return `http://uri.interlex.org/base/ilx_${id_num}`;
      } else {
        return `http://edamontology.org/data_${id_num}`;
      }
    case DISEASE_LABEL:
      return `https://disease-ontology.org/term/${id}/obo/`;
    case GENE_LABEL:
      return `https://useast.ensembl.org/Multi/Search/Results?q=${id};site=ensembl_all`;
    case FILE_FORMAT_LABEL:
      return `http://edamontology.org/format_${id_num}`;
    case NCBI_TAXONOMY_LABEL:
      return `https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=${id_num}`;
    case PHENOTYPE_LABEL:
      return `https://hpo.jax.org/browse/term/${id}`;
    case PROTEIN_LABEL:
      return `https://www.uniprot.org/uniprotkb/${id}`;
    case SUBSTANCE_LABEL:
      return `https://pubchem.ncbi.nlm.nih.gov/substance/${id}`;
    default:
      return "";
  }
};

export const getExternalLinkElement = (link: string, text: string) => (
  <Link href={link} target="_blank" rel="noopener" color="secondary">
    {text}
    <OpenInNewIcon
      fontSize="small"
      color="secondary"
      sx={{ marginLeft: "2px" }}
    />
  </Link>
);
