import { NODE_REPR_OBJECT_STR, REL_REPR_OBJECT_STR } from "../constants/neo4j";

export const createSynonymSearchCypher = (
  searchTerm: string,
  searchFile = true,
  searchSubject = true,
  searchBiosample = true,
  subjectGenders?: string[],
  subjectRaces?: string[],
  dccNames?: string[],
  synLimit = 100,
  termLimit = 100,
  coreLimit = 100,
  projLimit = 10
) => {
  if (dccNames === undefined) {
    dccNames = [];
  }

  const termFilters = [];
  const dccNameFilter =
    dccNames.length > 0
      ? `WHERE dcc.abbreviation IN [${dccNames
          .map((n) => `'${n}'`)
          .join(", ")}]`
      : "WHERE TRUE";

  if (searchFile) {
    termFilters.push("(label IN ['File'])");
  }

  if (searchSubject) {
    let subjectFilter = "(label IN ['Subject']";

    if (subjectGenders !== undefined && subjectGenders.length > 0) {
      subjectFilter += `AND core.sex IN [${subjectGenders
        .map((g) => `'cfde_subject_sex:${g}'`)
        .join(", ")}]`;
    }

    if (subjectRaces !== undefined && subjectRaces.length > 0) {
      subjectFilter += `AND core.race IN [${subjectRaces
        .map((g) => `'cfde_subject_race:${g}'`)
        .join(", ")}]`;
    }

    subjectFilter += ")";
    termFilters.push(subjectFilter);
  }

  if (searchBiosample) {
    termFilters.push("(label IN ['Biosample'])");
  }

  // TODO: Consider pushing the parameterization to the driver
  return `
  CALL db.index.fulltext.queryNodes('synonymIdx', '${searchTerm}')
  YIELD node AS synonym
  WITH synonym
  LIMIT ${synLimit}
  CALL {
    WITH synonym
    MATCH (synonym)<-[:HAS_SYNONYM]-(term)
    RETURN DISTINCT term
    LIMIT ${termLimit}
  }
  CALL {
    WITH synonym, term
    MATCH (term)<-[]-(core)
    WHERE any(
      label IN labels(core)
        WHERE
          ${termFilters.join(" OR\n\t\t")}
    )
    RETURN DISTINCT core
    LIMIT ${coreLimit}
  }
  CALL {
    WITH synonym, term, core
    MATCH (core)<-[:CONTAINS]-(project:Project)
    RETURN DISTINCT project
    LIMIT ${projLimit}
  }
  CALL {
    WITH synonym, term, core, project
    MATCH (project)<-[*]-(dcc:DCC)
    ${dccNameFilter}
    RETURN DISTINCT dcc
  }
  MATCH path=(term)<-[]-(core)<-[:CONTAINS]-(project:Project)<-[*]-(dcc:DCC)
  UNWIND nodes(path) AS n
  UNWIND relationships(path) AS r
  RETURN collect(DISTINCT ${NODE_REPR_OBJECT_STR}) AS nodes, collect(DISTINCT ${REL_REPR_OBJECT_STR}) AS relationships
  `;
};
