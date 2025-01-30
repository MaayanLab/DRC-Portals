import {
  Box,
  Divider,
  IconButton,
  Link,
  LinkProps,
  Typography,
  styled,
} from "@mui/material";
import LaunchIcon from "@mui/icons-material/Launch";
import { CSSProperties } from "react";

import {
  ADMIN_LABELS,
  ANALYSIS_TYPE_LABEL,
  ANATOMY_LABEL,
  ASSAY_TYPE_LABEL,
  BIOSAMPLE_LABEL,
  BIOSAMPLE_RELATED_LABELS,
  COLLECTION_LABEL,
  COMPOUND_LABEL,
  CONTAINER_LABELS,
  CORE_LABELS,
  DATA_TYPE_LABEL,
  DCC_LABEL,
  DISEASE_LABEL,
  FILE_FORMAT_LABEL,
  FILE_LABEL,
  FILE_RELATED_LABELS,
  GENE_LABEL,
  ID_NAMESPACE_LABEL,
  NCBI_TAXONOMY_LABEL,
  PHENOTYPE_LABEL,
  PROJECT_LABEL,
  PROTEIN_LABEL,
  SAMPLE_PREP_METHOD_LABEL,
  SUBJECT_ETHNICITY_LABEL,
  SUBJECT_GRANULARITY_LABEL,
  SUBJECT_LABEL,
  SUBJECT_RACE_LABEL,
  SUBJECT_RELATED_LABELS,
  SUBJECT_SEX_LABEL,
  SUBSTANCE_LABEL,
  TERM_LABELS,
} from "@/lib/neo4j/constants";

export const EDGE_COLOR = "#797979";
export const CFDE_DARK_BLUE = "#336699";

export const GraphElement = styled(Box)(() => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "32px",
  marginTop: "3px",
  marginBottom: "3px",
  fontSize: "0.8125rem",
}));

export const NodeElement = styled(GraphElement)(() => ({
  color: "#fff",
  borderRadius: "16px",
}));

export const RelationshipElement = styled(GraphElement)(() => ({
  backgroundColor: EDGE_COLOR,
  borderColor: EDGE_COLOR,
  borderRadius: 3,
  borderWidth: "thin",
}));

export const AnonymousNodeElement = styled(Box)(() => ({
  height: "1.9em",
  width: "1.9em",
  border: "1px solid #797979",
  borderRadius: "50%",
  marginTop: "3px",
  marginBottom: "3px",
}));

export const EntityText = styled(Typography)(() => ({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: "0.8rem",
}));

export const NodeText = styled(EntityText)(() => ({
  paddingLeft: "11px",
  paddingRight: "11px",
}));

export const RelationshipText = styled(EntityText)(() => ({
  paddingLeft: "3px",
  paddingRight: "3px",
  color: "#FFF",
}));

