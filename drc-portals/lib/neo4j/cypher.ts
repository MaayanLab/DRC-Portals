import { CORE_LABELS, OPERATOR_FUNCTIONS } from "./constants";
import { Direction } from "./enums";
import {
  BasePropFilter,
  PathElement,
  PathwayNode,
  PathwayRelationship,
  PredicateFn,
  SearchPath,
  TreeParseResult,
} from "./types";
import {
  createNodeReprStr,
  createPropReprStr,
  createRelReprStr,
  escapeCypherString,
  isPathwayRelationshipElement,
  isRelationshipElement,
} from "./utils";

export const getExpandNodeCypher = (
  hubLabel: string,
  spokeLabel: string,
  direction: string,
  relType: string
) => {
  const relMatch =
    direction === Direction.INCOMING
      ? `<-[r:${relType}]-`
      : `-[r:${relType}]->`;
  return [
    `MATCH (n:${escapeCypherString(
      hubLabel
    )})${relMatch}(m:${escapeCypherString(spokeLabel)})`,
    `WHERE n._uuid = $nodeId`,
    `WITH DISTINCT m, r`,
    "LIMIT $limit",
    `RETURN DISTINCT collect(DISTINCT ${createNodeReprStr(
      "m"
    )}) AS nodes, collect(DISTINCT ${createRelReprStr("r")}) AS relationships`,
  ].join("\n");
};

export const getOutgoingRelsCypher = (hubLabel: string) => `
  MATCH (n:${escapeCypherString(hubLabel)})-[outgoingRel]->(m)
  WHERE n._uuid = $nodeId
  WITH labels(m) AS outgoingLabels, type(outgoingRel) AS outgoingType
  RETURN outgoingLabels, outgoingType, count([outgoingLabels, outgoingType]) AS count
`;

export const getIncomingRelsCypher = (hubLabel: string) => `
  MATCH (n)-[incomingRel]->(m:${escapeCypherString(hubLabel)})
  WHERE m._uuid = $nodeId
  WITH labels(n) AS incomingLabels, type(incomingRel) AS incomingType
  RETURN incomingLabels, incomingType, count([incomingLabels, incomingType]) AS count
`;

export const getSynonymsCypher = () => `
  CALL {
    CALL db.index.fulltext.queryNodes('synonymIdx', $query)
    YIELD node AS s
    RETURN s.name AS synonym
    LIMIT $limit
    UNION ALL
    MATCH (s:Synonym)
    WHERE s.name STARTS WITH $query
    RETURN s.name AS synonym
    ORDER BY size(s.name)
    LIMIT $limit
  }
  RETURN DISTINCT synonym
  ORDER BY size(synonym)
  `;

export const getTermsCypher = () => `
    CALL {
      CALL db.index.fulltext.queryNodes('synonymIdx', $query)
      YIELD node AS s
      MATCH (s)<-[:HAS_SYNONYM]-(cvTerm)
      RETURN s.name AS synonym, cvTerm AS cvTerm
      ORDER BY size(s.name)
      LIMIT $limit
      UNION ALL
      MATCH (s:Synonym)<-[:HAS_SYNONYM]-(cvTerm)
      WHERE s.name STARTS WITH $query
      RETURN s.name AS synonym, cvTerm AS cvTerm
      ORDER BY size(s.name)
      LIMIT $limit
    }
    RETURN DISTINCT synonym AS synonym, ${createNodeReprStr("cvTerm")} AS cvTerm
  `;

export const getTermsFromLabelCypher = (label: string) => `
  MATCH (term:${escapeCypherString(label)})
  WITH term.name AS name
  ORDER BY name
  RETURN collect(name) AS names
`;

export const getTermsFromLabelAndNameCypher = (label: string) => `
    CALL {
      CALL db.index.fulltext.queryNodes('synonymIdx', $name)
      YIELD node AS s
      MATCH (s)<-[:HAS_SYNONYM]-(cvTerm:${escapeCypherString(label)})
      RETURN DISTINCT cvTerm.name AS name
      ORDER BY size(cvTerm.name)
      LIMIT $limit
      UNION ALL
      MATCH (s:Synonym)<-[:HAS_SYNONYM]-(cvTerm:${escapeCypherString(label)})
      WHERE s.name STARTS WITH $name
      RETURN DISTINCT cvTerm.name AS name
      ORDER BY size(cvTerm.name)
      LIMIT $limit
    }
    RETURN collect(DISTINCT name) AS names
  `;

