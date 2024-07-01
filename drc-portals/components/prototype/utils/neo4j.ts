import { OPERATOR_FUNCTIONS } from "../constants/schema-search";
import { Direction } from "../enums/schema-search";
import {
  BasePropertyFilter,
  SchemaSearchPath,
} from "../interfaces/schema-search";
import { PredicateFn, SearchBarOption } from "../types/schema-search";

import { isRelationshipOption } from "./schema-search";

export const createNodeReprStr = (varName: string) => {
  return `{
    identity: id(${varName}),
    labels: labels(${varName}),
    properties: properties(${varName})
  }`;
};

export const createRelReprStr = (varName: string) => {
  return `{
    identity: id(${varName}),
    type: type(${varName}),
    properties: properties(${varName}),
    start: id(startNode(${varName})),
    end: id(endNode(${varName}))
  }`;
};

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
  RETURN collect(DISTINCT ${createNodeReprStr(
    "n"
  )}) AS nodes, collect(DISTINCT ${createRelReprStr("r")}) AS relationships
  `;
};

export const createPredicate = (
  variable: string,
  filter: BasePropertyFilter
) => {
  const predicate = OPERATOR_FUNCTIONS.has(filter.operator)
    ? (OPERATOR_FUNCTIONS.get(filter.operator) as PredicateFn)(
        variable,
        filter.name,
        filter.value
      )
    : undefined;

  if (predicate === undefined) {
    console.warn(
      `No predicates exist for operator ${filter.operator} on property ${filter.name}!`
    );
  }
  return predicate;
};

export const createWhereClause = (predicates: string[]) => {
  if (predicates.length === 0) {
    return "// No WHERE clause in this query!";
  }

  let clause = "WHERE ";
  predicates.forEach((predicate, index) => {
    // If it's the first filter in a list of one, or it's the last filter, don't add a boolean operator
    if (
      (index === 0 && predicates.length === 1) ||
      index === predicates.length - 1
    ) {
      clause += `${predicate}`;
    } else {
      clause += `${predicate} AND `; // TODO: Could extend this to allow multiple types of boolean operators, it's a bit of a big feature though
    }
  });

  return clause;
};

export const getMatchSubpattern = (
  element: SearchBarOption,
  subPatternIdx: number,
  prevIsRelationship: boolean,
  patternLength: number
) => {
  let subPattern = "";
  const elementIsRelationship = isRelationshipOption(element);
  const variable = element.key || "";

  // If the first element of the pattern is a relationship, prepend it with an anonymous node
  if (subPatternIdx === 0 && elementIsRelationship) {
    subPattern += `()`;
  }

  // If the current and previous element are both Relationships, then we need to add an anonymous node between them
  if (elementIsRelationship && prevIsRelationship) {
    subPattern += `()`;
  }

  // If the current and previous element are both Nodes, then we need to add an anonymous relationship between them
  if (subPatternIdx !== 0 && !elementIsRelationship && !prevIsRelationship) {
    subPattern += `-[]-`;
  }

  if (elementIsRelationship) {
    if (element.direction === Direction.OUTGOING) {
      subPattern += `-[${variable}:${element.name}]->`;
    } else if (element.direction === Direction.INCOMING) {
      subPattern += `<-[${variable}:${element.name}]-`;
    } else {
      subPattern += `-[${variable}]-`;
    }
  } else {
    subPattern += `(${variable}:${element.name})`;
  }

  // We've reached the last element in the pattern
  if (subPatternIdx === patternLength - 1) {
    // If the last element is a relationship, tack on an anonymous node
    if (elementIsRelationship) {
      subPattern += `()`;
    }
  }

  return subPattern;
};

export const createCallBlock = (
  path: SchemaSearchPath,
  withVars: string[],
  extraMatches: string[]
) => {
  const { elements, skip, limit } = path;
  const withVarsSet = new Set(withVars);
  const wherePredicates: string[] = [];
  const variables: string[] = [];
  let matchPattern = "";

  elements.forEach((element, index) => {
    const variable = element.key || "";
    const prevIsRelationship =
      index > 0 ? isRelationshipOption(elements[index - 1]) : false;

    matchPattern += getMatchSubpattern(
      element,
      index,
      prevIsRelationship,
      elements.length
    );

    if (variable !== "") {
      variables.push(variable);
    }

    if (element.filters.length > 0) {
      element.filters.forEach((filter) => {
        const predicate = createPredicate(variable, filter);
        if (predicate !== undefined) {
          wherePredicates.push(predicate);
        }
      });
    }
  });

  return [
    "CALL {",
    withVars.length > 0
      ? `\tWITH ${withVars.join(", ")}`
      : "\t// No previous vars to include in this CALL!",
    `\tMATCH ${matchPattern}`,
    extraMatches.join("\n"),
    `\t${createWhereClause(wherePredicates)}`,
    `\tRETURN ${variables.filter((v) => !withVarsSet.has(v)).join(", ")}`,
    `\tSKIP ${skip || 0}`,
    `\tLIMIT ${limit || 10}`,
    "}",
  ].join("\n");
};

export const createSchemaSearchCypher = (paths: SchemaSearchPath[]) => {
  const nodeKeys = new Set<string>();
  const relationshipKeys = new Set<string>();
  const callBlocks: string[] = [];
  const allSubsequentPathMatches =
    paths.length > 1
      ? paths.slice(1).reduce((matches: string[], path) => {
          let matchClause = "\tMATCH ";

          path.elements.forEach((element, index) => {
            const prevIsRelationship =
              index > 0
                ? isRelationshipOption(path.elements[index - 1])
                : false;

            matchClause += getMatchSubpattern(
              element,
              index,
              prevIsRelationship,
              path.elements.length
            );
          });
          return matches.concat([matchClause]);
        }, [])
      : [];

  paths.forEach((path) => {
    const keysRelatedToCurrentPath = new Set<string>(
      path.elements
        .filter((el) => el.key !== undefined)
        .map((el) => el.key as string)
    );
    const extraMatches =
      allSubsequentPathMatches.length > 0
        ? allSubsequentPathMatches.filter((_, index) => {
            const subsequentPathKeys = new Set(
              paths[
                index + (paths.length - allSubsequentPathMatches.length)
              ].elements
                .filter((el) => el.key !== undefined)
                .map((el) => el.key as string)
            );

            // Keep track of keys which are transitively related to the current path, and add paths which contain them
            if (
              Array.from(subsequentPathKeys).filter((key) =>
                keysRelatedToCurrentPath.has(key)
              ).length > 0
            ) {
              subsequentPathKeys.forEach((key) =>
                keysRelatedToCurrentPath.add(key)
              );
              return true;
            } else {
              return false;
            }
          })
        : [];
    allSubsequentPathMatches.shift();
    callBlocks.push(
      createCallBlock(
        path,
        [...Array.from(nodeKeys), ...Array.from(relationshipKeys)],
        extraMatches
      )
    );
    path.elements.forEach((element) => {
      // Consider elements without keys as anonymous (i.e., they won't be returned explicitly)
      if (element.key !== undefined) {
        if (isRelationshipOption(element)) {
          relationshipKeys.add(element.key);
        } else {
          nodeKeys.add(element.key);
        }
      }
    });
  });

  return `${callBlocks.join("\n")}
  RETURN apoc.coll.toSet(apoc.coll.flatten([${Array.from(nodeKeys)
    .map((key) => `collect(${createNodeReprStr(key)})`)
    .join(", ")}])) AS nodes, apoc.coll.toSet(apoc.coll.flatten([${Array.from(
    relationshipKeys
  )
    .map((key) => `collect(${createRelReprStr(key)})`)
    .join(", ")}])) AS relationships
  `;
};
