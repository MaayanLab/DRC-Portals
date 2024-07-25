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
  elementIdx: number,
  prevIsRelationship: boolean,
  patternLength: number,
  omitLabelOrType = false
) => {
  let subPattern = "";
  const elementIsRelationship = isRelationshipOption(element);
  const variable = element.key || "";

  // If the first element of the pattern is a relationship, prepend it with an anonymous node
  if (elementIdx === 0 && elementIsRelationship) {
    subPattern += `()`;
  }

  // If the current and previous element are both Relationships, then we need to add an anonymous node between them
  if (elementIsRelationship && prevIsRelationship) {
    subPattern += `()`;
  }

  // If the current and previous element are both Nodes, then we need to add an anonymous relationship between them
  if (elementIdx !== 0 && !elementIsRelationship && !prevIsRelationship) {
    subPattern += `-[]-`;
  }

  const labelOrTypeAnnotation = omitLabelOrType ? "" : `:${element.name}`;

  if (elementIsRelationship) {
    if (element.direction === Direction.OUTGOING) {
      subPattern += `-[${variable}${labelOrTypeAnnotation}]->`;
    } else if (element.direction === Direction.INCOMING) {
      subPattern += `<-[${variable}${labelOrTypeAnnotation}]-`;
    } else {
      subPattern += `-[${variable}]-`;
    }
  } else {
    subPattern += `(${variable}${labelOrTypeAnnotation})`;
  }

  // We've reached the last element in the pattern
  if (elementIdx === patternLength - 1) {
    // If the last element is a relationship, tack on an anonymous node
    if (elementIsRelationship) {
      subPattern += `()`;
    }
  }

  return subPattern;
};

export const createCallBlock = (
  path: SchemaSearchPath,
  knownKeys: Set<string>,
  extraMatches: string[]
) => {
  const { elements, skip, limit } = path;
  const wherePredicates: string[] = [];
  const retVars: string[] = [];
  const withVars: string[] = [];
  const matches: string[] = [];
  let matchPattern = "";

  elements.forEach((element, index) => {
    const variable = element.key || "";
    const varIsKnown = knownKeys.has(variable);
    const varIsAnonymous = element.name.length === 0;
    const prevIsRelationship =
      index > 0 ? isRelationshipOption(elements[index - 1]) : false;

    if (varIsKnown) {
      withVars.push(variable);
    } else if (variable !== "") {
      retVars.push(variable);
    }

    matchPattern += getMatchSubpattern(
      element,
      index,
      prevIsRelationship,
      elements.length,
      varIsAnonymous || varIsKnown
    );

    if (element.filters.length > 0) {
      element.filters.forEach((filter) => {
        const predicate = createPredicate(variable, filter);
        if (predicate !== undefined) {
          wherePredicates.push(predicate);
        }
      });
    }
  });

  matches.push(
    `MATCH ${matchPattern}\n\t${createWhereClause(wherePredicates)}`,
    ...extraMatches
  );

  return [
    "CALL {",
    withVars.length > 0
      ? `\tWITH ${withVars.join(", ")}`
      : "\t// No previous vars to include in this CALL!",
    ...(matches.length > 1
      ? matches.map(
          (match, matchIndex) =>
            matchIndex < matches.length - 1
              ? `\t${match}\n\tWITH DISTINCT ${[...withVars, ...retVars].join(
                  ", "
                )}`
              : `\t${match}` // Last MATCH doesn't need `WITH` because we RETURN on the next line
        )
      : matches.map((match) => `\t${match}`)),
    ``,
    `\tRETURN DISTINCT ${retVars.join(", ")}`,
    `\tSKIP ${skip || 0}`,
    `\tLIMIT ${limit || 10}`,
    "}",
  ].join("\n");
};

export const createSchemaSearchCypher = (paths: SchemaSearchPath[]) => {
  const nodeKeys = new Set<string>();
  const relationshipKeys = new Set<string>();
  const callBlocks: string[] = [];

  // Make sure every element has a key before proceeding, this ensures every entity in the query will have a variable name
  paths.forEach((path, pathIndex) => {
    let nodeCount = 0;
    let edgeCount = 0;
    const newElements: SearchBarOption[] = [];

    path.elements.forEach((element, index) => {
      const elementIsRelationship = isRelationshipOption(element);
      const prevElement = index > 0 ? path.elements[index - 1] : undefined;
      const prevIsRelationship =
        prevElement !== undefined && isRelationshipOption(prevElement);

      // If the first element of the pattern is a relationship, prepend it with an anonymous node
      if (index === 0 && elementIsRelationship) {
        newElements.push({
          name: "",
          filters: [],
          key: `p${pathIndex + 1}n${++nodeCount}`,
        });
      }

      // If the current and previous element are both Relationships, then we need to add an anonymous node between them
      if (elementIsRelationship && prevIsRelationship) {
        newElements.push({
          name: "",
          filters: [],
          key: `p${pathIndex + 1}n${++nodeCount}`,
        });
      }

      // If the current and previous element are both Nodes, then we need to add an anonymous relationship between them
      if (index !== 0 && !elementIsRelationship && !prevIsRelationship) {
        newElements.push({
          name: "",
          filters: [],
          key: `p${pathIndex + 1}r${++edgeCount}`,
          direction: Direction.UNDIRECTED,
        });
      }

      if (element.key === undefined || element.key.length === 0) {
        element.key = `p${pathIndex + 1}${
          isRelationshipOption(element) ? `r${++edgeCount}` : `n${++nodeCount}`
        }`;
        newElements.push(element);
      } else {
        newElements.push(element);
      }

      if (index === path.elements.length - 1) {
        // If the last element is a relationship, tack on an anonymous node
        if (elementIsRelationship) {
          newElements.push({
            name: "",
            filters: [],
            key: `p${pathIndex + 1}n${++nodeCount}`,
          });
        }
      }
    });

    path.elements = newElements;
    console.log(path.elements);
  });

  paths.forEach((path, pathIdx) => {
    const subsequentMatches: string[] = [];
    const tempKnownVars = new Set(
      path.elements.filter((el) => el.key !== undefined).map((el) => el.key)
    );
    paths.slice(pathIdx + 1).forEach((subsequentPath) => {
      let matchPattern = "MATCH ";
      const wherePredicates: string[] = [];
      subsequentPath.elements.forEach((element, elIdx) => {
        const variable = element.key || "";
        const varIsKnown = tempKnownVars.has(variable);
        const varIsAnonymous = element.name.length === 0;
        const prevIsRelationship =
          elIdx > 0
            ? isRelationshipOption(subsequentPath.elements[elIdx - 1])
            : false;

        if (!varIsKnown && variable !== "") {
          tempKnownVars.add(variable);
        }

        matchPattern += getMatchSubpattern(
          element,
          elIdx,
          prevIsRelationship,
          subsequentPath.elements.length,
          varIsAnonymous || varIsKnown
        );

        if (element.filters.length > 0) {
          element.filters.forEach((filter) => {
            const predicate = createPredicate(variable, filter);
            if (predicate !== undefined) {
              wherePredicates.push(predicate);
            }
          });
        }
      });
      subsequentMatches.push(
        matchPattern + `\n${createWhereClause(wherePredicates)}`
      );
    });

    callBlocks.push(createCallBlock(path, nodeKeys, subsequentMatches));

    path.elements.forEach((element) => {
      // Consider elements without keys (it is either undefined or an empty string) as anonymous (i.e., they won't be returned explicitly)
      if (element.key !== undefined && element.key !== "") {
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
