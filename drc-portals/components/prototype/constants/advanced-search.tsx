import { buttonClasses } from "@mui/base/Button";
import { Tab as BaseTab, tabClasses } from "@mui/base/Tab";
import { TabsList as BaseTabsList } from "@mui/base/TabsList";
import { TabPanel as BaseTabPanel } from "@mui/base/TabPanel";
import { styled } from "@mui/system";

export const ROW_SPACING = 1;
export const COLUMN_SPACING = 1;
export const LEFT_COLUMN_XS_WIDTH = 4;
export const MIDDLE_COLUMN_XS_WIDTH = 4;
export const LEFT_COLUMN_SM_WIDTH = 3;
export const MIDDLE_COLUMN_SM_WIDTH = 6;
export const LEFT_COLUMN_MD_WIDTH = 2.5;
export const MIDDLE_COLUMN_MD_WIDTH = 5.5;
export const RIGHT_COLUMN_MD_WIDTH = 4;
export const XS_COLUMNS = 4;
export const SM_COLUMNS = 9;
export const MD_COLUMNS = 12;

export const DCC_ABBREVS: readonly string[] = [
  "4DN_DCIC",
  "ERCC_DCC",
  "GTex",
  "GlyGen",
  "HMP",
  "HuBMAP",
  "IDG",
  "KFDRC",
  "LINCS",
  "MW",
  "MoTrPAC",
  "SPARK",
];

export const SUBJECT_GENDERS: ReadonlyMap<string, string> = new Map([
  ["cfde_subject_sex:0", "Indeterminate"],
  ["cfde_subject_sex:1", "Female"],
  ["cfde_subject_sex:2", "Male"],
  ["cfde_subject_sex:3", "Intersex"],
]);

export const SUBJECT_RACES: ReadonlyMap<string, string> = new Map([
  ["cfde_subject_race:0", "American Indian or Alaska Native"],
  ["cfde_subject_race:1", "Asian or Pacific Islander (Legacy)"],
  ["cfde_subject_race:2", "Black or African American"],
  ["cfde_subject_race:3", "White"],
  ["cfde_subject_race:4", "Other"],
  ["cfde_subject_race:5", "Asian"],
  ["cfde_subject_race:6", "Native Hawaiian or Other Pacific Islander"],
]);

export const NODE_HELPER_TEXT =
  "Nodes represent distinct entities in the C2M2 graph model.";

export const RELATIONSHIP_HELPER_TEXT =
  "Relationships define a connection between nodes in the C2M2 graph model.";

export const HELPER_TOOLTIP_SLOT_PROPS = {
  popper: {
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, -7],
        },
      },
    ],
  },
};

export const SCHEMA_SEARCH_TEXT_FIELD_SX_PROPS = {
  margin: 1,
  marginLeft: 0,
  width: "84px",
  minWidth: "84px",
};

export const Tab = styled(BaseTab)(({ theme }) => ({
  color: "#fff",
  cursor: "pointer",
  fontSize: "0.875rem",
  fontWeight: 600,
  backgroundColor: "transparent",
  padding: "10px 12px",
  margin: "6px",
  border: "none",
  borderRadius: "7px",
  display: "flex",
  alignContent: "center",
  alignItems: "center",
  justifyContent: "space-between",
  [`&:hover`]: {
    backgroundColor: theme.palette.secondary.main,
  },
  [`&:focus`]: {
    color: "#fff",
    outline: `3px solid ${theme.palette.secondary.light}`,
  },
  [`&.${tabClasses.selected}`]: {
    backgroundColor: "#fff",
    color: `${theme.palette.secondary.main}`,
  },
  [`&.${buttonClasses.disabled}`]: {
    opacity: "0.5",
    cursor: "not-allowed",
  },
}));

export const TabPanel = styled(BaseTabPanel)(() => ({
  width: "100%",
  fontSize: "0.875rem",
}));

export const TabsList = styled(BaseTabsList)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  borderRadius: "12px",
  marginBottom: "8px",
  display: "inline-flex",
  alignContent: "center",
  alignItems: "center",
  justifyContent: "space-between",
  boxShadow: "0px 4px 8px grey",
}));
