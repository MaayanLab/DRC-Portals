// @ts-ignore
import parser from "lucene-query-parser";
import { int } from "neo4j-driver";
import { v4 } from "uuid";

import { CORE_LABELS } from "../constants/neo4j";
import { OPERATOR_FUNCTIONS } from "../constants/schema-search";
import { Direction } from "../enums/schema-search";
import {
  BasePropertyFilter,
  SchemaSearchPath,
} from "../interfaces/schema-search";
import { PredicateFn, SearchBarOption } from "../types/schema-search";

import { isRelationshipOption } from "./schema-search";

export const inputIsValidLucene = (input: string) => {
  try {
    parser.parse(input);
  } catch {
    return false;
  }
  return true;
};

export const escapeCypherString = (input: string) => {
  // convert any \u0060 to literal backtick, then escape backticks, and finally wrap in single quotes and backticks
  return `\`${input.replace(/\\u0060/g, "`").replace(/`/g, "``")}\``;
};

export const makeParamsWriteable = (params: { [key: string]: any }) => {
  Object.keys(params).forEach((key) => {
    if (typeof params[key] === "number") {
      params[key] = int(params[key]);
    }
  });
  return params;
};

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

export const createNodeOutgoingRelsCypher = () => `
  MATCH (n)-[r_outgoing]->(n_outgoing)
  WHERE id(n) = $node_id
  WITH labels(n_outgoing) AS outgoing_labels, type(r_outgoing) AS outgoing_type
  RETURN outgoing_labels, outgoing_type, count([outgoing_labels, outgoing_type]) AS count
`;

export const createNodeIncomingRelsCypher = () => `
  MATCH (n_incoming)-[r_incoming]->(n)
  WHERE id(n) = $node_id
  WITH labels(n_incoming) AS incoming_labels, type(r_incoming) AS incoming_type
  RETURN incoming_labels, incoming_type, count([incoming_labels, incoming_type]) AS count
`;

export const createSynonymOptionsCypher = () => `
  CALL {
    CALL db.index.fulltext.queryNodes('synonymIdx', $input)
    YIELD node AS s
    RETURN s.name AS synonym
    LIMIT $limit
    UNION ALL
    MATCH (s:Synonym)
    WHERE s.name STARTS WITH $input
    RETURN s.name AS synonym
    ORDER BY size(s.name)
    LIMIT $limit
  }
  RETURN DISTINCT synonym
  ORDER BY size(synonym)
  `;

export const createSynonymSearchCypher = (coreLabels: string[]) => {
  if (coreLabels.length === 0) {
    coreLabels = Array.from(CORE_LABELS);
  }

  return `
  CALL {
    CALL db.index.fulltext.queryNodes('synonymIdx', $searchTerm)
    YIELD node AS synonym
    WITH synonym
    LIMIT $synLimit
    MATCH (synonym)<-[:HAS_SYNONYM]-(term)
    RETURN DISTINCT term
    LIMIT $termLimit
  }
  CALL {
    MATCH (dcc:DCC)
    RETURN dcc
  }
  CALL {
    WITH term, dcc
    MATCH path=(dcc)-[:REGISTERED]->(:IDNamespace)-[:CONTAINS]->(core:${coreLabels
      .map(escapeCypherString)
      .join(
        "|"
      )})<-[:CONTAINS]-(:Collection)-[:IS_SUPERSET_OF*0..]->(:Collection)-[:CONTAINS]->(term)
    WHERE
      core:File OR
      core:Biosample OR
      (
          core:Subject AND
          (size($subjectGenders) = 0 OR core.sex IN $subjectGenders) AND
          (size($subjectRaces) = 0 OR core.race IN $subjectRaces)
      )
    RETURN DISTINCT path
    LIMIT $collectionLimit
    UNION ALL
    WITH term, dcc
    MATCH path=(term)<-[:ASSOCIATED_WITH|TESTED_FOR|SAMPLED_FROM]-(core:${coreLabels
      .map(escapeCypherString)
      .join("|")})<-[:CONTAINS]-(:IDNamespace)<-[:REGISTERED]-(dcc:DCC)
    WHERE
      core:File OR
      core:Biosample OR
      (
          core:Subject AND
          (size($subjectGenders) = 0 OR core.sex IN $subjectGenders) AND
          (size($subjectRaces) = 0 OR core.race IN $subjectRaces)
      )
    RETURN DISTINCT path
    LIMIT $coreLimit
  }
  WITH nodes(path) AS pathNodes, relationships(path) AS pathRels
  UNWIND pathNodes AS n
  UNWIND pathRels AS r
  RETURN
    collect(DISTINCT ${createNodeReprStr("n")}) AS nodes,
    collect(DISTINCT ${createRelReprStr("r")}) AS relationships
  `;
};