export const DividerContainer = styled(Box)(() => ({
  width: "16px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}));

export const EntityDivider = styled(Divider)(() => ({
  width: "16px",
  backgroundColor: "#000",
  borderBottomWidth: "2px",
  borderColor: EDGE_COLOR,
}));

export const TransparentIconButton = styled(IconButton)({
  "&.MuiIconButton-root:hover": { backgroundColor: "transparent" },
});

export const StyledLink = styled(Link)(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  textDecoration: "none",
  color: theme.palette.secondary.main,
  "&:hover": {
    textDecoration: "underline",
  },
}));

export const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export const ExternalLink = ({ children, ...props }: LinkProps) => (
  <StyledLink {...props} target="_blank" rel="noopener">
    <Box component="span" mr={0.5}>
      {children}
    </Box>
    <LaunchIcon fontSize="small" />
  </StyledLink>
);

// Links
export const EDAM_LINK = (
  <ExternalLink href="http://edamontology.org/">EDAM</ExternalLink>
);
export const NCBI_TAXONOMY_LINK = (
  <ExternalLink href="https://www.ncbi.nlm.nih.gov/taxonomy">
    NCBI Taxonomy
  </ExternalLink>
);
export const OBI_LINK = (
  <ExternalLink href="https://obi-ontology.org/">OBI</ExternalLink>
);
export const UBERON_LINK = (
  <ExternalLink href="https://www.ebi.ac.uk/ols/ontologies/uberon">
    UBERON
  </ExternalLink>
);
export const HPO_LINK = (
  <ExternalLink href="https://hpo.jax.org/">HPO</ExternalLink>
);
export const DO_LINK = (
  <ExternalLink href="https://disease-ontology.org/">DO</ExternalLink>
);

// Entity class style names
export const ADMIN_NODE_CLASS = "admin-node";
export const CONTAINER_NODE_CLASS = "container-node";
export const FILE_NODE_CLASS = "file-node";
export const FILE_RELATED_NODE_CLASS = "file-related-node";
export const BIOSAMPLE_NODE_CLASS = "biosample-node";
export const BIOSAMPLE_RELATED_NODE_CLASS = "biosample-related-node";
export const SUBJECT_NODE_CLASS = "subject-node";
export const SUBJECT_RELATED_NODE_CLASS = "subject-related-node";
export const TERM_NODE_CLASS = "term-node";

// Entity styles
export const ADMIN_NODE_COLOR = "#ffc454";
export const CONTAINER_NODE_COLOR = "#4c8eda";
export const FILE_NODE_COLOR = "#ee5f5f";
export const FILE_RELATED_NODE_COLOR = "#d46989";
export const SUBJECT_NODE_COLOR = "#e9adc2";
export const SUBJECT_RELATED_NODE_COLOR = "#c186b7";
export const BIOSAMPLE_NODE_COLOR = "#d4c1a6";
export const BIOSAMPLE_RELATED_NODE_COLOR = "#806e47";
export const TERM_NODE_COLOR = "#569480";

// Map of node label to the appropriate representation string
export const NODE_DISPLAY_PROPERTY_MAP: ReadonlyMap<string, string> = new Map([
  [DCC_LABEL, "name"],
  [ID_NAMESPACE_LABEL, "name"],
  [COLLECTION_LABEL, "name"],
  [PROJECT_LABEL, "name"],
  [FILE_LABEL, "local_id"],
  [SUBJECT_LABEL, "local_id"],
  [BIOSAMPLE_LABEL, "local_id"],
  [ANATOMY_LABEL, "name"],
  [COMPOUND_LABEL, "name"],
  [DISEASE_LABEL, "name"],
  [GENE_LABEL, "name"],
  [NCBI_TAXONOMY_LABEL, "name"],
  [PHENOTYPE_LABEL, "name"],
  [PROTEIN_LABEL, "name"],
  [SUBSTANCE_LABEL, "name"],
  [ANALYSIS_TYPE_LABEL, "name"],
  [ASSAY_TYPE_LABEL, "name"],
  [DATA_TYPE_LABEL, "name"],
  [FILE_FORMAT_LABEL, "name"],
  [SUBJECT_ETHNICITY_LABEL, "name"],
  [SUBJECT_RACE_LABEL, "name"],
  [SUBJECT_GRANULARITY_LABEL, "name"],
  [SUBJECT_SEX_LABEL, "name"],
  [SAMPLE_PREP_METHOD_LABEL, "name"],
]);

export const ENTITY_STYLES_MAP: ReadonlyMap<string, CSSProperties> = new Map([
  [
    ADMIN_NODE_CLASS,
    {
      color: "#000",
      backgroundColor: ADMIN_NODE_COLOR,
    },
  ],
  [
    CONTAINER_NODE_CLASS,
    {
      color: "#000",
      backgroundColor: CONTAINER_NODE_COLOR,
    },
  ],
  [
    FILE_NODE_CLASS,
    {
      color: "#000",
      backgroundColor: FILE_NODE_COLOR,
    },
  ],
  [
    FILE_RELATED_NODE_CLASS,
    {
      color: "#000",
      backgroundColor: FILE_RELATED_NODE_COLOR,
    },
  ],
  [
    SUBJECT_NODE_CLASS,
    {
      color: "#000",
      backgroundColor: SUBJECT_NODE_COLOR,
    },
  ],
  [
    SUBJECT_RELATED_NODE_CLASS,
    {
      color: "#000",
      backgroundColor: SUBJECT_RELATED_NODE_COLOR,
    },
  ],
  [
    BIOSAMPLE_NODE_CLASS,
    {
      color: "#000",
      backgroundColor: BIOSAMPLE_NODE_COLOR,
    },
  ],
  [
    BIOSAMPLE_RELATED_NODE_CLASS,
    {
      color: "#000",
      backgroundColor: BIOSAMPLE_RELATED_NODE_COLOR,
    },
  ],
  [
    TERM_NODE_CLASS,
    {
      color: "#000",
      backgroundColor: TERM_NODE_COLOR,
    },
  ],
]);

// Map of node label to appropriate color
export const NODE_CLASS_MAP: ReadonlyMap<string, string> = new Map([
  ...ADMIN_LABELS.map((label): [string, string] => [label, ADMIN_NODE_CLASS]),
  ...CONTAINER_LABELS.map((label): [string, string] => [
    label,
    CONTAINER_NODE_CLASS,
  ]),
  [FILE_LABEL, FILE_NODE_CLASS],
  ...FILE_RELATED_LABELS.map((label): [string, string] => [
    label,
    FILE_RELATED_NODE_CLASS,
  ]),
  [SUBJECT_LABEL, SUBJECT_NODE_CLASS],
  ...SUBJECT_RELATED_LABELS.map((label): [string, string] => [
    label,
    SUBJECT_RELATED_NODE_CLASS,
  ]),
  [BIOSAMPLE_LABEL, BIOSAMPLE_NODE_CLASS],
  ...BIOSAMPLE_RELATED_LABELS.map((label): [string, string] => [
    label,
    BIOSAMPLE_RELATED_NODE_CLASS,
  ]),
  ...TERM_LABELS.map((label): [string, string] => [label, TERM_NODE_CLASS]),
]);

export const NODE_TOOLTIP_PROPS_MAP: ReadonlyMap<string, string[]> = new Map([
  [DCC_LABEL, ["id", "name", "description", "contact_name", "contact_email"]],
  [ID_NAMESPACE_LABEL, ["id", "name", "description"]],
  [PROJECT_LABEL, ["local_id", "name", "description", "persistent_id"]],
  [COLLECTION_LABEL, ["local_id", "name", "description", "persistent_id"]],
  [FILE_LABEL, ["local_id", "filename", "size_in_bytes", "persistent_id"]],
  [BIOSAMPLE_LABEL, ["local_id", "persistent_id"]],
  [SUBJECT_LABEL, ["local_id", "granularity", "persistent_id"]],
  ...TERM_LABELS.map((label): [string, string[]] => [
    label,
    ["id", "name", "description", "synonyms"],
  ]),
  ...FILE_RELATED_LABELS.map((label): [string, string[]] => [
    label,
    ["id", "name", "description"],
  ]),
  ...SUBJECT_RELATED_LABELS.map((label): [string, string[]] => [
    label,
    ["id", "name", "description"],
  ]),
  ...BIOSAMPLE_RELATED_LABELS.map((label): [string, string[]] => [
    label,
    ["id", "name", "description"],
  ]),
]);

export const SEARCH_PLACEHOLDER_OPTIONS = [80, 110, 145, 170, 240];
