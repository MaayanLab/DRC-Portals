import { AdvancedSearchValues } from "../interfaces/advanced-search";

export const createTextSearchParams = (
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

export const getTextSearchValues = (
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

export const getSearchBarValue = (searchParams: URLSearchParams) => {
  const query = searchParams.get("q");
  const anyQuery = searchParams.get("as_q");
  const phraseQuery = searchParams.get("as_epq");
  const allQuery = searchParams.get("as_aq");
  const noneQuery = searchParams.get("as_eq");
  let newValue = [];

  if (query !== null && query.length > 0) {
    newValue.push(query);
  }

  if (anyQuery !== null && anyQuery.length > 0) {
    newValue.push(anyQuery);
  }

  if (phraseQuery !== null && phraseQuery.length > 0) {
    newValue.push(`"${phraseQuery}"`);
  }

  if (allQuery !== null && allQuery.length > 0) {
    newValue.push(
      allQuery
        .split(" ")
        .map((s) => `+${s}`)
        .join(" ")
    );
  }

  if (noneQuery !== null && noneQuery.length > 0) {
    newValue.push(
      noneQuery
        .split(" ")
        .map((s) => `-${s}`)
        .join(" ")
    );
  }

  return newValue.join(" ");
};

export const getSchemaSearchValue = (params: URLSearchParams) => {
  const schemaQuery = params.get("schema_q");

  if (schemaQuery === null) {
    return null;
  }

  try {
    const value = JSON.parse(atob(schemaQuery));
    // TODO: Add parse step here
    return value;
  } catch (e) {
    // If for any reason (decoding, parsing, etc.) we couldn't get the state, return null instead
    return null;
  }
};