export const getSearchCypher = (coreLabels: string[]) => {
  if (coreLabels.length === 0) {
    coreLabels = Array.from(CORE_LABELS);
  }

  return `
    CALL {
      CALL db.index.fulltext.queryNodes('synonymIdx', $query)
      YIELD node AS synonym
      WITH synonym
      LIMIT $synLimit
      MATCH (synonym)<-[:HAS_SYNONYM]-(term)
      RETURN DISTINCT term
      LIMIT $termLimit
    }
    CALL {
      MATCH (dcc:DCC)
      WHERE size($dccAbbrevs) = 0 OR dcc.abbreviation IN $dccAbbrevs
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
        .join(
          "|"
        )})<-[:CONTAINS]-(:Project)<-[:CONTAINS]-(:IDNamespace)<-[:REGISTERED]-(dcc:DCC)
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
  filter: BasePropFilter
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
  element: PathElement,
  elementIdx: number,
  prevIsRelationship: boolean,
  patternLength: number,
  omitLabelOrType = false
) => {
  let subPattern = "";
  const elementIsRelationship = isRelationshipElement(element);
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
  path: SearchPath,
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
      index > 0 ? isRelationshipElement(elements[index - 1]) : false;

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

export const createSchemaSearchCypher = (paths: SearchPath[]) => {
  const nodeKeys = new Set<string>();
  const relationshipKeys = new Set<string>();
  const callBlocks: string[] = [];

  paths.forEach((path, pathIndex) => {
    let nodeCount = 0;
    let edgeCount = 0;
    const newElements: PathElement[] = [];

    path.elements.forEach((element, index) => {
      const elementIsRelationship = isRelationshipElement(element);
      const prevElement = index > 0 ? path.elements[index - 1] : undefined;
      const prevIsRelationship =
        prevElement !== undefined && isRelationshipElement(prevElement);

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
          isRelationshipElement(element) ? `r${++edgeCount}` : `n${++nodeCount}`
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
            ? isRelationshipElement(subsequentPath.elements[elIdx - 1])
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
        if (isRelationshipElement(element)) {
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

export const createPathwaySearchCypher = (treeParseResult: TreeParseResult) => {
  const nodeIds = Array.from(treeParseResult.nodeIds).map(escapeCypherString);
  const relIds = Array.from(treeParseResult.relIds).map(escapeCypherString);
  const allIds = nodeIds.concat(relIds);
  return `
  CALL {
    MATCH
    ${treeParseResult.patterns.join(",\n")}
    RETURN ${allIds.join(", ")}
    LIMIT 1
  }
  WITH ${allIds.join(", ")}
  RETURN
    apoc.coll.toSet(apoc.coll.flatten([
      ${nodeIds
        .map(
          (id) =>
            `collect({uuid: ${id}._uuid, labels: labels(${id}), properties: properties(${id})})`
        )
        .join(", ")}
    ])) AS nodes,
    apoc.coll.toSet(apoc.coll.flatten([
      ${relIds.map(
        (id) =>
          `collect({uuid: ${id}._uuid, type: type(${id}), properties: properties(${id}), startUUID: startNode(${id})._uuid, endUUID: endNode(${id})._uuid})`
      )}
    ])) AS relationships`;
};

export const createConnectionPattern = (
  refNodeId: string,
  label: string,
  type: string,
  direction: Direction
) => {
  return `(${escapeCypherString(refNodeId)})${
    direction === Direction.INCOMING ? "<" : ""
  }-[r:${escapeCypherString(type)}]-${
    direction === Direction.OUTGOING ? ">" : ""
  }(:${escapeCypherString(label)})`;
};

export const getPatternsFromPaths = (
  paths: (PathwayNode | PathwayRelationship)[][]
) => {
  const nodeKeys = new Set<string>();
  const relationshipKeys = new Set<string>();
  const patterns: string[] = [];

  paths.forEach((path) => {
    let pattern = "\t";
    path.forEach((element) => {
      if (isPathwayRelationshipElement(element)) {
        const relKey = escapeCypherString(element.id);
        relationshipKeys.add(relKey);
        pattern += `${
          element.direction === Direction.INCOMING ? "<" : ""
        }-[${relKey}:${element.type}${
          element.props !== undefined && Object.keys(element.props).length > 0
            ? " " + createPropReprStr(element.props)
            : ""
        }]-${element.direction === Direction.OUTGOING ? ">" : ""}`;
      } else {
        const nodeKey = escapeCypherString(element.id);
        nodeKeys.add(nodeKey);
        pattern += `(${nodeKey}:${element.label}${
          element.props !== undefined && Object.keys(element.props).length > 0
            ? " " + createPropReprStr(element.props)
            : ""
        })`;
      }
    });
    patterns.push(pattern);
  });

  return {
    nodeKeys: Array.from(nodeKeys),
    relationshipKeys: Array.from(relationshipKeys),
    patterns,
  };
};

export const createPathwaySearchCountCypher = (
  paths: (PathwayNode | PathwayRelationship)[][]
) => {
  const { nodeKeys, relationshipKeys, patterns } = getPatternsFromPaths(paths);

  return [
    "MATCH",
    patterns.join(",\n"),
    `RETURN ${nodeKeys
      .concat(relationshipKeys)
      .map((key) => `count(DISTINCT ${key}) AS ${key}`)
      .join(", ")}`,
  ].join("\n");
};

export const createPathwaySearchConnectionsCountCypher = (
  paths: (PathwayNode | PathwayRelationship)[][],
  key: string,
  label: string,
  type: string,
  direction: Direction
) => {
  const { patterns } = getPatternsFromPaths(paths);

  return [
    "MATCH",
    ...patterns,
    `(${escapeCypherString(key)})${
      direction === Direction.INCOMING ? "<" : ""
    }-[relConnection:${escapeCypherString(type)}]-${
      direction === Direction.OUTGOING ? ">" : ""
    }(nodeConnection:${escapeCypherString(label)})`,
    "RETURN count(DISTINCT nodeConnection) AS nodeCount, count(DISTINCT relConnection) AS relCount",
  ].join("\n");
};

export const parsePathwayTree = (tree: PathwayNode): TreeParseResult => {
  const patterns: string[] = [];
  const nodeIds = new Set<string>();
  const relIds = new Set<string>();
  const nodes: PathwayNode[] = [];

  const getQueryFromTree = (node: PathwayNode, currentPattern: string) => {
    if (!nodeIds.has(node.id)) {
      nodeIds.add(node.id);
      nodes.push(node);
    }

    if (node.relationshipToParent !== undefined) {
      const escapedRelId = escapeCypherString(node.relationshipToParent.id);
      relIds.add(node.relationshipToParent.id);

      currentPattern += `${
        node.relationshipToParent.direction === Direction.INCOMING ? "<" : ""
      }-[${escapedRelId}:${node.relationshipToParent.type}${
        node.relationshipToParent.props !== undefined &&
        Object.keys(node.relationshipToParent.props).length > 0
          ? " " + createPropReprStr(node.relationshipToParent.props)
          : ""
      }]-${
        node.relationshipToParent.direction === Direction.OUTGOING ? ">" : ""
      }`;
    }

    const escapedNodeId = escapeCypherString(node.id);
    currentPattern += `(${escapedNodeId}:${node.label}${
      node.props !== undefined && Object.keys(node.props).length > 0
        ? " " + createPropReprStr(node.props)
        : ""
    })`;

    if (node.children.length === 0) {
      patterns.push(currentPattern);
    } else if (node.children.length === 1) {
      getQueryFromTree(node.children[0], currentPattern);
    } else {
      patterns.push(currentPattern);
      node.children.forEach((child) => {
        getQueryFromTree(child, `\t\t(${escapedNodeId})`);
      });
    }
  };

  getQueryFromTree(tree, "");

  return {
    patterns,
    nodeIds,
    relIds,
    nodes,
  };
};
