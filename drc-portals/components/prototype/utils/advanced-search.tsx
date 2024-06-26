import { AdvancedSearchValues } from "../interfaces/advanced-search";

export const createAdvancedSynonymSearchParams = (
  q?: string | null,
  epq?: string | null,
  aq?: string | null,
  eq?: string | null,
  file?: string | null,
  sub?: string | null,
  bio?: string | null,
  subg?: string[],
  subr?: string[],
  dccs?: string[]
) => {
  if (dccs === undefined) {
    dccs = [];
  }
  let query =
    `?as_q=${q || ""}` +
    `&as_epq=${epq || ""}` +
    `&as_aq=${aq || ""}` +
    `&as_eq=${eq || ""}` +
    `&as_file=${file || ""}` +
    `&as_sub=${sub || ""}` +
    `&as_bio=${bio || ""}` +
    `&as_subg=${(subg || []).join(",")}` +
    `&as_subr=${(subr || []).join(",")}` +
    `&as_dccs=${(dccs || []).join(",")}`;
  return new URLSearchParams(query);
};

export const getAdvancedSynonymSearchValuesFromParams = (
  params: URLSearchParams
): AdvancedSearchValues => {
  const query = params.get("q") || "";
  const anyQuery = params.get("as_q") || "";
  const phraseQuery = params.get("as_epq") || "";
  const allQuery = params.get("as_aq") || "";
  const noneQuery = params.get("as_eq") || "";
  const searchFile =
    params.get("as_file") === null ||
    (params.get("as_file") as string).toLowerCase() === "true";
  const searchSubject =
    params.get("as_sub") === null ||
    (params.get("as_sub") as string).toLowerCase() === "true";
  const searchBiosample =
    params.get("as_bio") === null ||
    (params.get("as_bio") as string).toLowerCase() === "true";
  const subjectGenders = (params.get("as_subg") || "")
    .split(",")
    .filter((n) => n !== "");
  const subjectRaces = (params.get("as_subr") || "")
    .split(",")
    .filter((n) => n !== "");
  const dccNames = (params.get("as_dccs") || "")
    .split(",")
    .filter((n) => n !== "");

  return {
    query,
    anyQuery,
    phraseQuery,
    allQuery,
    noneQuery,
    searchFile,
    searchSubject,
    searchBiosample,
    subjectGenders,
    subjectRaces,
    dccNames,
  };
};
