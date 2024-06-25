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

export const DCC_NAMES: readonly string[] = [
  "4DN",
  "ERCC",
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
  ["0", "Indeterminate"],
  ["1", "Female"],
  ["2", "Male"],
  ["3", "Intersex"],
]);

export const SUBJECT_RACES: ReadonlyMap<string, string> = new Map([
  ["0", "American Indian or Alaska Native"],
  ["1", "Asian or Pacific Islander (Legacy)"],
  ["2", "Black or African American"],
  ["3", "White"],
  ["4", "Other"],
  ["5", "Asian"],
  ["6", "Native Hawaiian or Other Pacific Islander"],
]);

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
  justifyContent: "center",
  [`&:hover`]: {
    backgroundColor: theme.palette.secondary.main,
  },
  [`&:focus`]: {
    color: "#fff",
    outline: `3px solid ${theme.palette.secondary.light}`,
  },
  [`&.${tabClasses.selected}`]: {
    backgroundColor: "#fff",
    color: `${theme.palette.secondary.dark}`,
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
  marginBottom: "16px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  alignContent: "space-between",
  boxShadow: "0px 4px 30px grey",
}));
