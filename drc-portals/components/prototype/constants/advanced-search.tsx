import { buttonClasses } from "@mui/base/Button";
import { Tab as BaseTab, tabClasses } from "@mui/base/Tab";
import { TabsList as BaseTabsList } from "@mui/base/TabsList";
import { TabPanel as BaseTabPanel } from "@mui/base/TabPanel";
import { styled } from "@mui/system";

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
