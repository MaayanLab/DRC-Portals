import { AdvancedSearchValues } from "../interfaces/advanced-search";
import { SchemaSearchPathSchema } from "../schemas/schema-search";

export const createTextSearchParams = (
  q?: string,
  epq?: string,
  aq?: string,
  eq?: string,
  searchFile?: boolean,
  searchSubject?: boolean,
  searchBiosample?: boolean,
  subg?: string[],
  subr?: string[],
  dccs?: string[]
) => {
  const coreLabels = [
    ...(searchFile ? ["File"] : []),
    ...(searchSubject ? ["Subject"] : []),
    ...(searchBiosample ? ["Biosample"] : []),
  ];

  let query =
    `?as_q=${encodeURIComponent(q || "")}` +
    `&as_epq=${encodeURIComponent(epq || "")}` +
    `&as_aq=${encodeURIComponent(aq || "")}` +
    `&as_eq=${encodeURIComponent(eq || "")}` +
    `&as_core_labels=${encodeURIComponent(coreLabels.join(","))}` +
    `&as_subg=${encodeURIComponent((subg || []).join(","))}` +
    `&as_subr=${encodeURIComponent((subr || []).join(","))}` +
    `&as_dccs=${encodeURIComponent((dccs || []).join(","))}`;
  return new URLSearchParams(query);
};

export const getTextSearchValues = (
  params: URLSearchParams
): AdvancedSearchValues => {
  const query = decodeURIComponent(params.get("q") || "");
  const anyQuery = decodeURIComponent(params.get("as_q") || "");
  const phraseQuery = decodeURIComponent(params.get("as_epq") || "");
  const allQuery = decodeURIComponent(params.get("as_aq") || "");
  const noneQuery = decodeURIComponent(params.get("as_eq") || "");
  const coreLabels = decodeURIComponent(params.get("as_core_labels") || "")
    .split(",")
    .filter((n) => n !== "");
  const subjectGenders = decodeURIComponent(params.get("as_subg") || "")
    .split(",")
    .filter((n) => n !== "");
  const subjectRaces = decodeURIComponent(params.get("as_subr") || "")
    .split(",")
    .filter((n) => n !== "");
  const dccAbbrevs = decodeURIComponent(params.get("as_dccs") || "")
    .split(",")
    .filter((n) => n !== "");

  return {
    query,
    anyQuery,
    phraseQuery,
    allQuery,
    noneQuery,
    coreLabels,
    subjectGenders,
    subjectRaces,
    dccAbbrevs,
  };
};

export const getSearchBarValue = (searchParams: URLSearchParams) => {
  const query = decodeURIComponent(searchParams.get("q") || "");
  const anyQuery = decodeURIComponent(searchParams.get("as_q") || "");
  const phraseQuery = decodeURIComponent(searchParams.get("as_epq") || "");
  const allQuery = decodeURIComponent(searchParams.get("as_aq") || "");
  const noneQuery = decodeURIComponent(searchParams.get("as_eq") || "");
  let newValue = [];

  if (query.length > 0) {
    newValue.push(query);
  }

  if (anyQuery.length > 0) {
    newValue.push(anyQuery);
  }

  if (phraseQuery.length > 0) {
    newValue.push(`"${phraseQuery}"`);
  }

  if (allQuery.length > 0) {
    newValue.push(
      allQuery
        .split(" ")
        .map((s) => `+${s}`)
        .join(" ")
    );
  }

  if (noneQuery.length > 0) {
    newValue.push(
      noneQuery
        .split(" ")
        .map((s) => `-${s}`)
        .join(" ")
    );
  }

  return newValue.join(" ");
};

export const getSchemaSearchValue = (
  params: URLSearchParams,
  errorCallback: () => void
) => {
  const schemaQuery = params.get("schema_q");

  if (schemaQuery === null) {
    return null;
  }

  try {
    const value = JSON.parse(atob(schemaQuery));

    if (!Array.isArray(value)) {
      throw TypeError("Decoded schema search value was not an array.");
    }

    // If this succeeds without throwing, then we certainly have a valid schema search value
    value.forEach((path) => SchemaSearchPathSchema.parse(path));

    return value;
  } catch (e) {
    // If for any reason (decoding, parsing, etc.) we couldn't get the state, call the error callback and return null instead
    errorCallback();
    return null;
  }
};
