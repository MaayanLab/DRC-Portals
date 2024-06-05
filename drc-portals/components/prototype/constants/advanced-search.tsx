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