export const createPredicate = (
  variableName: string,
  filter: BasePropertyFilter
) => {
  const predicate = OPERATOR_FUNCTIONS.has(filter.operator)
    ? (OPERATOR_FUNCTIONS.get(filter.operator) as PredicateFn)(
        variableName,
        filter.name,
        filter.paramName
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
  const variableName = element.key || "";

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
      subPattern += `-[${variableName}${labelOrTypeAnnotation}]->`;
    } else if (element.direction === Direction.INCOMING) {
      subPattern += `<-[${variableName}${labelOrTypeAnnotation}]-`;
    } else {
      subPattern += `-[${variableName}]-`;
    }
  } else {
    subPattern += `(${variableName}${labelOrTypeAnnotation})`;
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
    const variableName = element.key || "";
    const varIsKnown = knownKeys.has(variableName);
    const varIsAnonymous = element.name.length === 0;
    const prevIsRelationship =
      index > 0 ? isRelationshipOption(elements[index - 1]) : false;

    if (varIsKnown) {
      withVars.push(variableName);
    } else if (variableName !== "") {
      retVars.push(variableName);
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
        const predicate = createPredicate(variableName, filter);
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

      // Make sure every element has a key before proceeding, this ensures every entity in the query will have a variable name
      if (element.key === undefined || element.key.length === 0) {
        element.key = `p${pathIndex + 1}${
          isRelationshipOption(element) ? `r${++edgeCount}` : `n${++nodeCount}`
        }`;
        newElements.push(element);
      } else {
        // Make sure all keys have been escaped to prevent Cypher injections
        element.key = escapeCypherString(element.key);
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

      // Make sure all filter property names have been escaped to prevent Cypher injections
      element.filters.forEach((filter) => {
        filter.name = escapeCypherString(filter.name);
      });
    });

    path.elements = newElements;
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
        const variableName = element.key || "";
        const varIsKnown = tempKnownVars.has(variableName);
        const varIsAnonymous = element.name.length === 0;
        const prevIsRelationship =
          elIdx > 0
            ? isRelationshipOption(subsequentPath.elements[elIdx - 1])
            : false;

        if (!varIsKnown && variableName !== "") {
          tempKnownVars.add(variableName);
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
            const predicate = createPredicate(variableName, filter);
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

export const createExpandNodeCypher = (
  nodeId: string,
  nodeLabel: string,
  direction: Direction,
  relType: string
) => {
  const relMatch =
    direction === Direction.INCOMING
      ? `<-[r:${relType}]-`
      : `-[r:${relType}]->`;
  return [
    `MATCH (n)${relMatch}(m:${nodeLabel})`,
    `WHERE id(n) = ${nodeId}`,
    `WITH DISTINCT m, r`,
    "LIMIT $limit",
    `RETURN DISTINCT collect(DISTINCT ${createNodeReprStr(
      "m"
    )}) AS nodes, collect(DISTINCT ${createRelReprStr("r")}) AS relationships`,
  ].join("\n");
};

export const neo4jSafeUUID = () => {
  let uuid = v4();
  const alphabets = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMOPQRSTUVWXYZ";

  if (/^\d/.test(uuid)) {
    const randomAlphabet =
      alphabets[Math.floor(Math.random() * alphabets.length)];
    uuid = randomAlphabet + uuid.slice(1);
  }

  return uuid.replace(/\-/g, "_");
};
